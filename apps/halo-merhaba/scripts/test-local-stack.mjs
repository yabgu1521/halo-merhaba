// Isolated local integration test. Does not read remote Supabase or DATABASE_URL bindings.
import { spawn, spawnSync } from "node:child_process";
import { randomBytes, createHmac } from "node:crypto";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import assert from "node:assert/strict";
const env = { ...process.env };
for (const key of [
  "DOCKER_HOST",
  "DOCKER_CONTEXT",
  "DOCKER_TLS",
  "DOCKER_TLS_VERIFY",
  "DOCKER_CERT_PATH",
])
  delete env[key];
const prefix = `halo-local-${process.pid}`,
  network = prefix + "-net",
  containers = [];
let server, app, browser, authOrigin, restOrigin;
let phase = "startup";
const docker = (args, input, extra = {}) => {
  const r = spawnSync(
    "docker",
    ["--host=unix:///var/run/docker.sock", ...args],
    {
      env: { ...env, ...extra },
      input,
      encoding: "utf8",
      maxBuffer: 2_000_000,
    },
  );
  if (r.status !== 0)
    throw new Error("Local Docker operation failed during " + phase);
  return r.stdout + (args[0] === "logs" ? r.stderr : "");
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const token = (secret, role) => {
  const b = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
  const part =
    b({ alg: "HS256", typ: "JWT" }) +
    "." +
    b({
      role,
      iss: "halo-local-test",
      aud: "authenticated",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
  return (
    part + "." + createHmac("sha256", secret).update(part).digest("base64url")
  );
};
async function ready(url) {
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(url);
      if (r.status < 500) return;
    } catch {}
    await wait(250);
  }
  throw new Error("Local service did not become ready during " + phase);
}
try {
  docker(["network", "create", "--internal", network]);
  phase = "postgres";
  const pg = prefix + "-pg";
  containers.push(pg);
  docker([
    "run",
    "--detach",
    "--rm",
    "--network",
    network,
    "--name",
    pg,
    "-e",
    "POSTGRES_HOST_AUTH_METHOD=trust",
    "postgres:17-alpine",
  ]);
  for (let i = 0; i < 120; i++) {
    const logs = docker(["logs", pg]);
    if (
      logs.includes("PostgreSQL init process complete; ready for start up.")
    ) {
      const r = spawnSync(
        "docker",
        [
          "--host=unix:///var/run/docker.sock",
          "exec",
          pg,
          "pg_isready",
          "-U",
          "postgres",
        ],
        { env, stdio: "ignore" },
      );
      if (r.status === 0) break;
    }
    await wait(250);
    if (i === 119) throw new Error("PostgreSQL startup timeout");
  }
  const bootstrap = `create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;create function auth.uid() returns uuid language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid $$;grant usage on schema public,auth to anon,authenticated,service_role;`;
  docker(
    ["exec", "-i", pg, "psql", "-U", "postgres", "-v", "ON_ERROR_STOP=1", "-q"],
    bootstrap,
  );
  const jwt = randomBytes(48).toString("hex"),
    anon = token(jwt, "anon"),
    serviceKey = token(jwt, "service_role");
  const auth = prefix + "-auth",
    rest = prefix + "-rest";
  containers.push(auth, rest);
  phase = "auth";
  const authEnv = {
    GOTRUE_JWT_SECRET: jwt,
    GOTRUE_DB_DATABASE_URL: `postgres://postgres@${pg}:5432/postgres?sslmode=disable&search_path=auth`,
  };
  docker(
    [
      "run",
      "--detach",
      "--rm",
      "--network",
      network,
      "--name",
      auth,
      "-p",
      "127.0.0.1:35101:9999",
      "-e",
      "GOTRUE_API_HOST=0.0.0.0",
      "-e",
      "PORT=9999",
      "-e",
      "GOTRUE_API_PORT=9999",
      "-e",
      "API_EXTERNAL_URL=http://127.0.0.1:35103/auth/v1",
      "-e",
      "GOTRUE_SITE_URL=http://127.0.0.1:35104",
      "-e",
      "GOTRUE_DB_DRIVER=postgres",
      "-e",
      "GOTRUE_DB_DATABASE_URL",
      "-e",
      "GOTRUE_JWT_SECRET",
      "-e",
      "GOTRUE_JWT_EXP=3600",
      "-e",
      "GOTRUE_JWT_AUD=authenticated",
      "-e",
      "GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated",
      "-e",
      "GOTRUE_JWT_ADMIN_ROLES=service_role",
      "-e",
      "GOTRUE_DISABLE_SIGNUP=true",
      "-e",
      "GOTRUE_MAILER_AUTOCONFIRM=true",
      "-e",
      "GOTRUE_LOG_LEVEL=error",
      "supabase/gotrue:v2.186.0",
    ],
    undefined,
    authEnv,
  );
  const localOrigin = (name, port) =>
    "http://" +
    JSON.parse(docker(["inspect", name]))[0].NetworkSettings.Networks[network]
      .IPAddress +
    ":" +
    port;
  authOrigin = localOrigin(auth, 9999);
  await ready(authOrigin + "/health");
  phase = "migration";
  docker(
    ["exec", "-i", pg, "psql", "-U", "postgres", "-v", "ON_ERROR_STOP=1", "-q"],
    readFileSync("supabase/migrations/202610160001_halo_leads.sql", "utf8"),
  );
  docker(
    [
      "run",
      "--detach",
      "--rm",
      "--network",
      network,
      "--name",
      rest,
      "-p",
      "127.0.0.1:35102:3000",
      "-e",
      `PGRST_DB_URI=postgres://postgres@${pg}:5432/postgres`,
      "-e",
      "PGRST_DB_SCHEMAS=public",
      "-e",
      "PGRST_DB_ANON_ROLE=anon",
      "-e",
      "PGRST_JWT_SECRET",
      "postgrest/postgrest:v14.3",
    ],
    undefined,
    { PGRST_JWT_SECRET: jwt },
  );
  restOrigin = localOrigin(rest, 3000);
  await ready(restOrigin + "/");
  phase = "gateway";
  server = createServer(async (req, res) => {
    try {
      const authPath = req.url.startsWith("/auth/v1"),
        target = `${authPath ? authOrigin : restOrigin}${req.url.replace(authPath ? "/auth/v1" : "/rest/v1", "") || "/"}`;
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const headers = { ...req.headers };
      delete headers.host;
      const response = await fetch(target, {
        method: req.method,
        headers,
        ...(!["GET", "HEAD"].includes(req.method)
          ? { body: Buffer.concat(chunks) }
          : {}),
      });
      res.writeHead(
        response.status,
        Object.fromEntries(
          [...response.headers].filter(
            ([name]) =>
              ![
                "content-encoding",
                "content-length",
                "transfer-encoding",
              ].includes(name),
          ),
        ),
      );
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch {
      res.writeHead(502);
      res.end("Local gateway unavailable");
    }
  });
  await new Promise((resolve) => server.listen(35103, "127.0.0.1", resolve));
  phase = "admin fixture";
  const email = "admin@example.invalid",
    password = randomBytes(24).toString("base64url");
  const adminResponse = await fetch(
    "http://127.0.0.1:35103/auth/v1/admin/users",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, email_confirm: true }),
    },
  );
  if (!adminResponse.ok) {
    const error = await adminResponse.json();
    const logs = docker(["logs", auth]);
    const errors = logs
      .split("\n")
      .map((line) => {
        try {
          return JSON.parse(line).error || "";
        } catch {
          return "";
        }
      })
      .filter(Boolean)
      .join("; ")
      .replaceAll(jwt, "[secret]")
      .replaceAll(password, "[secret]");
    throw new Error(
      errors +
        ": " +
        "Local admin fixture: HTTP " +
        adminResponse.status +
        " " +
        (error.msg || error.message || error.error_code || "unknown"),
    );
  }
  const user = await adminResponse.json();
  assert.ok(/^[a-f0-9-]{36}$/.test(user.id));
  docker(
    ["exec", "-i", pg, "psql", "-U", "postgres", "-v", "ON_ERROR_STOP=1", "-q"],
    `insert into public.halo_admin_profiles(user_id,is_active)values('${user.id}',true);`,
  );
  phase = "application";
  const appEnv = {
    ...process.env,
    HALO_SITE_URL: "http://127.0.0.1:35104",
    HALO_SUPABASE_URL: "http://127.0.0.1:35103",
    HALO_SUPABASE_PUBLISHABLE_KEY: anon,
    HALO_SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    HALO_RATE_LIMIT_SALT: randomBytes(32).toString("hex"),
  };
  app = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "35104",
    ],
    { env: appEnv, stdio: "ignore" },
  );
  await ready("http://127.0.0.1:35104/id");
  browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const customer = await browser.newPage();
  phase = "lead submission";
  await customer.goto("http://127.0.0.1:35104/id/layanan/konsultasi");
  await customer.getByLabel("Nama", { exact: true }).fill("Test Customer");
  await customer
    .getByLabel("Email", { exact: true })
    .fill("customer@example.invalid");
  await customer
    .getByLabel("Topik konsultasi", { exact: true })
    .fill("Preparation questions");
  await customer
    .getByLabel("Negara saat ini", { exact: true })
    .fill("Indonesia");
  await customer
    .getByLabel("Bahasa pilihan", { exact: true })
    .selectOption("id");
  await customer
    .getByLabel("Cara dihubungi", { exact: true })
    .selectOption("email");
  await customer
    .getByLabel("Penjelasan singkat, tanpa data sensitif", { exact: true })
    .fill("A synthetic non-sensitive integration test.");
  await customer.locator("input[name=consent]").check();
  await customer
    .getByRole("button", { name: "Kirim permintaan", exact: true })
    .waitFor();
  await customer
    .getByRole("button", { name: "Kirim permintaan", exact: true })
    .click();
  await customer.locator(".hm-form-success").waitFor();
  phase = "all intake types";
  const samples = {
    marriage: { nationality: "Indonesia", currentCountry: "Indonesia" },
    documents: { documentCategory: "General", targetCountry: "Türkiye" },
    translation: {
      sourceLanguage: "id",
      targetLanguage: "tr",
      documentType: "General text",
      pages: "2",
      deadline: "2027-01-01",
      certified: "unsure",
    },
    interpreter: {
      eventType: "Meeting",
      mode: "online",
      city: "Online",
      currentCountry: "Indonesia",
      sourceLanguage: "id",
      targetLanguage: "tr",
      plannedDate: "2027-01-01",
      duration: "1",
    },
    course: { level: "a1", preferredLanguage: "id" },
    precheck: {
      nationality: "Indonesia",
      processType: "Preparation",
      documentCategory: "General",
      targetCountry: "Türkiye",
    },
    product_interest: {
      productId: JSON.parse(
        readFileSync("src/content/launch-catalog.json", "utf8"),
      ).products[0].id,
    },
  };
  for (const [kind, answers] of Object.entries(samples)) {
    const r = await fetch("http://127.0.0.1:35104/api/leads", {
      method: "POST",
      headers: {
        Origin: "http://127.0.0.1:35104",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind,
        locale: "id",
        name: "Synthetic " + kind,
        email: "qa@example.invalid",
        whatsapp: "",
        summary: "Non-sensitive integration sample",
        answers,
        consent: true,
        website: "",
      }),
    });
    assert.equal(r.status, 201, kind + " submission");
    assert.equal((await r.json()).stored, true);
  }
  const limited = await fetch("http://127.0.0.1:35104/api/leads", {
    method: "POST",
    headers: {
      Origin: "http://127.0.0.1:35104",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind: "course",
      locale: "id",
      name: "Limit",
      email: "qa@example.invalid",
      whatsapp: "",
      summary: "Non-sensitive limit test",
      answers: samples.course,
      consent: true,
      website: "",
    }),
  });
  assert.equal(limited.status, 429);
  phase = "admin login and persistence";
  const admin = await browser.newPage();
  admin.on("response", (r) => {
    if (r.url().includes("/api/admin/"))
      console.log("Local admin API " + r.request().method() + " " + r.status());
  });
  await admin.goto("http://127.0.0.1:35104/admin");
  await admin.getByLabel("Email admin", { exact: true }).fill(email);
  await admin.getByLabel("Kata sandi", { exact: true }).fill(password);
  await admin.getByRole("button", { name: "Masuk", exact: true }).click();
  await admin.getByRole("button", { name: /Test Customer/ }).click();
  await admin.getByLabel("Status", { exact: true }).selectOption("contacted");
  await admin
    .getByLabel("Catatan internal", { exact: true })
    .fill("Test internal note, not public.");
  await admin
    .getByRole("button", { name: "Simpan perubahan", exact: true })
    .click();
  await admin.getByRole("status").waitFor();
  await admin.reload();
  await admin.getByRole("button", { name: /Test Customer/ }).click();
  assert.equal(
    await admin.getByLabel("Status", { exact: true }).inputValue(),
    "contacted",
  );
  assert.ok(
    await admin
      .getByText("Test internal note, not public.", { exact: true })
      .isVisible(),
  );
  phase = "unauthorized requests";
  assert.equal(
    (await fetch("http://127.0.0.1:35104/api/admin/leads")).status,
    401,
  );
  const direct = await fetch(
    "http://127.0.0.1:35103/rest/v1/halo_leads?select=*",
    { headers: { Authorization: `Bearer ${anon}` } },
  );
  assert.ok([401, 403].includes(direct.status));
  console.log(
    "PASS: isolated real Auth + PostgREST + PostgreSQL: all 8 inquiry types persisted, HTTP rate limit enforced, admin login, list/detail, status/note survived refresh, anonymous API and direct-table access denied.",
  );
} catch (error) {
  console.error(
    "FAIL during " +
      phase +
      ": " +
      (error?.name === "AssertionError"
        ? "assertion failed"
        : String(error?.message || "local integration error").replace(
            /eyJ[A-Za-z0-9_.-]+/g,
            "[redacted]",
          )),
  );
  process.exitCode = 1;
} finally {
  await browser?.close();
  app?.kill();
  if (server) await new Promise((resolve) => server.close(resolve));
  for (const name of containers.reverse()) {
    try {
      docker(["rm", "-f", name]);
    } catch {}
  }
  try {
    docker(["network", "rm", network]);
  } catch {}
}

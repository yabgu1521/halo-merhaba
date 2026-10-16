// Actual Next.js UI against an isolated loopback SDK contract fixture. Not hosted/Auth/RLS proof.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtemp, cp, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";
const root = process.cwd(),
  uid = "10000000-0000-4000-8000-000000000001",
  pid = "20000000-0000-4000-8000-000000000001",
  bid = "20000000-0000-4000-8000-000000000002",
  photo = "30000000-0000-4000-8000-000000000001";
const own = {
  user_id: uid,
  public_id: pid,
  display_name: "TEST Owner",
  date_of_birth: "1990-03-12",
  gender: "man",
  country: "TR",
  city: "Ankara",
  biography: "Isolated browser test only. Books and language learning.",
  discoverable: true,
  completed_at: "2026-10-16T10:00:00Z",
};
const candidate = {
  public_id: bid,
  display_name: "TEST Candidate",
  age: 32,
  gender: "woman",
  country: "ID",
  city: "Bandung",
  biography: "Isolated browser fixture, never a production member.",
  purposes: ["marriage"],
  speaks: ["en", "id"],
  learns: ["tr"],
  interests: ["books"],
  verification: "email",
  photo_id: photo,
  interested: false,
  favorited: false,
  has_match: false,
  context: null,
  looking_for: null,
};
const catalogs = {
  countries: [
    ["TR", "Türkiye"],
    ["ID", "Indonesia"],
  ],
  purposes: [
    ["marriage", "Marriage"],
    ["friendship", "Friendship"],
  ],
  languages: [
    ["tr", "Turkish"],
    ["en", "English"],
    ["id", "Bahasa Indonesia"],
  ],
  interests: [["books", "Books"]],
};
for (const k of Object.keys(catalogs))
  catalogs[k] = catalogs[k].map(([code, label]) => ({
    code,
    labels: { en: label, tr: label, id: label },
    active: true,
  }));
let api,
  app,
  browser,
  context,
  page,
  dir,
  prefs = null,
  saved = null;
const requests = [];
const origin = "http://127.0.0.1:3216";
before(async () => {
  const image = await sharp({
    create: { width: 100, height: 100, channels: 3, background: "#809080" },
  })
    .webp()
    .toBuffer();
  api = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://fixture");
      let text = "";
      for await (const b of req) text += b;
      const args = text ? JSON.parse(text) : {};
      const reply = (x, status = 200) => {
        res.writeHead(status, { "content-type": "application/json" });
        res.end(JSON.stringify(x));
      };
      if (url.pathname === "/auth/v1/user")
        return reply({
          id: uid,
          aud: "authenticated",
          role: "authenticated",
          email: "test@example.test",
          email_confirmed_at: "2026-01-01T00:00:00Z",
          app_metadata: { provider: "email" },
          user_metadata: {},
        });
      if (url.pathname.startsWith("/storage/")) {
        res.writeHead(200, { "content-type": "image/webp" });
        res.end(image);
        return;
      }
      const name = url.pathname.split("/").at(-1);
      if (url.pathname.includes("/rpc/")) {
        requests.push({ name, args });
        if (name === "member_active") return reply(true);
        if (name === "my_matchmaking_preferences") return reply(prefs);
        if (name === "member_context") return reply(null);
        if (["member_profile", "candidate_profile"].includes(name))
          return reply(candidate);
        if (name === "find_candidates") {
          const f = args.filters;
          return reply(f.city && f.city !== "Bandung" ? [] : [candidate]);
        }
        if (name === "save_matchmaking_preferences") {
          prefs = args.payload;
          return reply(null);
        }
        if (name === "save_candidate_search") {
          saved = args.filters;
          return reply(null);
        }
        if (name === "express_interest") {
          candidate.interested = true;
          return reply(false);
        }
        if (name === "set_favorite") {
          candidate.favorited = args.saved;
          return reply(null);
        }
        if (
          name === "my_blocks" ||
          name === "my_matches" ||
          name === "my_interests"
        )
          return reply([]);
        return reply(null);
      }
      let rows = [];
      if (catalogs[name]) rows = catalogs[name];
      if (name === "profiles") rows = [own];
      if (name === "user_purposes") rows = [{ code: "marriage" }];
      if (name === "user_interests") rows = [{ code: "books" }];
      if (name === "user_languages")
        rows = [
          { code: "tr", kind: "speak" },
          { code: "en", kind: "speak" },
        ];
      if (name === "profile_photos")
        rows = [{ id: photo, user_id: uid, storage_path: uid + "/test.webp" }];
      if (name === "member_preferences")
        rows = saved
          ? [
              {
                country: saved.country,
                min_age: saved.min_age,
                max_age: saved.max_age,
                advanced: saved,
              },
            ]
          : [];
      reply(
        req.headers.accept?.includes("vnd.pgrst.object")
          ? rows[0] || null
          : rows,
      );
    } catch {
      res.writeHead(500);
      res.end("{}");
    }
  });
  await new Promise((r) => api.listen(0, "127.0.0.1", r));
  dir = await mkdtemp(join(tmpdir(), "turkindo-candidate-browser-"));
  for (const file of [
    "src",
    "next.config.ts",
    "postcss.config.mjs",
    "tsconfig.json",
    "next-env.d.ts",
    "package.json",
  ])
    await cp(join(root, file), join(dir, file), { recursive: true });
  await symlink(join(root, "node_modules"), join(dir, "node_modules"), "dir");
  const backend = `http://127.0.0.1:${api.address().port}`;
  const env = {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: backend,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "isolated-test-key",
    SUPABASE_SERVICE_ROLE_KEY: "isolated-test-service-key",
    NEXT_PUBLIC_SITE_URL: origin,
  };
  delete env.DATABASE_URL;
  delete env.SUPABASE_ACCESS_TOKEN;
  await new Promise((resolve, reject) => {
    const b = spawn(
      "node",
      [join(root, "node_modules/next/dist/bin/next"), "build", "--webpack"],
      { cwd: dir, env, stdio: "ignore" },
    );
    b.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error("Isolated browser application build failed")),
    );
  });
  app = spawn(
    "node",
    [join(root, "node_modules/next/dist/bin/next"), "start", "--port", "3216"],
    { cwd: dir, env, stdio: "ignore" },
  );
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(origin + "/en")).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  assert.ok(ready);
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  context = await browser.newContext();
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const jwt = [
    { alg: "HS256", typ: "JWT" },
    { sub: uid, aud: "authenticated", role: "authenticated", exp },
    "isolated-only",
  ]
    .map((x) =>
      typeof x === "string"
        ? x
        : Buffer.from(JSON.stringify(x)).toString("base64url"),
    )
    .join(".");
  const session = {
    access_token: jwt,
    refresh_token: "isolated-only",
    expires_at: exp,
    expires_in: 3600,
    token_type: "bearer",
    user: { id: uid, email: "test@example.test" },
  };
  await context.addCookies([
    {
      name: "sb-127-auth-token",
      value:
        "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url"),
      url: origin,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  page = await context.newPage();
});
after(async () => {
  await browser?.close();
  app?.kill();
  if (api) await new Promise((r) => api.close(r));
  if (dir) await rm(dir, { recursive: true, force: true });
});
test("candidate browser: explicit preference form saves privately, resets, and exposes no invented verification", async () => {
  await page.goto(origin + "/en/app/preferences");
  await page.getByRole("checkbox", { name: "Woman", exact: true }).check();
  await page.getByRole("checkbox", { name: "Indonesia", exact: true }).check();
  await page.getByRole("checkbox", { name: "English", exact: true }).check();
  await page.getByLabel("Minimum age", { exact: true }).fill("25");
  await page.getByLabel("Maximum age", { exact: true }).fill("45");
  await page
    .getByRole("button", { name: "Save matchmaking preferences", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Changes saved." })
    .waitFor();
  assert.deepEqual(prefs.genders, ["woman"]);
  assert.deepEqual(prefs.countries, ["ID"]);
  assert.equal(prefs.share_summary, false);
  await page.reload();
  assert.equal(
    await page
      .getByRole("checkbox", { name: "Woman", exact: true })
      .isChecked(),
    true,
  );
  await page
    .getByRole("button", { name: "Reset matchmaking preferences", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Changes saved." })
    .waitFor();
  assert.equal(prefs.genders.length, 0);
  assert.equal(
    await page
      .getByRole("checkbox", { name: "Woman", exact: true })
      .isChecked(),
    false,
  );
});
test("candidate browser: search, advanced filters, saved search and honest empty state work", async () => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(origin + "/en/app/search");
  await page.locator('.filters[data-ready="true"]').waitFor();
  if ((await page.locator(".filters").getAttribute("open")) === null)
    await page.locator(".filters>summary").click();
  assert.equal(await page.locator(".member-card").count(), 1);
  assert.equal(await page.locator(".member-nav>a").count(), 4);
  await page
    .getByRole("textbox", { name: "City", exact: true })
    .fill("Bandung");
  await page.locator(".more-filters>summary").click();
  await page
    .getByRole("checkbox", { name: "With profile photo", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Save this search", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Search preferences saved." })
    .waitFor();
  assert.equal(saved.city, "Bandung");
  assert.equal(saved.with_photo, true);
  await page.reload();
  await page.locator('.filters[data-ready="true"]').waitFor();
  if ((await page.locator(".filters").getAttribute("open")) === null)
    await page.locator(".filters>summary").click();
  assert.equal(
    await page.getByRole("textbox", { name: "City", exact: true }).inputValue(),
    "Bandung",
  );
  if ((await page.locator(".filters").getAttribute("open")) === null)
    await page.locator(".filters>summary").click();
  await page
    .getByRole("textbox", { name: "City", exact: true })
    .fill("Elsewhere");
  await page
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  await page
    .getByRole("heading", {
      name: "No candidates match these choices yet.",
      exact: true,
    })
    .waitFor();
  assert.equal(await page.locator(".member-card").count(), 0);
  await page
    .locator(".smart-empty")
    .getByRole("link", { name: "Clear search filters", exact: true })
    .click();
  await page.locator(".member-card").waitFor();
  assert.ok(
    requests.some(
      (x) =>
        x.name === "find_candidates" && x.args.filters.city === "Elsewhere",
    ),
  );
});
test("candidate browser: localized profiles/discovery fit phone, tablet and desktop without runtime errors", async () => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const locale of ["en", "tr", "id"])
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(origin + `/${locale}/app/discover?reset=1`);
      assert.equal(await page.locator(".member-card").count(), 1);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      assert.equal(await page.locator(".card-trust").count(), 1);
      assert.equal(
        await page.getByText("Identity verified", { exact: true }).count(),
        0,
      );
    }
  await page.goto(origin + "/en/app/members/" + bid);
  assert.equal(
    await page
      .getByRole("heading", { name: "What I am looking for", exact: true })
      .count(),
    1,
  );
  assert.equal(
    await page.getByRole("button", { name: "Message", exact: true }).count(),
    0,
    "no message action before a match",
  );
  const completed = own.completed_at;
  try {
    own.completed_at = null;
    await page.goto(origin + "/en/app/preferences");
    await page.waitForURL("**/en/app/onboarding");
  } finally {
    own.completed_at = completed;
  }
  assert.deepEqual(errors, []);
});

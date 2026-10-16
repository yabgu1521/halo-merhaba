import { requireRemoteSchema } from "../../scripts/remote-schema.mjs";
// Opt-in, real Supabase-backed two-TEST-account journey. Never uses production seeds.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
if (process.env.RUN_REMOTE_MEMBER_TESTS !== "1")
  throw new Error("Explicit remote member test opt-in required.");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !secret) throw new Error("Remote bindings unavailable.");
const options = {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: async (input, init) => {
      try {
        return await fetch(input, {
          ...init,
          redirect: "error",
          signal: AbortSignal.timeout(12000),
        });
      } catch {
        throw new Error("Provider unavailable");
      }
    },
  },
};
const admin = createClient(url, secret, options),
  accounts = [],
  origin = "http://127.0.0.1:3196";
let server, browser;
const check = (error, operation) =>
  assert.ok(!error, operation + " must succeed");
async function rpc(db, name, args = {}) {
  const r = await db.rpc(name, args);
  check(r.error, name);
  return r.data;
}
async function api(page, body) {
  return page.evaluate(async (body) => {
    const r = await fetch("/api/member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: r.status, data: await r.json() };
  }, body);
}
// Native HTTP guard deliberately precedes hooks and all fixture creation.
await requireRemoteSchema({
  origin: url,
  serviceKey: secret,
  tables: ["profiles", "favorites", "conversations", "messages"],
});
before(async () => {
  server = spawn(
    "node",
    [
      "--use-env-proxy",
      "node_modules/next/dist/bin/next",
      "start",
      "--port",
      "3196",
    ],
    { env: { ...process.env, NEXT_PUBLIC_SITE_URL: origin }, stdio: "ignore" },
  );
  let ready = false;
  for (let n = 0; n < 100; n++) {
    try {
      if ((await fetch(origin + "/en/auth/login")).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  assert.ok(ready, "Test application ready");
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
      (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    args: ["--no-sandbox"],
  });
  for (let i = 0; i < 2; i++) {
    const email = `codex-test-${randomUUID()}@example.test`,
      password = `Aa9!-${randomUUID()}`,
      name = `TEST ${i === 0 ? "Türkiye" : "Indonesia"} ${randomUUID().slice(0, 8)}`;
    const link = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: { data: { adult_confirmed: true } },
    });
    check(link.error, "Admin-issued signup");
    assert.ok(link.data.user?.id, "New TEST identity");
    const account = {
      id: link.data.user.id,
      email,
      password,
      name,
      db: createClient(url, key, options),
    };
    accounts.push(account);
    check(
      (
        await account.db.auth.verifyOtp({
          type: "signup",
          token_hash: link.data.properties.hashed_token,
        })
      ).error,
      "Signup token verification",
    );
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    account.context = context;
    account.page = await context.newPage();
  }
});
after(async () => {
  await browser?.close();
  server?.kill();
  for (const a of accounts) {
    await a.db.auth.signOut();
    const files = await admin.storage.from("profile-photos").list(a.id);
    if (files.data?.length)
      check(
        (
          await admin.storage
            .from("profile-photos")
            .remove(files.data.map((f) => `${a.id}/${f.name}`))
        ).error,
        "TEST object cleanup",
      );
    check(
      (await admin.auth.admin.deleteUser(a.id)).error,
      "TEST identity cleanup",
    );
  }
});
async function expandFilters(page) {
  await page.locator('.filters[data-ready="true"]').waitFor();
  if ((await page.locator(".filters").getAttribute("open")) === null)
    await page.locator(".filters summary").click();
}
async function onboard(a, country) {
  const page = a.page;
  await page.goto(origin + "/en/auth/login");
  await page.getByLabel("Email address", { exact: true }).fill(a.email);
  await page.getByLabel("Password", { exact: true }).fill(a.password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.waitForURL("**/en/app/onboarding");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Display name", { exact: true }).fill(a.name);
  await page
    .getByLabel("Date of birth · private", { exact: false })
    .fill("1990-03-12");
  await page.getByLabel("Country", { exact: false }).selectOption(country);
  await page
    .getByLabel("City", { exact: true })
    .fill(country === "TR" ? "Ankara" : "Bandung");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Friendship", { exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("group", { name: "I speak", exact: true })
    .getByLabel(country === "TR" ? "Turkish" : "Bahasa Indonesia", {
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Books", { exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("About me", { exact: false })
    .fill("Temporary TEST account for authorized remote journey checks only.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const image = await sharp({
    create: { width: 200, height: 200, channels: 3, background: "#809080" },
  })
    .jpeg()
    .toBuffer();
  await page
    .locator("input[type=file]")
    .setInputFiles({ name: "test.jpg", mimeType: "image/jpeg", buffer: image });
  await page.getByRole("button", { name: "Upload photo", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Changes saved." })
    .waitFor();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel(
      "I have read the safety guidance and agree to respect other members.",
      { exact: true },
    )
    .check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("heading", { name: "Ready to connect", exact: true })
    .waitFor();
  const profile = await a.db.from("profiles").select("public_id").single();
  check(profile.error, "Own profile");
  a.pid = profile.data.public_id;
}
test("REMOTE MEMBER: two verified TEST accounts log in, onboard and upload processed private photos", async () => {
  await onboard(accounts[0], "TR");
  await onboard(accounts[1], "ID");
  for (const a of accounts) {
    await a.page.reload();
    await a.page.goto(origin + "/en/app/profile");
    await a.page
      .getByLabel("City", { exact: true })
      .fill(a === accounts[0] ? "İzmir" : "Jakarta");
    await a.page
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await a.page
      .getByRole("status")
      .filter({ hasText: "Changes saved." })
      .waitFor();
  }
});
test("REMOTE MEMBER: real filtered discovery, favorites and preferences persist", async () => {
  const [a, b] = accounts;
  await a.page.goto(origin + "/en/app/discover");
  await expandFilters(a.page);
  await a.page.getByLabel("Display name", { exact: true }).fill(b.name);
  await a.page
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  const card = a.page.locator(".member-card").filter({ hasText: b.name });
  await card.waitFor();
  assert.equal(await a.page.locator(".member-card").count(), 1);
  await card.getByRole("button", { name: "Save member", exact: true }).click();
  await card
    .getByRole("button", { name: "Remove favorite", exact: true })
    .waitFor();
  await a.page.goto(origin + "/en/app/favorites");
  await a.page.locator(".member-card").filter({ hasText: b.name }).waitFor();
  await a.page.goto(origin + "/en/app/discover");
  await expandFilters(a.page);
  await a.page.getByLabel("Country", { exact: false }).selectOption("ID");
  await a.page
    .getByRole("button", { name: "Save search preferences", exact: true })
    .click();
  await a.page
    .getByRole("status")
    .filter({ hasText: "Search preferences saved." })
    .waitFor();
  await a.page.reload();
  assert.equal(
    await a.page.getByLabel("Country", { exact: false }).inputValue(),
    "ID",
  );
});
test("REMOTE MEMBER: reciprocal likes create one match and both participants can message/reply", async () => {
  const [a, b] = accounts;
  await a.page.goto(`${origin}/en/app/members/${b.pid}`);
  await a.page.getByRole("button", { name: "Interested", exact: true }).click();
  await a.page
    .getByRole("button", { name: "Interest sent", exact: true })
    .waitFor();
  await b.page.goto(`${origin}/en/app/members/${a.pid}`);
  await b.page.getByRole("button", { name: "Interested", exact: true }).click();
  await b.page
    .getByRole("button", { name: "Interest sent", exact: true })
    .waitFor();
  for (const [self, other] of [
    [a, b],
    [b, a],
  ]) {
    await self.page.goto(origin + "/en/app/matches");
    await self.page
      .locator(".member-card")
      .filter({ hasText: other.name })
      .waitFor();
    await self.page
      .locator(".member-card")
      .filter({ hasText: other.name })
      .getByRole("button", { name: "Message", exact: true })
      .click();
    await self.page.waitForURL("**/en/app/messages/*");
    self.conversation = self.page.url().split("/").at(-1);
  }
  assert.equal(a.conversation, b.conversation);
  await a.page
    .getByLabel("Your message", { exact: true })
    .fill("Hello from TEST A");
  await a.page
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  await a.page.getByText("Hello from TEST A", { exact: true }).waitFor();
  await b.page.reload();
  await b.page.getByText("Hello from TEST A", { exact: true }).waitFor();
  await b.page
    .getByLabel("Your message", { exact: true })
    .fill("Reply from TEST B");
  await b.page
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  await b.page.getByText("Reply from TEST B", { exact: true }).waitFor();
  await a.page.reload();
  await a.page.getByText("Reply from TEST B", { exact: true }).waitFor();
});
test("REMOTE MEMBER: unread/read transitions and private Storage permissions remain enforced", async () => {
  const [a, b] = accounts;
  await a.page.goto(origin + "/en/app/account");
  await b.page.goto(origin + "/en/app/account");
  await rpc(a.db, "send_message", {
    conversation: a.conversation,
    message_body: "Unread TEST marker",
    request_id: randomUUID(),
  });
  let rows = await rpc(b.db, "list_conversations");
  assert.equal(rows.find((x) => x.id === a.conversation).unread, true);
  const thread = await rpc(b.db, "read_thread", {
      conversation: a.conversation,
    }),
    last = thread.messages.at(-1);
  assert.equal(last.body, "Unread TEST marker");
  await rpc(b.db, "mark_conversation_read", {
    conversation: a.conversation,
    through_id: last.id,
  });
  rows = await rpc(b.db, "list_conversations");
  assert.equal(rows.find((x) => x.id === a.conversation).unread, false);
  const bucket = await admin.storage.getBucket("profile-photos");
  check(bucket.error, "Private bucket");
  assert.equal(bucket.data.public, false);
  const photo = await b.db
    .from("profile_photos")
    .select("storage_path")
    .single();
  check(photo.error, "Own photo metadata");
  const path = photo.data.storage_path;
  check(
    (await b.db.storage.from("profile-photos").download(path)).error,
    "Owner photo read",
  );
  assert.ok((await a.db.storage.from("profile-photos").download(path)).error);
  assert.ok(
    (await a.db.storage.from("profile-photos").createSignedUrl(path, 60)).error,
  );
  const anon = createClient(url, key, options);
  assert.ok((await anon.storage.from("profile-photos").download(path)).error);
  const image = await sharp({
    create: { width: 4, height: 4, channels: 3, background: "#808080" },
  })
    .webp()
    .toBuffer();
  assert.ok(
    (
      await a.db.storage
        .from("profile-photos")
        .upload(`${a.id}/${randomUUID()}.webp`, image, {
          contentType: "image/webp",
        })
    ).error,
  );
  assert.ok(
    !(await fetch(`${url}/storage/v1/object/public/profile-photos/${path}`)).ok,
  );
});
test("REMOTE MEMBER: owner privacy, cross-user modification, anonymous conversation/photo access and underage data are rejected", async () => {
  const [a, b] = accounts;
  assert.equal(
    (await a.db.from("profiles").select("*").eq("user_id", b.id)).data.length,
    0,
  );
  assert.ok(
    (
      await a.db
        .from("profiles")
        .update({ display_name: "Forbidden" })
        .eq("user_id", b.id)
    ).error,
  );
  assert.ok(
    (await a.db.from("likes").insert({ sender: b.id, recipient: a.id })).error,
  );
  assert.ok(
    (await a.db.from("blocks").insert({ actor: b.id, target: a.id })).error,
  );
  assert.ok((await a.db.from("account_security").select("*")).error);
  const anon = createClient(url, key, options);
  assert.ok(
    (await anon.rpc("read_thread", { conversation: a.conversation })).error,
  );
  const own = await a.db.from("profiles").select("*").single();
  const purposes = await a.db.from("user_purposes").select("code");
  const result = await a.db.rpc("save_profile", {
    payload: {
      ...own.data,
      date_of_birth: "2020-01-01",
      purposes: purposes.data.map((p) => p.code),
      speaks: ["tr"],
      learns: [],
      interests: ["books"],
    },
  });
  assert.ok(result.error);
  await b.page.goto(origin + "/en/app/profile");
  await b.page
    .getByLabel("Show my profile in discovery", { exact: false })
    .uncheck();
  await b.page
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await b.page
    .getByRole("status")
    .filter({ hasText: "Changes saved." })
    .waitFor();
  const rows = await rpc(a.db, "search_members", { name_filter: b.name });
  assert.ok(!rows.some((p) => p.public_id === b.pid));
  const photo = await b.db.from("profile_photos").select("id").single();
  assert.equal(
    (await fetch(`${origin}/api/photos/${photo.data.id}`)).status,
    404,
  );
});
test("REMOTE MEMBER: reporting is confidential and a block prevents all further interaction", async () => {
  const [a, b] = accounts;
  await a.page.goto(`${origin}/en/app/members/${b.pid}`);
  const report = await api(a.page, {
    action: "report",
    id: b.pid,
    category: "spam",
    notes: "Authorized TEST report; not a real allegation.",
  });
  assert.equal(report.status, 200);
  assert.equal((await b.db.from("reports").select("*")).data.length, 0);
  assert.equal((await api(a.page, { action: "block", id: b.pid })).status, 200);
  assert.ok(
    (
      await b.db.rpc("send_message", {
        conversation: b.conversation,
        message_body: "Must be denied",
        request_id: randomUUID(),
      })
    ).error,
  );
  assert.ok(
    (await b.db.rpc("read_thread", { conversation: b.conversation })).error,
  );
  assert.ok((await b.db.rpc("express_interest", { profile_id: a.pid })).error);
  assert.equal((await rpc(a.db, "my_matches")).length, 0);
  assert.equal((await rpc(a.db, "favorite_members")).length, 0);
});

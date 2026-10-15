import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { chromium, type Browser, type Page } from "playwright";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
try {
  process.loadEnvFile(".env.local");
} catch {}
const backend = process.env.NEXT_PUBLIC_SUPABASE_URL!;
if (!backend || !["localhost", "127.0.0.1"].includes(new URL(backend).hostname))
  throw new Error("Browser integration tests require local Supabase.");
const admin = createClient(backend, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  }),
  origin = "http://127.0.0.1:3198";
let server: ReturnType<typeof spawn>, browser: Browser;
const created: string[] = [];
const address = `browser-${randomUUID()}@example.test`,
  password = `T-${randomUUID()}-z`;
async function emailLink(email: string) {
  for (let n = 0; n < 60; n++) {
    const result = await fetch(
      `http://127.0.0.1:54324/api/v1/search?query=${encodeURIComponent("to:" + email)}`,
    );
    const list = await result.json();
    const id = list.messages?.[0]?.ID;
    if (id) {
      const message = await (
        await fetch(`http://127.0.0.1:54324/api/v1/message/${id}`)
      ).json();
      const links = [...(message.HTML || "").matchAll(/href="([^"]+)"/g)].map(
        (m) => m[1].replaceAll("&amp;", "&"),
      );
      const url = links.find((u) => u.includes("/auth/v1/verify"));
      assert.ok(url);
      assert.equal(new URL(url).hostname, "127.0.0.1");
      return url;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Expected local verification/reset email was not delivered");
}
async function formPost(page: Page, url: string, body: unknown) {
  return page.evaluate(
    async ({ url, body }) => {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return { status: r.status, data: await r.json() };
    },
    { url, body },
  );
}
before(async () => {
  server = spawn(
    "node",
    ["node_modules/next/dist/bin/next", "start", "--port", "3198"],
    { env: { ...process.env, NEXT_PUBLIC_SITE_URL: origin }, stdio: "pipe" },
  );
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(origin + "/en/auth/signup")).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  assert.ok(ready, "Test application must become ready");
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
      (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    args: ["--no-sandbox"],
  });
});
after(async () => {
  await browser?.close();
  server?.kill();
  for (const id of created) {
    const { data } = await admin.storage.from("profile-photos").list(id);
    if (data?.length)
      await admin.storage
        .from("profile-photos")
        .remove(data.map((p) => `${id}/${p.name}`));
    await admin.auth.admin.deleteUser(id);
  }
});
test("real signup, email verification, guided onboarding, safe photo, profile privacy and logout", async () => {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(origin + "/en/auth/signup");
  await page.getByLabel("Email address", { exact: true }).fill(address);
  await page.getByLabel("Password", { exact: true }).fill(password);
  const missing = await formPost(page, "/api/auth", {
    action: "signup",
    locale: "en",
    email: address,
    password,
    adult: false,
  });
  assert.equal(missing.status, 400);
  await page
    .getByLabel("I confirm that I am at least 18 years old.", { exact: true })
    .check();
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "an email is on its way" })
    .waitFor();
  const users = await admin.auth.admin.listUsers();
  const user = users.data.users.find((u) => u.email === address);
  assert.ok(user);
  created.push(user.id);
  assert.ok(!user.email_confirmed_at);
  await page.goto(await emailLink(address));
  await page.waitForURL("**/en/app/onboarding");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Display name", { exact: true }).fill("Aylin Test");
  await page
    .getByLabel("Date of birth · private", { exact: true })
    .fill("1992-04-12");
  await page.getByLabel("Country", { exact: true }).selectOption("TR");
  await page.getByLabel("City", { exact: true }).fill("İzmir");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Friendship", { exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("group", { name: "I speak", exact: true })
    .getByLabel("Turkish", { exact: true })
    .check();
  await page
    .getByRole("group", { name: "I am learning", exact: true })
    .getByLabel("Bahasa Indonesia", { exact: true })
    .check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Books", { exact: true }).check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("About me", { exact: true })
    .fill(
      "Fictional member interested in books, language and cultural friendship.",
    );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  const bad = await page.evaluate(async () => {
    const f = new FormData();
    f.set("photo", new File(["<svg/>"], "photo.png", { type: "image/png" }));
    const r = await fetch("/api/photos", { method: "POST", body: f });
    return r.status;
  });
  assert.equal(bad, 400);
  const image = await sharp({
    create: { width: 400, height: 400, channels: 3, background: "#b28b67" },
  })
    .jpeg()
    .toBuffer();
  await page.locator("input[type=file]").setInputFiles({
    name: "my-photo.jpg",
    mimeType: "image/jpeg",
    buffer: image,
  });
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
  assert.equal(await page.locator("progress").getAttribute("value"), "100");
  await page
    .getByRole("link", { name: "Discover", exact: true })
    .last()
    .click();
  await page.waitForURL("**/en/app/discover");
  for (const locale of ["en", "tr", "id"])
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${origin}/${locale}/app/discover`);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      assert.equal(await page.locator("html").getAttribute("lang"), locale);
    }
  await page.goto(origin + "/en/app/profile");
  await page.getByLabel("City", { exact: true }).fill("Ankara");
  await page
    .getByLabel("Show my profile in discovery", { exact: false })
    .uncheck();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Changes saved." })
    .waitFor();
  const profile = await admin
    .from("profiles")
    .select("city,discoverable")
    .eq("user_id", user.id)
    .single();
  assert.equal(profile.data?.city, "Ankara");
  assert.equal(profile.data?.discoverable, false);
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await page.waitForURL("**/en");
  await page.goto(origin + "/en/app/discover");
  await page.waitForURL("**/en/auth/login");
  await page.close();
});
test("login, email password reset and session invalidation", async () => {
  const page = await browser.newPage();
  await page.goto(origin + "/en/auth/login");
  await page.getByLabel("Email address", { exact: true }).fill(address);
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.getByRole("alert").waitFor();
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.waitForURL("**/en/app/discover");
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await page.waitForURL("**/en");
  // Delete the earlier message so this lookup must use the newly delivered reset link.
  const messages = await (
    await fetch(
      `http://127.0.0.1:54324/api/v1/search?query=${encodeURIComponent("to:" + address)}`,
    )
  ).json();
  for (const m of messages.messages || [])
    await fetch(`http://127.0.0.1:54324/api/v1/message/${m.ID}`, {
      method: "DELETE",
    });
  await page.goto(origin + "/en/auth/forgot");
  await page.getByLabel("Email address", { exact: true }).fill(address);
  await page.getByRole("button", { name: "Send email", exact: true }).click();
  await page.getByRole("status").waitFor();
  await page.goto(await emailLink(address));
  await page.waitForURL("**/en/auth/reset");
  const nextPassword = `Z-${randomUUID()}`;
  await page.getByLabel("Password", { exact: true }).fill(nextPassword);
  await page
    .getByRole("button", { name: "Set a new password", exact: true })
    .click();
  await page.waitForURL("**/en/auth/login?notice=passwordChanged");
  await page.getByLabel("Email address", { exact: true }).fill(address);
  await page.getByLabel("Password", { exact: true }).fill(nextPassword);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await page.waitForURL("**/en/app/discover");
  const hostile = await fetch(origin + "/api/member", {
    method: "POST",
    headers: {
      Origin: "https://hostile.example",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "complete", safety: true }),
  });
  assert.equal(hostile.status, 403);
  await page.close();
});

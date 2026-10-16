import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
const origin = process.env.HALO_TEST_ORIGIN || "http://127.0.0.1:3300";
test(
  "all localized routes, responsive layouts, metadata, language switch and honest form fallback",
  { timeout: 180000 },
  async () => {
    const browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      headless: true,
      args: ["--no-sandbox"],
    });
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const xml = await (await fetch(origin + "/sitemap.xml")).text();
      const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
        (m) => new URL(m[1]).pathname,
      );
      assert.equal(urls.length, 46);
      urls.push("/id/privasi", "/id/ketentuan", "/tr/privasi", "/tr/ketentuan");
      for (const width of [375, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const url of urls) {
          const r = await page.goto(origin + url);
          assert.equal(r.status(), 200, url);
          assert.equal(await page.locator("h1").count(), 1, url);
          assert.equal(
            await page.locator("html").getAttribute("lang"),
            url.split("/")[1],
          );
          assert.ok(
            await page.locator("link[rel=canonical]").getAttribute("href"),
          );
          assert.ok(await page.locator('meta[property="og:image"]').count());
          assert.equal(await page.locator("input[type=file]").count(), 0);
          for (const id of await page
            .locator("[aria-describedby]")
            .evaluateAll((nodes) =>
              nodes.flatMap((node) =>
                (node.getAttribute("aria-describedby") || "").split(" "),
              ),
            )) {
            assert.equal(
              await page.locator(`[id="${id}"]`).count(),
              1,
              `missing field help ${url} ${id}`,
            );
          }
          if (url.endsWith("/kontak")) {
            assert.equal(
              await page.locator(".hm-contact-channels article").count(),
              1,
              "only the configured Instagram channel is shown in an unconfigured test build",
            );
          }
          if (url.endsWith("/tentang")) {
            assert.equal(
              await page
                .locator("[data-content-slot=team-photo]")
                .getAttribute("aria-hidden"),
              "true",
            );
            assert.equal(
              await page
                .locator(
                  "[data-content-slot=team-photo] strong,[data-content-slot=team-photo] p",
                )
                .count(),
              0,
              "no public placeholder instructions",
            );
          }
          assert.equal(
            await page.locator('a[download],a[href$=".pdf"]').count(),
            0,
          );
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
            `overflow ${width} ${url}`,
          );
          for (const json of await page
            .locator('script[type="application/ld+json"]')
            .allTextContents())
            JSON.parse(json);
        }
      }
      await page.goto(origin + "/id");
      const cards = page.locator(".hm-service-card");
      assert.equal(await cards.count(), 6);
      for (const url of await cards.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("href")),
      )) {
        await page.goto(origin + url);
        assert.equal(await page.locator("#request-form form").count(), 1);
        await page.locator('.hm-service-next a[href="#request-form"]').click();
        await page.waitForURL("**#request-form");
      }
      await page.goto(origin + "/id/layanan/konsultasi");
      await page.getByLabel("Nama", { exact: true }).fill("Browser QA");
      await page
        .getByLabel("Email", { exact: true })
        .fill("qa@example.invalid");
      await page
        .getByLabel("Topik konsultasi", { exact: true })
        .fill("Preparation");
      await page
        .getByLabel("Negara saat ini", { exact: true })
        .fill("Indonesia");
      await page
        .getByLabel("Bahasa pilihan", { exact: true })
        .selectOption("id");
      await page
        .getByLabel("Cara dihubungi", { exact: true })
        .selectOption("email");
      await page
        .getByLabel("Penjelasan singkat, tanpa data sensitif", { exact: true })
        .fill("Non-sensitive browser QA only");
      await page.locator("input[name=consent]").check();
      await page.locator("form button.hm-button").click();
      await page.locator(".hm-handoff").waitFor();
      assert.ok(
        (await page.locator(".hm-handoff textarea").inputValue()).includes(
          "Browser QA",
        ),
      );
      assert.equal(await page.locator(".hm-form-success").count(), 0);
      assert.equal(
        await page.locator('a[href^="https://wa.me"]').count(),
        0,
        "unknown number must not generate fake WhatsApp links",
      );
      await page.locator("a[lang=tr]").first().click();
      await page.waitForURL("**/tr/layanan/konsultasi");
      await page.goto(origin + "/admin");
      assert.ok(
        await page
          .getByRole("button", { name: "Masuk", exact: true })
          .isDisabled(),
      );
      assert.deepEqual(errors, []);
      console.log(
        "Verified 50 localized URLs at 3 widths (150 renders), JSON-LD/metadata, no uploads/downloads, fallback and admin-disabled state.",
      );
    } finally {
      await browser.close();
    }
  },
);
test("unconfigured server rejects writes and unauthorized access", async () => {
  const api = await fetch(origin + "/api/admin/leads");
  assert.equal(api.status, 503);
  assert.match(api.headers.get("cache-control"), /no-store/);
  const csrf = await fetch(origin + "/api/leads", {
    method: "POST",
    headers: {
      Origin: "https://untrusted.invalid",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  assert.equal(csrf.status, 403);
  const unconfigured = await fetch(origin + "/api/leads", {
    method: "POST",
    headers: {
      Origin: process.env.HALO_SITE_URL || "http://localhost:3000",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  assert.equal(unconfigured.status, 503);
});

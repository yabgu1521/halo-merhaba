import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
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
      assert.equal(urls.length, 58);
      urls.push("/id/privasi", "/id/ketentuan", "/tr/privasi", "/tr/ketentuan");
      for (const width of [360, 375, 390, 412, 430, 768, 1440]) {
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
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(origin + "/id");
      const menu = page.getByRole("button", { name: "Buka menu", exact: true });
      await menu.click();
      assert.equal(await menu.getAttribute("aria-expanded"), "true");
      assert.ok(await page.locator("#hm-navigation").isVisible());
      await page.keyboard.press("Escape");
      assert.equal(await menu.getAttribute("aria-expanded"), "false");
      assert.ok(await menu.evaluate((node) => node === document.activeElement));
      await menu.click();
      await page.locator('#hm-navigation a[href="/id/layanan"]').click();
      await page.waitForURL("**/id/layanan");
      assert.equal(await menu.getAttribute("aria-expanded"), "false");
      assert.equal(
        await page
          .locator('#hm-navigation a[href="/id/layanan"]')
          .getAttribute("aria-current"),
        "page",
      );
      // Reveal effects must not hide cards recreated by existing search/filter controls.
      await page.goto(origin + "/id/panduan");
      await page
        .getByRole("button", { name: "Bahasa Turki", exact: true })
        .click();
      assert.equal(await page.locator(".hm-guide-card").count(), 1);
      await page.getByRole("button", { name: "Semua", exact: true }).click();
      assert.equal(await page.locator(".hm-guide-card").count(), 5);
      for (let i = 0; i < 5; i++) {
        const selector = `.hm-guide-card:nth-child(${i + 1})`;
        await page.locator(selector).scrollIntoViewIfNeeded();
        await page.waitForFunction(
          (sel) =>
            getComputedStyle(document.querySelector(sel)).opacity === "1",
          selector,
        );
      }
      await page.getByLabel("Cari panduan", { exact: true }).fill("apostille");
      assert.equal(await page.locator(".hm-guide-card").count(), 1);
      await page
        .getByLabel("Cari panduan", { exact: true })
        .fill("no-such-topic-qa");
      assert.ok(await page.locator(".hm-empty").isVisible());
      await page.getByLabel("Cari panduan", { exact: true }).fill("");
      assert.equal(await page.locator(".hm-guide-card").count(), 5);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(origin + "/id");
      assert.equal(
        await page
          .locator(".hm-connection-panel")
          .evaluate((node) => getComputedStyle(node).animationName),
        "none",
      );
      await page.locator(".hm-service-card").first().hover();
      assert.equal(
        await page
          .locator(".hm-service-card")
          .first()
          .evaluate((node) => getComputedStyle(node).transform),
        "none",
      );
      await page.setViewportSize({ width: 1440, height: 900 });
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
      // Vector geometry stays sharp at high DPI and product titles stay in HTML.
      const retina = await browser.newPage({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        reducedMotion: "reduce",
      });
      await retina.goto(origin + "/id");
      assert.equal(await retina.evaluate(() => devicePixelRatio), 3);
      for (const country of ["id", "tr"]) {
        assert.equal(
          await retina
            .locator(`.hm-connection-panel [data-country="${country}"]`)
            .count(),
          1,
        );
        assert.equal(
          await retina
            .locator(`.hm-connection-panel [data-flag="${country}"]`)
            .count(),
          1,
        );
      }
      for (const box of await retina
        .locator(".hm-country-flag")
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const r = node.getBoundingClientRect();
            return { width: r.width, height: r.height };
          }),
        ))
        assert.ok(Math.abs(box.width / box.height - 1.5) < 0.01);
      assert.equal(
        await retina
          .locator(".hm-map-connection")
          .first()
          .evaluate((node) => getComputedStyle(node).animationName),
        "none",
      );
      assert.equal(
        await retina
          .locator(".hm-geographic-motif image,.hm-geographic-motif text")
          .count(),
        0,
      );
      await retina.goto(origin + "/id/digital-guides");
      assert.equal(
        await retina.locator(".hm-product-card .hm-geographic-motif").count(),
        9,
      );
      assert.equal(await retina.locator(".hm-book h2,.hm-book h3").count(), 0);
      assert.equal(await retina.locator(".hm-product-info h3 a").count(), 9);
      for (const link of await retina
        .locator(".hm-product-info h3 a")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("href")),
        )) {
        await retina.goto(origin + link);
        assert.equal(
          await retina
            .locator(".hm-product-detail .hm-geographic-motif")
            .count(),
          1,
        );
        assert.equal(await retina.locator(".hm-product-detail h1").count(), 1);
      }
      for (const [language, status, editions] of [
        [
          "id",
          "Konten selesai — penjualan segera dibuka",
          ["Edisi Bahasa Indonesia — PDF", "Edisi bahasa Turki — PDF"],
        ],
        [
          "tr",
          "İçerik tamamlandı — satış yakında açılacak",
          ["Endonezce sürüm — PDF", "Türkçe sürüm — PDF"],
        ],
      ]) {
        const response = await retina.goto(
          origin + `/${language}/produk/marriage-checklist-wni`,
        );
        assert.ok(
          await retina.getByText(status, { exact: true }).first().isVisible(),
        );
        for (const edition of editions)
          assert.ok(
            await retina.getByText(edition, { exact: true }).isVisible(),
          );
        assert.equal(
          await retina
            .locator('a[href*=".pdf"],a[href*="storage/v1"],a[download]')
            .count(),
          0,
        );
        assert.equal(await retina.locator(".hm-content-module").count(), 4);
        for (const module of await retina.locator(".hm-content-module").all()) {
          await module.locator("summary").click();
          await module.evaluate((node) => (node.open = true));
        }
        assert.equal(await retina.locator(".hm-content-module li").count(), 16);
        assert.equal(
          await retina.locator(".hm-preview-grid figure").count(),
          4,
        );
        const price =
          language === "id" ? "Rp149.000" : "Fiyat yakında açıklanacak";
        assert.ok(
          await retina.getByText(price, { exact: true }).first().isVisible(),
        );
        assert.ok(
          !(await retina.locator("main").innerText()).includes("79 TRY"),
        );
        await retina
          .locator('.hm-marriage-hero a[href="#request-form"]')
          .click();
        assert.ok(await retina.locator("#request-form").isVisible());
        assert.equal(
          await retina
            .locator(
              '.hm-marriage-hero a[href$="/layanan/konsultasi#request-form"]',
            )
            .count(),
          1,
        );
        assert.equal(
          await retina.locator('form input[name="email"]').count(),
          1,
          "existing product-interest form is retained",
        );
        assert.ok(
          !/halo-digital-products|Halo_Merhaba_/.test(await response.text()),
        );
      }
      await retina.close();
      await page.goto(origin + "/admin");
      assert.ok(
        await page
          .getByRole("button", { name: "Masuk", exact: true })
          .isDisabled(),
      );
      assert.deepEqual(errors, []);
      console.log(
        "Verified 62 localized URLs at 7 widths (434 renders), mobile navigation, Escape/focus return, reduced motion, JSON-LD/metadata, no uploads/downloads, fallback and admin-disabled state.",
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

test("private product object identifiers never enter public build artifacts", () => {
  const forbidden = [
    "halo-digital-products",
    "Halo_Merhaba_Menikah_di_Turkiye_Complete_Checklist_ID.pdf",
    "Halo_Merhaba_Turkiyede_Evlilik_Tam_Hazirlik_Rehberi_TR.pdf",
    "Halo_Merhaba_Dokumen_Apostille_Organizer_ID.pdf",
    "Halo_Merhaba_Belge_Apostil_Duzenleyici_TR.pdf",
    "Halo_Merhaba_Turkce_A1_Survival_Pack_ID.pdf",
    "Halo_Merhaba_Turkce_A1_Gunluk_Yasam_Paketi_TR.pdf",
    "Halo_Merhaba_Pertemuan_Keluarga_Indonesia_Turkiye_Toolkit_ID.pdf",
    "Halo_Merhaba_Endonezya_Turkiye_Aile_Tanisma_Rehberi_TR.pdf",
    "/storage/v1/object/public/",
    "/storage/v1/object/sign/",
  ];
  for (const directory of [".next/static", ".next/server/app", "public"]) {
    for (const name of readdirSync(directory, { recursive: true })) {
      if (!/\.(js|html|rsc|json|svg|map|txt)$/.test(String(name))) continue;
      // Only browser-served assets/HTML/RSC: server route code is not a public artifact.
      if (
        directory === ".next/server/app" &&
        !/\.(html|rsc)$/.test(String(name))
      )
        continue;
      const file = path.join(directory, String(name)),
        data = readFileSync(file, "utf8");
      for (const marker of forbidden)
        assert.ok(
          !data.includes(marker),
          `private delivery identifier leaked into ${file}`,
        );
    }
  }
});

test(
  "nine-product storefront, prices, filters, featured links and private access notices",
  { timeout: 60000 },
  async () => {
    const source = JSON.parse(
      readFileSync("src/content/launch-catalog.json", "utf8"),
    );
    const browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    });
    try {
      const page = await browser.newPage({
        viewport: { width: 390, height: 900 },
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      for (const locale of ["id", "tr"]) {
        await page.goto(`${origin}/${locale}/digital-guides`);
        assert.equal(await page.locator(".hm-product-card").count(), 9);
        assert.equal(await page.locator(".hm-product-card-ready").count(), 4);
        assert.equal(await page.locator(".hm-product-card-planned").count(), 5);
        const text = await page.locator("main").innerText();
        assert.ok(!/\bTRY\b/.test(text));
        for (const product of source.products) {
          const card = page.locator(`[data-product-id="${product.id}"]`);
          assert.ok(
            await card
              .getByRole("heading", { name: product.titles[locale] })
              .isVisible(),
          );
          const expected =
            locale === "id"
              ? `Rp${new Intl.NumberFormat("id-ID").format(product.proposed_test_price.amount)}`
              : "Fiyat yakında açıklanacak";
          assert.ok(
            await card.getByText(expected, { exact: true }).isVisible(),
          );
          assert.ok(
            await card
              .getByText(
                product.content_ready
                  ? locale === "id"
                    ? "Konten selesai — penjualan segera dibuka"
                    : "İçerik tamamlandı — satış yakında açılacak"
                  : locale === "id"
                    ? "Sedang disiapkan"
                    : "Hazırlanıyor",
                { exact: true },
              )
              .last()
              .isVisible(),
          );
        }
        assert.equal(
          await page
            .locator(
              `.hm-store-feature a[href="/${locale}/produk/marriage-checklist-wni"]`,
            )
            .count(),
          1,
        );
        assert.ok(
          await page
            .locator(".hm-store-feature")
            .getByText("2 PDF", { exact: false })
            .isVisible(),
        );
        const filters = page.locator(".hm-store-filters button");
        assert.equal(await filters.count(), 6);
        for (const [index, category, count] of [
          [1, "marriage", 3],
          [2, "documents", 2],
          [3, "language", 2],
          [4, "life", 1],
          [5, "guidance", 1],
        ]) {
          await filters.nth(index).click();
          await page.waitForFunction(
            (index) =>
              document
                .querySelectorAll(".hm-store-filters button")
                [index]?.getAttribute("aria-pressed") === "true",
            index,
          );
          assert.equal(
            await filters.nth(index).getAttribute("aria-pressed"),
            "true",
          );
          assert.equal(await page.locator(".hm-product-card").count(), count);
          const expected = source.products
            .filter((p) => p.category === category)
            .map((p) => p.id);
          assert.deepEqual(
            await page
              .locator(".hm-product-card")
              .evaluateAll((nodes) => nodes.map((n) => n.dataset.productId)),
            expected,
          );
        }
        await filters.first().click();
        await page.waitForFunction(
          () => document.querySelectorAll(".hm-product-card").length === 9,
        );
        assert.equal(await page.locator(".hm-product-card").count(), 9);
        await page.locator(".hm-store-feature a").click();
        await page.waitForURL(`**/${locale}/produk/marriage-checklist-wni`);
        assert.equal(
          new URL(page.url()).pathname,
          `/${locale}/produk/marriage-checklist-wni`,
        );
        const notice =
          locale === "id"
            ? "Panduan sudah selesai disiapkan. File PDF disimpan secara privat dan belum dapat diunduh sampai penjualan resmi dibuka."
            : "Rehber tamamlandı. PDF dosyaları özel olarak saklanmaktadır ve resmi satış açılana kadar indirilemez.";
        assert.ok(
          await page.getByText(notice, { exact: false }).first().isVisible(),
        );
        for (const product of source.products) {
          const response = await page.goto(
            `${origin}/${locale}/produk/${product.id}`,
          );
          assert.equal(response.status(), 200);
          assert.equal(
            await page.locator('form input[name="email"]').count(),
            1,
          );
          assert.equal(
            await page
              .locator('a[download],a[href*=".pdf"],a[href*="storage/v1"]')
              .count(),
            0,
          );
          assert.ok(
            !/halo-digital-products|Halo_Merhaba_/.test(await response.text()),
          );
          assert.ok(!/\bTRY\b/.test(await page.locator("main").innerText()));
        }
      }
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);

test(
  "completed document guide package, modules and interest CTA in both languages",
  { timeout: 60000 },
  async () => {
    const browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    });
    try {
      const page = await browser.newPage();
      for (const locale of ["id", "tr"])
        for (const width of [360, 375, 390, 412, 430, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          const response = await page.goto(
            `${origin}/${locale}/produk/document-apostille-organizer`,
          );
          assert.equal(response.status(), 200);
          assert.equal(
            await page.locator(".hm-document-product h1").count(),
            1,
          );
          assert.equal(
            await page
              .locator(".hm-document-product .hm-content-module")
              .count(),
            16,
          );
          assert.equal(
            await page
              .locator(".hm-document-product .hm-tools-list li")
              .count(),
            14,
          );
          for (const edition of locale === "id"
            ? ["Edisi Bahasa Indonesia — PDF", "Edisi bahasa Turki — PDF"]
            : ["Endonezce sürüm — PDF", "Türkçe sürüm — PDF"])
            assert.ok(
              await page.getByText(edition, { exact: true }).isVisible(),
            );
          for (const text of locale === "id"
            ? [
                "19 halaman per edisi",
                "38 halaman dalam paket bilingual",
                "Rp129.000",
              ]
            : [
                "Her sürüm 19 sayfa",
                "İki dilli pakette toplam 38 sayfa",
                "Fiyat yakında açıklanacak",
              ])
            assert.ok(
              await page.getByText(text, { exact: true }).first().isVisible(),
            );
          const notice =
            locale === "id"
              ? "Panduan sudah selesai disiapkan. File PDF disimpan secara privat dan belum dapat diunduh sampai penjualan resmi dibuka."
              : "Rehber tamamlandı. PDF dosyaları özel olarak saklanmaktadır ve resmi satış açılana kadar indirilemez.";
          assert.ok(
            await page.getByText(notice, { exact: true }).first().isVisible(),
          );
          const module = page.locator(".hm-content-module").nth(1);
          await module.locator("summary").click();
          assert.equal(await module.evaluate((node) => node.open), true);
          assert.ok(await module.locator("p").isVisible());
          await page
            .locator(
              '.hm-document-product .hm-marriage-hero a[href="#request-form"]',
            )
            .click();
          assert.ok(await page.locator("#request-form").isVisible());
          assert.equal(
            await page.locator('form input[name="email"]').count(),
            1,
          );
          assert.equal(
            await page
              .locator(
                'a[download],a[href*=".pdf"],a[href*="storage/v1"],input[type="file"]',
              )
              .count(),
            0,
          );
          assert.ok(
            !/halo-digital-products|Halo_Merhaba_/.test(await response.text()),
          );
          assert.ok(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <= window.innerWidth + 1,
            ),
          );
        }
    } finally {
      await browser.close();
    }
  },
);

test(
  "completed A1 guide package, modules and interest CTA in both languages",
  { timeout: 60000 },
  async () => {
    const browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    });
    try {
      const page = await browser.newPage();
      for (const locale of ["id", "tr"])
        for (const width of [360, 375, 390, 412, 430, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          const response = await page.goto(
            `${origin}/${locale}/produk/turkish-a1-survival`,
          );
          assert.equal(response.status(), 200);
          assert.equal(await page.locator(".hm-a1-product h1").count(), 1);
          assert.equal(
            await page.locator(".hm-a1-product .hm-content-module").count(),
            26,
          );
          assert.equal(
            await page.locator(".hm-a1-product .hm-tools-list li").count(),
            26,
          );
          for (const edition of locale === "id"
            ? ["Edisi Bahasa Indonesia — PDF", "Edisi bahasa Turki — PDF"]
            : ["Endonezce sürüm — PDF", "Türkçe sürüm — PDF"])
            assert.ok(
              await page.getByText(edition, { exact: true }).isVisible(),
            );
          for (const text of locale === "id"
            ? [
                "25 halaman per edisi",
                "50 halaman dalam paket bilingual",
                "Rp129.000",
              ]
            : [
                "Her sürüm 25 sayfa",
                "İki dilli pakette toplam 50 sayfa",
                "Fiyat yakında açıklanacak",
              ])
            assert.ok(
              await page.getByText(text, { exact: true }).first().isVisible(),
            );
          const notice =
            locale === "id"
              ? "Panduan sudah selesai disiapkan. File PDF disimpan secara privat dan belum dapat diunduh sampai penjualan resmi dibuka."
              : "Rehber tamamlandı. PDF dosyaları özel olarak saklanmaktadır ve resmi satış açılana kadar indirilemez.";
          assert.ok(
            await page.getByText(notice, { exact: true }).first().isVisible(),
          );
          assert.ok(
            !(await page.locator(".hm-a1-product").innerText()).includes(
              "Rp99.000",
            ),
          );
          const bilingual =
            locale === "id"
              ? "Anda belajar dalam Bahasa Indonesia, pasangan atau keluarga Türkiye dapat mengikuti struktur yang sama dalam versi Türkçe."
              : "Endonezyalı eşiniz Endonezce sürümden çalışırken siz aynı yapıyı Türkçe sürümden takip edebilir ve birlikte pratik yapabilirsiniz.";
          assert.ok(
            await page.getByText(bilingual, { exact: true }).isVisible(),
          );
          for (const boundary of locale === "id"
            ? [
                "Bukan kursus CEFR A1 lengkap.",
                "Bukan sertifikat bahasa resmi.",
                "Tidak menggantikan pengajaran bahasa profesional.",
              ]
            : [
                "Tam bir CEFR A1 kursu değildir.",
                "Resmî dil sertifikası değildir.",
                "Profesyonel dil öğretiminin yerini almaz.",
              ])
            assert.ok(
              await page.getByText(boundary, { exact: true }).isVisible(),
            );
          assert.ok(
            await page.locator(".hm-a1-product .hm-coming").first().isVisible(),
          );
          const module = page.locator(".hm-content-module").nth(1);
          await module.locator("summary").click();
          assert.equal(await module.evaluate((node) => node.open), true);
          assert.ok(await module.locator("p").isVisible());
          await page
            .locator('.hm-a1-product .hm-marriage-hero a[href="#request-form"]')
            .click();
          assert.ok(await page.locator("#request-form").isVisible());
          assert.equal(
            await page.locator('form input[name="email"]').count(),
            1,
          );
          assert.equal(
            await page
              .locator(
                'a[download],a[href*=".pdf"],a[href*="storage/v1"],input[type="file"]',
              )
              .count(),
            0,
          );
          assert.ok(
            !/halo-digital-products|Halo_Merhaba_/.test(await response.text()),
          );
          assert.ok(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <= window.innerWidth + 1,
            ),
          );
        }
    } finally {
      await browser.close();
    }
  },
);

test(
  "completed family toolkit package, modules and interest CTA in both languages",
  { timeout: 60000 },
  async () => {
    const browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    });
    try {
      const page = await browser.newPage();
      for (const locale of ["id", "tr"])
        for (const width of [360, 375, 390, 412, 430, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          const response = await page.goto(
            `${origin}/${locale}/produk/family-meeting-toolkit`,
          );
          assert.equal(response.status(), 200);
          assert.equal(await page.locator(".hm-family-product h1").count(), 1);
          assert.equal(
            await page.locator(".hm-family-product .hm-content-module").count(),
            25,
          );
          assert.equal(
            await page.locator(".hm-family-product .hm-tools-list li").count(),
            25,
          );
          for (const edition of locale === "id"
            ? ["Edisi Bahasa Indonesia — PDF", "Edisi bahasa Turki — PDF"]
            : ["Endonezce sürüm — PDF", "Türkçe sürüm — PDF"])
            assert.ok(
              await page.getByText(edition, { exact: true }).isVisible(),
            );
          for (const text of locale === "id"
            ? [
                "27 halaman per edisi",
                "54 halaman dalam paket bilingual",
                "Rp119.000",
              ]
            : [
                "Her sürüm 27 sayfa",
                "İki dilli pakette toplam 54 sayfa",
                "Fiyat yakında açıklanacak",
              ])
            assert.ok(
              await page.getByText(text, { exact: true }).first().isVisible(),
            );
          const notice =
            locale === "id"
              ? "Panduan sudah selesai disiapkan. File PDF disimpan secara privat dan belum dapat diunduh sampai penjualan resmi dibuka."
              : "Rehber tamamlandı. PDF dosyaları özel olarak saklanmaktadır ve resmi satış açılana kadar indirilemez.";
          assert.ok(
            await page.getByText(notice, { exact: true }).first().isVisible(),
          );
          assert.ok(
            !(await page.locator(".hm-family-product").innerText()).includes(
              "Rp79.000",
            ),
          );
          const bilingual =
            locale === "id"
              ? "Keluarga Indonesia dan keluarga Türkiye dapat mengikuti alur yang sama dalam bahasa masing-masing, sehingga percakapan tidak terlalu bergantung pada satu orang."
              : "Endonezya ve Türkiye’deki aileler aynı yapıyı kendi dillerinde takip edebilir; böylece bütün iletişim tek kişinin omuzlarında kalmaz.";
          assert.ok(
            await page.getByText(bilingual, { exact: true }).isVisible(),
          );
          for (const boundary of locale === "id"
            ? [
                "Bukan protokol wajib.",
                "Bukan nasihat hukum.",
                "Bukan konseling hubungan.",
                "Tidak menjamin kedua keluarga akan sepakat.",
              ]
            : [
                "Zorunlu protokol değildir.",
                "Hukuki danışmanlık değildir.",
                "İlişki danışmanlığı değildir.",
                "Ailelerin anlaşacağını garanti etmez.",
              ])
            assert.ok(
              await page.getByText(boundary, { exact: true }).isVisible(),
            );
          assert.ok(
            await page
              .locator(".hm-family-product .hm-coming")
              .first()
              .isVisible(),
          );
          const module = page.locator(".hm-content-module").nth(1);
          await module.locator("summary").click();
          assert.equal(await module.evaluate((node) => node.open), true);
          assert.ok(await module.locator("p").isVisible());
          await page
            .locator(
              '.hm-family-product .hm-marriage-hero a[href="#request-form"]',
            )
            .click();
          assert.ok(await page.locator("#request-form").isVisible());
          assert.equal(
            await page.locator('form input[name="email"]').count(),
            1,
          );
          assert.equal(
            await page
              .locator(
                'a[download],a[href*=".pdf"],a[href*="storage/v1"],input[type="file"]',
              )
              .count(),
            0,
          );
          assert.ok(
            !/halo-digital-products|Halo_Merhaba_/.test(await response.text()),
          );
          assert.ok(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <= window.innerWidth + 1,
            ),
          );
        }
    } finally {
      await browser.close();
    }
  },
);

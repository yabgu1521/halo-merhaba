import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { intakeSchema, formatHandoff } from "../src/lib/intake";
import { products, catalog } from "../src/content/catalog";
import { publicRoutePaths, resolvePath } from "../src/lib/routes";
import { siteCopy } from "../src/content/site-copy";
import { whatsappLink, analytics } from "../src/lib/config";
const base = {
  kind: "consultation",
  locale: "id",
  name: "Test Person",
  email: "test@example.invalid",
  whatsapp: "",
  summary: "A non-sensitive test inquiry.",
  answers: {
    topic: "Preparation",
    currentCountry: "Indonesia",
    preferredLanguage: "id",
    contactMethod: "email",
  },
  consent: true,
  website: "",
};
test("intake accepts a scoped consultation and rejects missing consent or contact", () => {
  assert.ok(intakeSchema.safeParse(base).success);
  assert.ok(!intakeSchema.safeParse({ ...base, consent: false }).success);
  assert.ok(!intakeSchema.safeParse({ ...base, email: "" }).success);
  assert.ok(!intakeSchema.safeParse({ ...base, email: "bad" }).success);
});
test("strict payloads reject honeypots, privilege keys, oversized summaries and arbitrary answers", () => {
  for (const payload of [
    { ...base, website: "spam" },
    { ...base, status: "completed" },
    { ...base, summary: "x".repeat(1801) },
    { ...base, answers: { ...base.answers, admin: "true" } },
  ])
    assert.ok(!intakeSchema.safeParse(payload).success);
});
test("translation requires meaningful language and numeric page data without accepting files", () => {
  const translation = {
    ...base,
    kind: "translation",
    answers: {
      sourceLanguage: "id",
      targetLanguage: "tr",
      documentType: "general",
      pages: "3",
      deadline: "2026-12-01",
      certified: "unsure",
    },
  };
  assert.ok(intakeSchema.safeParse(translation).success);
  assert.ok(
    !intakeSchema.safeParse({
      ...translation,
      answers: { ...translation.answers, targetLanguage: "id" },
    }).success,
  );
  assert.ok(
    !intakeSchema.safeParse({
      ...translation,
      answers: { ...translation.answers, pages: "-1" },
    }).success,
  );
  assert.ok(
    !intakeSchema.safeParse({ ...translation, file: "passport" }).success,
  );
});
test("product interest requires a product and email and remains separate from orders", () => {
  const interest = {
    ...base,
    kind: "product_interest",
    name: "",
    summary: "",
    answers: { productId: products[0].id },
  };
  assert.ok(intakeSchema.safeParse(interest).success);
  assert.ok(!intakeSchema.safeParse({ ...interest, answers: {} }).success);
  assert.equal(catalog.payments_enabled, false);
  assert.equal(catalog.document_uploads_enabled, false);
  assert.ok(products.every((p) => !p.saleEnabled && !p.downloadEnabled));
});
test("WhatsApp is not invented and event tracking is disabled by default", () => {
  assert.equal(whatsappLink("test"), null);
  assert.equal(analytics.enabled, false);
  const parsed = intakeSchema.parse(base);
  const text = formatHandoff(
    parsed,
    {
      name: "Nama",
      email: "Email",
      whatsappContact: "WhatsApp",
      summary: "Ringkasan",
    },
    "Konsultasi",
  );
  assert.ok(text.startsWith("Halo Merhaba"));
  assert.ok(text.includes("Ringkasan: A non-sensitive"));
});
test("all public paths resolve and bilingual copy is complete", () => {
  assert.equal(new Set(publicRoutePaths).size, publicRoutePaths.length);
  for (const path of publicRoutePaths) assert.ok(resolvePath(path.split("/")));
  assert.equal(resolvePath(["unknown"]), null);
  assert.deepEqual(
    Object.keys(siteCopy.id).sort(),
    Object.keys(siteCopy.tr).sort(),
  );
  assert.ok(
    Object.values(siteCopy.id).every((value) =>
      Array.isArray(value) ? value.every(Boolean) : Boolean(value),
    ),
  );
});
test("migration scopes permissions to Halo tables and forbids public read/submit RPC access", () => {
  const sql = readFileSync(
    "supabase/migrations/202610160001_halo_leads.sql",
    "utf8",
  );
  for (const name of [
    "halo_leads",
    "halo_lead_notes",
    "halo_product_interest",
    "halo_admin_profiles",
    "halo_intake_limits",
  ])
    assert.ok(
      sql.includes(`alter table public.${name} enable row level security`),
    );
  assert.ok(!/drop\s+(schema|table|database)|truncate\s/i.test(sql));
  assert.ok(sql.includes("from public,anon,authenticated"));
  assert.ok(sql.includes("to service_role;"));
  assert.ok(sql.includes("if not public.halo_is_admin() then"));
  assert.ok(
    !/grant .* on all tables|alter table public\.(profiles|matches|messages)/i.test(
      sql,
    ),
  );
});
test("server uses only dedicated Halo bindings and never inherits the unrelated Supabase project", () => {
  const source = readFileSync("src/lib/server.ts", "utf8");
  assert.ok(source.includes("HALO_SUPABASE_URL"));
  assert.ok(
    !/process\.env\.(NEXT_PUBLIC_SUPABASE|SUPABASE_SERVICE)/.test(source),
  );
  assert.ok(source.includes("httpOnly: true"));
  assert.ok(source.includes('sameSite: "lax"'));
});

test("content readiness never grants delivery and public product data contains no private identifiers", () => {
  const ready = products.find((p) => p.id === "marriage-checklist-wni")!;
  assert.equal(ready.contentReady, true);
  assert.equal(ready.available, true);
  assert.deepEqual(ready.editions, [
    { locale: "id", format: "PDF" },
    { locale: "tr", format: "PDF" },
  ]);
  for (const p of products) {
    assert.equal(p.sale_enabled, false);
    assert.equal(p.download_enabled, false);
    assert.equal(p.saleEnabled, false);
    assert.equal(p.downloadEnabled, false);
  }
  assert.ok(
    products
      .filter(
        (p) =>
          ![
            ready.id,
            "document-apostille-organizer",
            "turkish-a1-survival",
            "family-meeting-toolkit",
            "marriage-preparation-workbook",
            "translation-document-kit",
            "turkiye-life-starter",
            "turkish-for-couples",
            "consultation-prep-workbook",
          ].includes(p.id),
      )
      .every((p) => !p.contentReady && !p.available),
  );
  assert.ok(
    !/halo-digital-products|Halo_Merhaba_|storage\/v1|https?:\/\//.test(
      JSON.stringify(products),
    ),
  );
  const privateSource = readFileSync(
    "src/lib/server/product-assets.ts",
    "utf8",
  );
  assert.ok(privateSource.startsWith('import "server-only";'));
  assert.ok(!/createSignedUrl\s*\(|getPublicUrl\s*\(/.test(privateSource));
});

test("nine explicit catalog records have IDR plans, localized content and matching routes", () => {
  const expected = [
    ["marriage-checklist-wni", "marriage", 149000],
    ["document-apostille-organizer", "documents", 129000],
    ["turkish-a1-survival", "language", 129000],
    ["family-meeting-toolkit", "marriage", 119000],
    ["marriage-preparation-workbook", "marriage", 199000],
    ["translation-document-kit", "documents", 149000],
    ["turkiye-life-starter", "life", 149000],
    ["turkish-for-couples", "language", 149000],
    ["consultation-prep-workbook", "guidance", 99000],
  ];
  assert.deepEqual(
    products.map((p) => [p.id, p.category, p.proposed_test_price.amount]),
    expected,
  );
  assert.equal(new Set(products.map((p) => p.id)).size, 9);
  for (const p of products) {
    assert.equal(p.proposed_test_price.currency, "IDR");
    for (const locale of ["id", "tr"] as const) {
      assert.ok(p.titles[locale]);
      assert.ok(p.descriptions[locale]);
      assert.ok(p.planned_contents[locale].length);
    }
    assert.deepEqual(resolvePath(["produk", p.id]), {
      kind: "product",
      slug: p.id,
    });
  }
});

test("nine completed bilingual guides retain closed delivery and no product remains unfinished", () => {
  const ready = products.filter((p) => p.contentReady);
  assert.deepEqual(
    ready.map((p) => p.id),
    [
      "marriage-checklist-wni",
      "document-apostille-organizer",
      "turkish-a1-survival",
      "family-meeting-toolkit",
      "marriage-preparation-workbook",
      "translation-document-kit",
      "turkiye-life-starter",
      "turkish-for-couples",
      "consultation-prep-workbook",
    ],
  );
  assert.equal(products.filter((p) => !p.contentReady).length, 0);
  const document = ready.find((p) => p.id === "document-apostille-organizer")!;
  assert.equal(document.available, true);
  assert.equal(document.pages_per_edition, 19);
  assert.equal(document.total_pages, 38);
  assert.deepEqual(document.editions, [
    { locale: "id", format: "PDF" },
    { locale: "tr", format: "PDF" },
  ]);
  const source = readFileSync("src/lib/server/product-assets.ts", "utf8");
  for (const marker of [
    "document-apostille-organizer",
    "Halo_Merhaba_Dokumen_Apostille_Organizer_ID.pdf",
    "Halo_Merhaba_Belge_Apostil_Duzenleyici_TR.pdf",
  ])
    assert.ok(source.includes(marker));
  assert.ok(source.includes("Object.hasOwn(privateProductAssets, productId)"));
});

test("A1 guide has two private editions, 25 pages each and revised planned pricing", () => {
  const a1 = products.find((p) => p.id === "turkish-a1-survival")!;
  assert.equal(a1.contentReady, true);
  assert.equal(a1.available, true);
  assert.equal(a1.pages_per_edition, 25);
  assert.equal(a1.total_pages, 50);
  assert.deepEqual(a1.proposed_test_price, { amount: 129000, currency: "IDR" });
  assert.deepEqual(a1.editions, [
    { locale: "id", format: "PDF" },
    { locale: "tr", format: "PDF" },
  ]);
  const source = readFileSync("src/lib/server/product-assets.ts", "utf8");
  for (const marker of [
    "turkish-a1-survival",
    "Halo_Merhaba_Turkce_A1_Survival_Pack_ID.pdf",
    "Halo_Merhaba_Turkce_A1_Gunluk_Yasam_Paketi_TR.pdf",
  ])
    assert.ok(source.includes(marker));
});

test("family toolkit has two private editions, 27 pages each and revised planned pricing", () => {
  const family = products.find((p) => p.id === "family-meeting-toolkit")!;
  assert.equal(family.contentReady, true);
  assert.equal(family.available, true);
  assert.equal(family.pages_per_edition, 27);
  assert.equal(family.total_pages, 54);
  assert.deepEqual(family.proposed_test_price, {
    amount: 119000,
    currency: "IDR",
  });
  assert.deepEqual(family.editions, [
    { locale: "id", format: "PDF" },
    { locale: "tr", format: "PDF" },
  ]);
  const source = readFileSync("src/lib/server/product-assets.ts", "utf8");
  for (const marker of [
    "family-meeting-toolkit",
    "Halo_Merhaba_Pertemuan_Keluarga_Indonesia_Turkiye_Toolkit_ID.pdf",
    "Halo_Merhaba_Endonezya_Turkiye_Aile_Tanisma_Rehberi_TR.pdf",
  ])
    assert.ok(source.includes(marker));
});

test("marriage workbook has two private v2 editions, 32 pages each and revised pricing", () => {
  const workbook = products.find(
    (p) => p.id === "marriage-preparation-workbook",
  )!;
  assert.equal(workbook.contentReady, true);
  assert.equal(workbook.available, true);
  assert.equal(workbook.pages_per_edition, 32);
  assert.equal(workbook.total_pages, 64);
  assert.deepEqual(workbook.proposed_test_price, {
    amount: 199000,
    currency: "IDR",
  });
  assert.deepEqual(workbook.editions, [
    { locale: "id", format: "PDF" },
    { locale: "tr", format: "PDF" },
  ]);
  const source = readFileSync("src/lib/server/product-assets.ts", "utf8");
  for (const marker of [
    "marriage-preparation-workbook",
    "Halo_Merhaba_Persiapan_Nikah_Indonesia_Turkiye_Workbook_ID_v2.pdf",
    "Halo_Merhaba_Endonezya_Turkiye_Evlilik_Hazirlik_Workbook_TR_v2.pdf",
  ])
    assert.ok(source.includes(marker));
});

test("translation kit has two private editions, 31 pages each and revised pricing", () => {
  const kit = products.find((p) => p.id === "translation-document-kit")!;
  assert.equal(kit.contentReady, true);
  assert.equal(kit.available, true);
  assert.equal(kit.pages_per_edition, 31);
  assert.equal(kit.total_pages, 62);
  assert.equal(kit.titles.tr, "Çeviri & Belge Hazırlık Kiti");
  assert.deepEqual(kit.proposed_test_price, {
    amount: 149000,
    currency: "IDR",
  });
  assert.deepEqual(kit.editions, [
    { locale: "id", format: "PDF" },
    { locale: "tr", format: "PDF" },
  ]);
  const source = readFileSync("src/lib/server/product-assets.ts", "utf8");
  for (const marker of [
    "translation-document-kit",
    "Halo_Merhaba_Translation_Document_Preparation_Kit_ID.pdf",
    "Halo_Merhaba_Ceviri_Belge_Hazirlik_Kiti_TR.pdf",
  ])
    assert.ok(source.includes(marker));
});

test("Life Starter has two private editions, 32/64 pages, revised titles and pricing", () => {
  const life = products.find((p) => p.id === "turkiye-life-starter")!;
  assert.equal(life.contentReady, true);
  assert.equal(life.available, true);
  assert.equal(life.pages_per_edition, 32);
  assert.equal(life.total_pages, 64);
  assert.equal(
    life.titles.id,
    "Türkiye Life Starter — Panduan 30 Hari Pertama",
  );
  assert.equal(life.titles.tr, "Türkiye’de Yaşama Başlangıç Kiti — İlk 30 Gün");
  assert.deepEqual(life.proposed_test_price, {
    amount: 149000,
    currency: "IDR",
  });
  assert.deepEqual(life.editions, [
    { locale: "id", format: "PDF" },
    { locale: "tr", format: "PDF" },
  ]);
  assert.deepEqual(
    products.filter((p) => !p.contentReady).map((p) => p.id),
    [],
  );
  const source = readFileSync("src/lib/server/product-assets.ts", "utf8");
  for (const marker of [
    "turkiye-life-starter",
    "Halo_Merhaba_Turkiye_Life_Starter_30_Hari_ID.pdf",
    "Halo_Merhaba_Turkiyede_Yasam_Baslangic_Ilk_30_Gun_TR.pdf",
  ])
    assert.ok(source.includes(marker));
});

test("Turkish for Couples has two private editions, 34/68 pages, revised titles and pricing", () => {
  const couples = products.find((p) => p.id === "turkish-for-couples")!;
  assert.equal(couples.contentReady, true);
  assert.equal(couples.available, true);
  assert.equal(couples.pages_per_edition, 34);
  assert.equal(couples.total_pages, 68);
  assert.equal(couples.titles.id, "Turkish for Couples");
  assert.equal(couples.titles.tr, "Çiftler İçin Türkçe");
  assert.deepEqual(couples.proposed_test_price, {
    amount: 149000,
    currency: "IDR",
  });
  assert.deepEqual(couples.editions, [
    { locale: "id", format: "PDF" },
    { locale: "tr", format: "PDF" },
  ]);
  assert.deepEqual(
    products.filter((p) => !p.contentReady).map((p) => p.id),
    [],
  );
  const source = readFileSync("src/lib/server/product-assets.ts", "utf8");
  for (const marker of [
    "turkish-for-couples",
    "Halo_Merhaba_Turkish_for_Couples_ID.pdf",
    "Halo_Merhaba_Ciftler_Icin_Turkce_TR.pdf",
  ])
    assert.ok(source.includes(marker));
});

test("final consultation workbook has two private editions, 30/60 pages and all nine products are ready", () => {
  const consultation = products.find(
    (p) => p.id === "consultation-prep-workbook",
  )!;
  assert.equal(consultation.contentReady, true);
  assert.equal(consultation.available, true);
  assert.equal(consultation.pages_per_edition, 30);
  assert.equal(consultation.total_pages, 60);
  assert.equal(consultation.titles.id, "Consultation Prep Workbook");
  assert.equal(consultation.titles.tr, "Danışmanlık Hazırlık Çalışma Kitabı");
  assert.deepEqual(consultation.proposed_test_price, {
    amount: 99000,
    currency: "IDR",
  });
  assert.deepEqual(consultation.editions, [
    { locale: "id", format: "PDF" },
    { locale: "tr", format: "PDF" },
  ]);
  assert.equal(products.length, 9);
  assert.ok(
    products.every(
      (p) =>
        p.contentReady && p.available && !p.sale_enabled && !p.download_enabled,
    ),
  );
  const source = readFileSync("src/lib/server/product-assets.ts", "utf8");
  for (const marker of [
    "consultation-prep-workbook",
    "Halo_Merhaba_Consultation_Prep_Workbook_ID.pdf",
    "Halo_Merhaba_Danismanlik_Hazirlik_Calisma_Kitabi_TR.pdf",
  ])
    assert.ok(source.includes(marker));
  assert.equal((source.match(/path: /g) || []).length, 19); // 18 entries plus the type field.
});

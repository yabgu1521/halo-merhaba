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
  assert.ok(
    products.every((p) => !p.available && !p.saleEnabled && !p.downloadEnabled),
  );
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

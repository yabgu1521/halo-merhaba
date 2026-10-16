import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compatibility,
  conversationStarters,
} from "../../src/lib/member/insights";
import { contextSchema } from "../../src/lib/member/validation";
import { productCopy } from "../../src/lib/product-copy";
const me = {
  purposes: ["friendship"],
  speaks: ["en", "tr"],
  learns: ["id"],
  interests: ["books", "books"],
};
const other = {
  public_id: "test",
  display_name: "Test",
  age: 30,
  gender: "undisclosed",
  city: "Test",
  country: "ID",
  biography: "Test only",
  photo_id: null,
  verification: "email",
  interested: false,
  purposes: ["friendship"],
  speaks: ["en", "id"],
  learns: ["tr"],
  interests: ["books"],
};
const catalogs = {
  countries: [
    {
      code: "ID",
      labels: { en: "Indonesia", tr: "Endonezya", id: "Indonesia" },
    },
  ],
  languages: [
    { code: "tr", labels: { en: "Turkish", tr: "Türkçe", id: "Bahasa Turki" } },
  ],
  interests: [
    { code: "books", labels: { en: "Books", tr: "Kitaplar", id: "Buku" } },
  ],
  purposes: [],
};
test("insights explain only actual shared fields and both learning directions, without duplicate interests", () => {
  const rows = compatibility(me, other);
  assert.deepEqual(
    rows.map((r) => r.kind),
    ["purpose", "interest", "language", "learning", "learning"],
  );
  assert.deepEqual(rows[1].codes, ["books"]);
  assert.deepEqual(rows[3], {
    kind: "learning",
    codes: ["tr"],
    direction: "they",
  });
  assert.deepEqual(rows[4].codes, ["id"]);
  assert.deepEqual(
    compatibility(
      { purposes: [], interests: [], speaks: [], learns: [] },
      other,
    ),
    [],
  );
});
test("deterministic localized starters depend on shared data, with no demographic inference", () => {
  for (const locale of ["en", "tr", "id"] as const) {
    const rows = conversationStarters(me, other, catalogs, locale);
    assert.equal(rows.length, 3);
    assert.deepEqual(rows, conversationStarters(me, other, catalogs, locale));
    assert.ok(rows.every((r) => !r.includes("{value}")));
  }
  assert.equal(
    conversationStarters(
      { purposes: [], interests: [], speaks: [], learns: [] },
      other,
      { ...catalogs, countries: [] },
      "en",
    ).length,
    0,
  );
});
test("optional profile choices are bounded and require an explicit sharing boolean", () => {
  const c = {
    nationality: "",
    future_country: "",
    relocation: "",
    education: "",
    profession: "",
    children: "",
    destinations: [],
    shared: false,
  };
  assert.ok(contextSchema.safeParse(c).success);
  for (const invalid of [
    { ...c, shared: "true" },
    { ...c, profession: "x".repeat(101) },
    { ...c, relocation: "unknown" },
    { ...c, destinations: ["../../private"] },
    { ...c, children: "unknown" },
  ])
    assert.equal(contextSchema.safeParse(invalid).success, false);
});
test("product dictionary keys match and unavailable paid services are clearly disclosed", () => {
  for (const locale of ["tr", "id"] as const)
    assert.deepEqual(
      Object.keys(productCopy[locale]).sort(),
      Object.keys(productCopy.en).sort(),
    );
  assert.ok(productCopy.en.premiumNotice.includes("not available"));
});

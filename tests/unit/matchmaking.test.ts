import { test } from "node:test";
import assert from "node:assert/strict";
import {
  matchmakingSchema,
  emptyMatchmaking,
  candidateFiltersSchema,
  preferenceFit,
  sharedLife,
} from "../../src/lib/member/matchmaking";
import { matchmakingCopy } from "../../src/lib/matchmaking-copy";
import type { Member } from "../../src/lib/member/data";
const candidate: Member = {
  public_id: "test",
  display_name: "Test",
  age: 32,
  gender: "woman",
  country: "ID",
  city: "Bandung",
  purposes: ["marriage"],
  speaks: ["en"],
  learns: ["tr"],
  interests: ["books"],
  biography: "Test only",
  verification: "email",
  photo_id: null,
  interested: false,
};
const culture = {
  nationality: "ID",
  relocation: "yes",
  future_country: "TR",
  education: null,
  profession: null,
  children: null,
  destinations: ["ID"],
  shared: true,
};
test("matchmaking choices are explicit, bounded, default-private and never inferred from identity", () => {
  assert.ok(matchmakingSchema.safeParse(emptyMatchmaking).success);
  for (const p of [
    { ...emptyMatchmaking, min_age: 17 },
    { ...emptyMatchmaking, max_age: 10 },
    { ...emptyMatchmaking, genders: ["inferred"] },
    { ...emptyMatchmaking, share_summary: "yes" },
    { ...emptyMatchmaking, looking_for: "x".repeat(601) },
  ])
    assert.equal(matchmakingSchema.safeParse(p).success, false);
});
test("preference fit is distinct from shared similarities and uses only requested actual attributes", () => {
  const prefs = {
    ...emptyMatchmaking,
    genders: ["woman" as const],
    countries: ["ID"],
    purpose: "marriage",
    languages: ["en"],
    relocation: "yes" as const,
  };
  assert.deepEqual(preferenceFit(prefs, candidate), [
    "gender",
    "age",
    "country",
    "purpose",
    "language",
  ]);
  assert.ok(
    preferenceFit(prefs, { ...candidate, context: culture }).includes(
      "relocation",
    ),
  );
  assert.ok(
    !preferenceFit(prefs, {
      ...candidate,
      context: { ...culture, shared: false },
    }).includes("relocation"),
  );
  assert.deepEqual(preferenceFit(null, candidate), []);
});
test("shared future and relocation explanations require both members to share those actual fields", () => {
  assert.deepEqual(
    sharedLife(culture, {
      ...culture,
      destinations: ["TR"],
      future_country: "ID",
    }),
    { relocation: true, countries: ["ID", "TR"] },
  );
  assert.deepEqual(sharedLife({ ...culture, shared: false }, culture), {
    relocation: false,
    countries: [],
  });
  assert.equal(
    sharedLife(culture, { ...culture, relocation: "maybe" }).relocation,
    false,
  );
});
test("search controls validate ages, enum choices, lengths and boolean photo filter", () => {
  assert.equal(candidateFiltersSchema.parse({}).with_photo, false);
  for (const f of [
    { min_age: 17 },
    { min_age: 55, max_age: 40 },
    { gender: "guess" },
    { profession: "x".repeat(101) },
    { with_photo: "true" },
  ])
    assert.equal(candidateFiltersSchema.safeParse(f).success, false);
  assert.equal(
    candidateFiltersSchema.parse({ city: "O'Connor" }).city,
    "O'Connor",
  );
});
test("matchmaking copy covers the same keys in all supported languages", () => {
  for (const lang of ["tr", "id"] as const)
    assert.deepEqual(
      Object.keys(matchmakingCopy[lang]).sort(),
      Object.keys(matchmakingCopy.en).sort(),
    );
});

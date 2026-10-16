import { boundedBody } from "../../src/lib/member/body";
import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {
  ageFromDob,
  profileSchema,
  completion,
} from "../../src/lib/member/validation";
import { normalizePhoto } from "../../src/lib/member/photo";
import { memberCopy } from "../../src/lib/member/i18n";
const valid = {
  display_name: "Test Member",
  date_of_birth: "1990-03-12",
  gender: "undisclosed",
  country: "TR",
  city: "Ankara",
  biography: "A fictional biography used only in automated tests.",
  discoverable: true,
  purposes: ["friendship"],
  speaks: ["tr"],
  learns: ["id"],
  interests: ["books"],
};
test("age uses birthdays, rejects invalid/future dates and minors", () => {
  assert.equal(ageFromDob("2008-10-16", new Date("2026-10-15T12:00:00Z")), 17);
  assert.equal(ageFromDob("2008-10-15", new Date("2026-10-15T12:00:00Z")), 18);
  assert.equal(ageFromDob("2008-02-30"), -1);
  assert.equal(
    profileSchema.safeParse({ ...valid, date_of_birth: "2020-01-01" }).success,
    false,
  );
  assert.equal(
    profileSchema.safeParse({ ...valid, date_of_birth: "2090-01-01" }).success,
    false,
  );
});
test("profile validation enforces required choices, bounds and plain text", () => {
  assert.equal(profileSchema.safeParse(valid).success, true);
  for (const change of [
    { purposes: [] },
    { speaks: [] },
    { interests: [] },
    { biography: "short" },
    { city: "" },
    { display_name: "A" },
    { gender: "admin" },
  ])
    assert.equal(
      profileSchema.safeParse({ ...valid, ...change }).success,
      false,
    );
  assert.equal(
    profileSchema.parse({ ...valid, purposes: ["friendship", "friendship"] })
      .purposes.length,
    1,
  );
});
test("completion reflects seven meaningful groups", () => {
  assert.equal(completion(null, false), 0);
  assert.equal(completion(valid, false), 71);
  assert.equal(completion(valid, true), 86);
  assert.equal(completion({ ...valid, date_of_birth: "2020-01-01" }, true), 71);
  assert.equal(
    completion({ ...valid, safety_acknowledged_at: "2026-10-15" }, true),
    100,
  );
});
test("translation dictionaries have the same keys and all report categories", () => {
  for (const locale of ["tr", "id"] as const) {
    assert.deepEqual(
      Object.keys(memberCopy[locale]).sort(),
      Object.keys(memberCopy.en).sort(),
    );
    assert.equal(memberCopy[locale].reportCategories.length, 8);
  }
});
test("photo pipeline decodes and re-encodes while rejecting unsafe content", async () => {
  const input = await sharp({
    create: { width: 1500, height: 1000, channels: 3, background: "#778877" },
  })
    .jpeg()
    .toBuffer();
  const output = await normalizePhoto(input),
    meta = await sharp(output).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.width, 1200);
  assert.equal(meta.exif, undefined);
  await assert.rejects(
    normalizePhoto(Buffer.from('<svg onload="alert(1)"></svg>')),
  );
  await assert.rejects(normalizePhoto(Buffer.from("RIFFxxxxWEBPnot-an-image")));
  await assert.rejects(normalizePhoto(Buffer.alloc(5 * 1024 * 1024 + 1)));
  const giant = await sharp({
    create: { width: 5000, height: 4000, channels: 3, background: "#fff" },
  })
    .png()
    .toBuffer();
  await assert.rejects(normalizePhoto(giant));
});
test("streaming body limit does not depend on content-length", async () => {
  const request = new Request("http://local", {
    method: "POST",
    body: "123456",
  });
  await assert.rejects(boundedBody(request, 5));
});

test("message and preference inputs reject oversized text, invalid cursors and inverted ages", async () => {
  const { messageSchema, messageCursor, preferencesSchema } =
    await import("../../src/lib/member/validation");
  const id = "11111111-1111-4111-8111-111111111111";
  assert.equal(
    messageSchema.safeParse({ conversation: id, request_id: id, body: "Hello" })
      .success,
    true,
  );
  for (const body of [" ", "x".repeat(2001), "unsafe\u0000text"])
    assert.equal(
      messageSchema.safeParse({ conversation: id, request_id: id, body })
        .success,
      false,
    );
  assert.equal(messageCursor.safeParse("9223372036854775808").success, false);
  assert.equal(messageCursor.safeParse("-1").success, false);
  assert.equal(
    preferencesSchema.safeParse({
      country: "ID",
      min_age: 45,
      max_age: 20,
      purpose: "",
      language: "",
      interest: "",
    }).success,
    false,
  );
});

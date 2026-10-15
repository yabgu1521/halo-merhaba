import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";
try {
  process.loadEnvFile(".env.local");
} catch {}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (
  !url ||
  !key ||
  !service ||
  !["127.0.0.1", "localhost"].includes(new URL(url).hostname)
)
  throw new Error(
    "Integration tests require local Supabase credentials; never run against production.",
  );
const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  }),
  anon = createClient(url, key, { auth: { persistSession: false } });
const created: string[] = [];
type Fixture = {
  id: string;
  pid: string;
  db: SupabaseClient;
  photo: string;
  payload: Record<string, unknown>;
};
let a: Fixture, b: Fixture, c: Fixture;
async function fixture(country: string, discoverable = true): Promise<Fixture> {
  const email = `test-${randomUUID()}@example.test`,
    password = `A-${randomUUID()}-z`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { adult_confirmed: true },
  });
  assert.equal(error, null);
  const id = data.user!.id;
  created.push(id);
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const login = await db.auth.signInWithPassword({ email, password });
  assert.equal(login.error, null);
  const payload = {
    display_name: `Fixture ${country}`,
    date_of_birth: "1990-03-12",
    gender: "undisclosed",
    country,
    city: country === "TR" ? "Ankara" : "Bandung",
    biography: "Fictional test profile for privacy and meaningful connections.",
    discoverable,
    purposes: ["friendship"],
    speaks: [country === "TR" ? "tr" : "id"],
    learns: ["en"],
    interests: ["books"],
  };
  const save = await db.rpc("save_profile", { payload });
  assert.equal(save.error, null);
  const pid = save.data;
  const path = `${id}/${randomUUID()}.webp`,
    photo = await sharp({
      create: { width: 80, height: 80, channels: 3, background: "#788876" },
    })
      .webp()
      .toBuffer();
  assert.equal(
    (
      await admin.storage
        .from("profile-photos")
        .upload(path, photo, { contentType: "image/webp" })
    ).error,
    null,
  );
  assert.equal(
    (await admin.rpc("register_photo", { owner_id: id, object_path: path }))
      .error,
    null,
  );
  assert.equal((await db.rpc("complete_onboarding")).error, null);
  const result = await db.from("profile_photos").select("id").single();
  return { id, pid, db, photo: result.data!.id, payload };
}
before(async () => {
  a = await fixture("TR");
  b = await fixture("ID");
  c = await fixture("TR", false);
});
after(async () => {
  for (const id of created) {
    const { data } = await admin.storage.from("profile-photos").list(id);
    if (data?.length)
      await admin.storage
        .from("profile-photos")
        .remove(data.map((p) => `${id}/${p.name}`));
    await admin.auth.admin.deleteUser(id);
  }
});
test("registration rejects missing adult affirmation and unverified users cannot create profiles", async () => {
  const rejected = await anon.auth.signUp({
    email: `test-${randomUUID()}@example.test`,
    password: `A-${randomUUID()}`,
  });
  assert.ok(rejected.error);
  const { data, error } = await admin.auth.admin.createUser({
    email: `test-${randomUUID()}@example.test`,
    password: `A-${randomUUID()}`,
    email_confirm: false,
    user_metadata: { adult_confirmed: true },
  });
  assert.equal(error, null);
  created.push(data.user!.id);
  const before = await admin
    .from("profiles")
    .select("*")
    .eq("user_id", data.user!.id);
  assert.equal(before.data?.length, 0);
  assert.ok((await anon.rpc("save_profile", { payload: a.payload })).error);
});
test("server/database enforce age and required relational fields without corrupting a completed profile", async () => {
  assert.ok(
    (
      await a.db.rpc("save_profile", {
        payload: { ...a.payload, date_of_birth: "2020-01-01" },
      })
    ).error,
  );
  assert.ok(
    (
      await a.db.rpc("save_profile", {
        payload: { ...a.payload, purposes: null },
      })
    ).error,
  );
  assert.ok(
    (
      await a.db.rpc("save_profile", {
        payload: { ...a.payload, purposes: [] },
      })
    ).error,
  );
  const own = await a.db.from("profiles").select("date_of_birth").single();
  assert.equal(own.data?.date_of_birth, "1990-03-12");
  assert.equal(
    (
      await a.db.rpc("save_profile", {
        payload: { ...a.payload, city: "İzmir" },
      })
    ).error,
    null,
  );
});
test("RLS and privileges prevent private data access, profile edits, forged likes, blocks and verification escalation", async () => {
  const other = await a.db.from("profiles").select("*").eq("user_id", b.id);
  assert.equal(other.error, null);
  assert.equal(other.data?.length, 0);
  assert.ok(
    (
      await a.db
        .from("profiles")
        .update({ display_name: "Forged" })
        .eq("user_id", b.id)
    ).error,
  );
  assert.ok((await a.db.from("profiles").delete().eq("user_id", b.id)).error);
  assert.ok(
    (await a.db.from("likes").insert({ sender: b.id, recipient: c.id })).error,
  );
  assert.ok(
    (await a.db.from("blocks").insert({ actor: b.id, target: c.id })).error,
  );
  assert.ok((await a.db.from("account_security").select("*")).error);
  assert.ok(
    (
      await a.db
        .from("account_security")
        .update({ status: "active" })
        .eq("user_id", a.id)
    ).error,
  );
  assert.ok(
    (
      await a.db.rpc("register_photo", {
        owner_id: b.id,
        object_path: `${b.id}/${randomUUID()}.webp`,
      })
    ).error,
  );
  assert.ok(
    (
      await a.db
        .from("profiles")
        .update({ verification: "verified" })
        .eq("user_id", a.id)
    ).error,
  );
});
test("discovery is filtered, bounded and returns no private fields or authentication identity", async () => {
  const { data, error } = await a.db.rpc("discover_members", {
    country_filter: "ID",
    purpose_filter: "friendship",
    language_filter: "id",
    interest_filter: "books",
    min_age: 18,
    max_age: 100,
  });
  assert.equal(error, null);
  assert.ok(data.some((p: { public_id: string }) => p.public_id === b.pid));
  assert.ok(data.length <= 13);
  const profile = data.find(
    (p: { public_id: string }) => p.public_id === b.pid,
  );
  for (const forbidden of [
    "user_id",
    "email",
    "date_of_birth",
    "storage_path",
    "status",
  ])
    assert.ok(!(forbidden in profile));
  assert.ok(!JSON.stringify(profile).includes(b.id));
  assert.equal(
    (
      await a.db.rpc("discover_members", {
        country_filter: "ID",
        interest_filter: "nature",
      })
    ).data.length,
    0,
  );
  assert.equal(
    (await a.db.rpc("member_profile", { profile_id: c.pid })).data,
    null,
  );
  assert.ok(
    !(await a.db.rpc("discover_members")).data.some(
      (p: { public_id: string }) => p.public_id === c.pid,
    ),
  );
  assert.ok((await anon.rpc("discover_members")).error);
  assert.ok((await a.db.rpc("discover_members", { min_age: 17 })).error);
});
test("private photo bucket denies anonymous reads, member raw uploads and unrelated storage metadata", async () => {
  const photo = await admin
    .from("profile_photos")
    .select("storage_path")
    .eq("user_id", b.id)
    .single();
  const path = photo.data!.storage_path;
  assert.ok((await anon.storage.from("profile-photos").download(path)).error);
  assert.equal(
    (await a.db.from("profile_photos").select("*").eq("user_id", b.id)).data
      ?.length,
    0,
  );
  assert.ok((await a.db.storage.from("profile-photos").download(path)).error);
  assert.ok(
    (
      await a.db.storage
        .from("profile-photos")
        .upload(`${a.id}/${randomUUID()}.webp`, Buffer.from("<svg/>"), {
          contentType: "image/webp",
        })
    ).error,
  );
});
test("simultaneous interests create one match; self/duplicate likes are safe", async () => {
  assert.ok((await a.db.rpc("express_interest", { profile_id: a.pid })).error);
  const results = await Promise.all([
    a.db.rpc("express_interest", { profile_id: b.pid }),
    b.db.rpc("express_interest", { profile_id: a.pid }),
  ]);
  assert.ok(results.every((r) => !r.error));
  assert.equal(
    (await a.db.rpc("express_interest", { profile_id: b.pid })).error,
    null,
  );
  const rows = await admin
    .from("matches")
    .select("*")
    .or(`user_low.eq.${a.id},user_high.eq.${a.id}`);
  assert.equal(rows.data?.length, 1);
  assert.equal((await a.db.rpc("my_matches")).data.length, 1);
  assert.equal((await b.db.rpc("my_matches")).data.length, 1);
});
test("blocking hides both profiles and photos, removes likes/matches, and blocks new interaction", async () => {
  assert.equal(
    (await a.db.rpc("block_member", { profile_id: b.pid })).error,
    null,
  );
  assert.equal(
    (await a.db.rpc("member_profile", { profile_id: b.pid })).data,
    null,
  );
  assert.equal(
    (await b.db.rpc("member_profile", { profile_id: a.pid })).data,
    null,
  );
  assert.ok((await b.db.rpc("express_interest", { profile_id: a.pid })).error);
  assert.equal((await a.db.rpc("my_matches")).data.length, 0);
  assert.equal((await b.db.rpc("my_matches")).data.length, 0);
  assert.equal((await b.db.from("blocks").select("*")).data?.length, 0);
  assert.equal((await a.db.rpc("my_blocks")).data.length, 1);
});
test("reports are confidential even after blocking and cannot be forged", async () => {
  assert.equal(
    (
      await a.db.rpc("report_profile", {
        profile_id: b.pid,
        report_category: "scam",
        report_notes: "Fictional test report.",
      })
    ).error,
    null,
  );
  assert.equal((await a.db.from("reports").select("*")).data?.length, 1);
  assert.equal((await b.db.from("reports").select("*")).data?.length, 0);
  assert.ok(
    (
      await b.db
        .from("reports")
        .insert({ reporter: a.id, target: c.id, category: "spam" })
    ).error,
  );
  assert.ok(
    (
      await a.db.rpc("report_profile", {
        profile_id: b.pid,
        report_category: "unknown",
      })
    ).error,
  );
  assert.equal(
    (await a.db.rpc("block_member", { profile_id: b.pid, remove_block: true }))
      .error,
    null,
  );
  assert.equal((await a.db.rpc("my_matches")).data.length, 0);
});
test("suspension revokes browsing and mutation rights; photo deletion requires onboarding again", async () => {
  await admin
    .from("account_security")
    .update({ status: "suspended" })
    .eq("user_id", b.id);
  assert.equal((await b.db.rpc("member_active")).data, false);
  assert.ok((await b.db.rpc("discover_members")).error);
  assert.ok((await b.db.rpc("save_profile", { payload: b.payload })).error);
  assert.equal(
    (await a.db.rpc("member_profile", { profile_id: b.pid })).data,
    null,
  );
  assert.equal((await a.db.rpc("remove_photo")).error, null);
  assert.ok((await a.db.rpc("discover_members")).error);
  assert.ok((await a.db.rpc("complete_onboarding")).error);
});

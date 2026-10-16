import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createServer } from "node:net";
import EmbeddedPostgres from "embedded-postgres";
import { Client } from "pg";
let pg: EmbeddedPostgres, admin: Client, service: Client, directory: string;
const clients: Client[] = [];
type Fixture = { id: string; pid: string; db: Client };
let a: Fixture, b: Fixture, c: Fixture, conversation: string;
const payload = {
  display_name: "Test member",
  date_of_birth: "1990-01-02",
  gender: "undisclosed",
  country: "TR",
  city: "Ankara",
  biography: "Test account used only in isolated PostgreSQL policy validation.",
  discoverable: true,
  purposes: ["friendship"],
  speaks: ["tr"],
  learns: ["id"],
  interests: ["books"],
};
const ids = () => randomUUID();
async function denied(db: Client, sql: string, args: unknown[] = []) {
  await assert.rejects(db.query(sql, args));
}
before(async () => {
  directory = await mkdtemp(join(tmpdir(), "turkindo-policy-"));
  const socket = createServer();
  await new Promise<void>((r) => socket.listen(0, "127.0.0.1", r));
  const port = (socket.address() as { port: number }).port;
  await new Promise<void>((r) => socket.close(() => r()));
  const password = randomUUID();
  pg = new EmbeddedPostgres({
    databaseDir: directory,
    port,
    user: "postgres",
    password,
    persistent: false,
    onLog: () => {},
    onError: () => {},
  });
  await pg.initialise();
  await pg.start();
  const connect = async (role?: string, id?: string) => {
    const db = new Client({
      host: "127.0.0.1",
      port,
      user: "postgres",
      password,
      database: "postgres",
    });
    await db.connect();
    clients.push(db);
    if (role) await db.query("set role " + role);
    if (id)
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        id,
      ]);
    return db;
  };
  admin = await connect();
  await admin.query(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb,email_confirmed_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,storage to anon,authenticated,service_role;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets,name text,owner uuid);
 alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to authenticated,service_role;
 create function public.unrelated_function() returns integer language sql as $$select 1$$;grant execute on function public.unrelated_function() to anon;
 create table public.unrelated_table(id integer);revoke all on public.unrelated_table from service_role;`);
  for (const file of (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await admin.query(
      "begin;" +
        (await readFile(join("supabase/migrations", file), "utf8")) +
        ";commit;",
    );
  service = await connect("service_role");
  async function fixture(country: string): Promise<Fixture> {
    const id = ids();
    await admin.query("insert into auth.users values($1,$2,$3,now())", [
      id,
      `test-${id}@example.test`,
      { adult_confirmed: true },
    ]);
    const db = await connect("authenticated", id);
    const profile = await db.query(
      "select public.save_profile($1::jsonb) as id",
      [
        {
          ...payload,
          country,
          display_name: country + " Test",
          speaks: [country === "TR" ? "tr" : "id"],
        },
      ],
    );
    const path = id + "/" + ids() + ".webp";
    await service.query("select public.register_photo($1,$2)", [id, path]);
    await admin.query(
      "insert into storage.objects(bucket_id,name,owner) values('profile-photos',$1,$2)",
      [path, id],
    );
    await db.query("select public.complete_onboarding()");
    return { id, pid: profile.rows[0].id, db };
  }
  a = await fixture("TR");
  b = await fixture("ID");
  c = await fixture("TR");
});
after(async () => {
  await Promise.all(clients.map((db) => db.end().catch(() => {})));
  if (pg) await pg.stop();
  if (directory) await rm(directory, { recursive: true, force: true });
});
test("all actual SQL migrations apply with RLS while unrelated privileges remain intact", async () => {
  const tables = await admin.query(
    "select tablename,rowsecurity from pg_tables where schemaname='public' and tablename<>'unrelated_table'",
  );
  assert.equal(tables.rows.length, 19);
  assert.ok(tables.rows.every((r) => r.rowsecurity));
  const privileges = await admin.query(
    "select has_function_privilege('anon','public.unrelated_function()','execute') as preserved,has_table_privilege('service_role','public.unrelated_table','select') as broadened",
  );
  assert.equal(privileges.rows[0].preserved, true);
  assert.equal(privileges.rows[0].broadened, false);
  assert.equal(
    (await a.db.query("select current_user")).rows[0].current_user,
    "authenticated",
  );
});
test("adult registration trigger, DOB constraint and profile validation are enforced in PostgreSQL", async () => {
  await denied(admin, "insert into auth.users values($1,$2,$3,now())", [
    ids(),
    "not-created@example.test",
    {},
  ]);
  await denied(a.db, "select public.save_profile($1::jsonb)", [
    { ...payload, date_of_birth: "2020-01-01" },
  ]);
  await denied(a.db, "select public.save_profile($1::jsonb)", [
    { ...payload, purposes: [] },
  ]);
  await a.db.query("select public.save_profile($1::jsonb)", [
    { ...payload, display_name: "A Test" },
  ]);
});
test("private DOB/account data, cross-user writes, forged likes/blocks/reports and privilege changes are denied", async () => {
  assert.equal(
    (await a.db.query("select * from public.profiles where user_id=$1", [b.id]))
      .rowCount,
    0,
  );
  for (const sql of [
    "update public.profiles set display_name='forged' where user_id=$1",
    "delete from public.profiles where user_id=$1",
    "insert into public.likes(sender,recipient) values($1,$2)",
    "insert into public.blocks(actor,target) values($1,$2)",
    "insert into public.reports(reporter,target,category) values($1,$2,'spam')",
  ])
    await denied(a.db, sql, sql.includes("$2") ? [b.id, c.id] : [b.id]);
  await denied(a.db, "select * from public.account_security");
  const limiter = ids();
  await denied(a.db, "select public.consume_auth_attempt($1,1)", [limiter]);
  assert.equal(
    (
      await service.query(
        "select public.consume_auth_attempt($1,1) as allowed",
        [limiter],
      )
    ).rows[0].allowed,
    true,
  );
  assert.equal(
    (
      await service.query(
        "select public.consume_auth_attempt($1,1) as allowed",
        [limiter],
      )
    ).rows[0].allowed,
    false,
  );
  await denied(a.db, "update public.account_security set status='active'");
  await denied(a.db, "select public.register_photo($1,$2)", [
    b.id,
    b.id + "/" + ids() + ".webp",
  ]);
});
test("safe discovery/search and private favorites/preferences use real SQL filters and ownership", async () => {
  const result = await a.db.query(
    "select * from public.search_members(country_filter=>'ID',name_filter=>'ID Test')",
  );
  const member = result.rows[0].search_members;
  assert.equal(member.public_id, b.pid);
  for (const field of ["user_id", "date_of_birth", "email", "storage_path"])
    assert.ok(!(field in member));
  await a.db.query("select public.set_favorite($1,true)", [b.pid]);
  await a.db.query("select public.set_favorite($1,true)", [b.pid]);
  assert.equal(
    (await a.db.query("select * from public.favorites")).rowCount,
    1,
  );
  assert.equal(
    (await b.db.query("select * from public.favorites")).rowCount,
    0,
  );
  await a.db.query("select public.save_preferences($1::jsonb)", [
    {
      country: "ID",
      min_age: 20,
      max_age: 45,
      purpose: "friendship",
      language: "id",
      interest: "books",
    },
  ]);
  assert.equal(
    (await a.db.query("select country from public.member_preferences")).rows[0]
      .country,
    "ID",
  );
  assert.equal(
    (await b.db.query("select * from public.member_preferences")).rowCount,
    0,
  );
  await denied(b.db, "update public.member_preferences set max_age=1");
});
test("no conversation without mutual interest; concurrent likes create exactly one match", async () => {
  await denied(a.db, "select public.open_conversation($1)", [b.pid]);
  await denied(a.db, "select public.express_interest($1)", [a.pid]);
  await Promise.all([
    a.db.query("select public.express_interest($1)", [b.pid]),
    b.db.query("select public.express_interest($1)", [a.pid]),
  ]);
  await a.db.query("select public.express_interest($1)", [b.pid]);
  assert.equal((await admin.query("select * from public.matches")).rowCount, 1);
  const opens = await Promise.all([
    a.db.query("select public.open_conversation($1) as id", [b.pid]),
    b.db.query("select public.open_conversation($1) as id", [a.pid]),
  ]);
  assert.equal(opens[0].rows[0].id, opens[1].rows[0].id);
  conversation = opens[0].rows[0].id;
});
test("both matched participants send/read/reply with timestamps, retry deduplication and unread state", async () => {
  const nonce = ids();
  const first = await a.db.query("select public.send_message($1,$2,$3) as id", [
    conversation,
    "Hello from A",
    nonce,
  ]);
  await a.db.query("select public.send_message($1,$2,$3)", [
    conversation,
    "Hello from A",
    nonce,
  ]);
  assert.equal(
    (await admin.query("select * from public.messages")).rowCount,
    1,
  );
  assert.equal(
    (await b.db.query("select * from public.list_conversations()")).rows[0]
      .list_conversations.unread,
    true,
  );
  const thread = (
    await b.db.query("select public.read_thread($1) as t", [conversation])
  ).rows[0].t;
  assert.equal(thread.messages[0].body, "Hello from A");
  assert.equal(thread.messages[0].mine, false);
  assert.ok(thread.messages[0].created_at);
  await b.db.query("select public.mark_conversation_read($1,$2)", [
    conversation,
    first.rows[0].id,
  ]);
  assert.equal(
    (await b.db.query("select * from public.list_conversations()")).rows[0]
      .list_conversations.unread,
    false,
  );
  await b.db.query("select public.send_message($1,$2,$3)", [
    conversation,
    "Reply from B",
    ids(),
  ]);
  assert.equal(
    (await a.db.query("select public.read_thread($1) as t", [conversation]))
      .rows[0].t.messages.length,
    2,
  );
});
test("message retry identifiers cannot be reused for changed content", async () => {
  const row = (
    await a.db.query(
      "select client_id from public.messages where sender=$1 limit 1",
      [a.id],
    )
  ).rows[0];
  await denied(a.db, "select public.send_message($1,$2,$3)", [
    conversation,
    "Different body",
    row.client_id,
  ]);
});
test("stranger cannot read/write messages, impersonate participants or forge read state", async () => {
  await denied(c.db, "select public.read_thread($1)", [conversation]);
  await denied(c.db, "select public.send_message($1,$2,$3)", [
    conversation,
    "Forbidden",
    ids(),
  ]);
  await denied(c.db, "select public.mark_conversation_read($1,1)", [
    conversation,
  ]);
  assert.equal((await c.db.query("select * from public.messages")).rowCount, 0);
  assert.equal(
    (await c.db.query("select * from public.conversations")).rowCount,
    0,
  );
  await denied(
    c.db,
    "insert into public.messages(conversation_id,sender,body,client_id) values($1,$2,$3,$4)",
    [conversation, a.id, "Forged", ids()],
  );
  await denied(a.db, "update public.messages set body=$1", ["Changed"]);
  await denied(a.db, "select public.send_message($1,$2,$3)", [
    conversation,
    " ",
    ids(),
  ]);
});
test("visibility hides discovery, keeps existing matches, and blocks raw storage IDOR/overwrites", async () => {
  await b.db.query("select public.save_profile($1::jsonb)", [
    { ...payload, country: "ID", display_name: "ID Test", discoverable: false },
  ]);
  const rows = await a.db.query("select * from public.discover_members()");
  assert.ok(!rows.rows.some((r) => r.discover_members.public_id === b.pid));
  assert.equal(
    (await c.db.query("select public.member_profile($1) as p", [b.pid])).rows[0]
      .p,
    null,
  );
  assert.ok(
    (await a.db.query("select public.member_profile($1) as p", [b.pid])).rows[0]
      .p,
  );
  const path = (
    await admin.query(
      "select storage_path from public.profile_photos where user_id=$1",
      [b.id],
    )
  ).rows[0].storage_path;
  assert.equal(
    (await a.db.query("select * from storage.objects where name=$1", [path]))
      .rowCount,
    0,
  );
  await denied(
    a.db,
    "insert into storage.objects(bucket_id,name,owner) values('profile-photos',$1,$2)",
    [path, a.id],
  );
  assert.equal(
    (
      await a.db.query("update storage.objects set name=$1 where name=$2", [
        "overwrite",
        path,
      ])
    ).rowCount,
    0,
  );
});
test("block/send race prevents further communication, removes favorites and retains inaccessible history", async () => {
  await Promise.allSettled([
    a.db.query("select public.block_member($1)", [b.pid]),
    b.db.query("select public.send_message($1,$2,$3)", [
      conversation,
      "Concurrent attempt",
      ids(),
    ]),
  ]);
  await denied(a.db, "select public.read_thread($1)", [conversation]);
  await denied(b.db, "select public.send_message($1,$2,$3)", [
    conversation,
    "After block",
    ids(),
  ]);
  await denied(b.db, "select public.express_interest($1)", [a.pid]);
  assert.equal((await admin.query("select * from public.matches")).rowCount, 0);
  assert.equal(
    (await admin.query("select * from public.favorites")).rowCount,
    0,
  );
  assert.ok(
    (await admin.query("select * from public.messages")).rowCount! >= 2,
  );
  assert.equal((await b.db.query("select * from public.messages")).rowCount, 0);
});
test("reports remain confidential after blocking, and unblock does not restore matches/conversations", async () => {
  await a.db.query(
    "select public.report_profile($1,'harassment','Local policy test only')",
    [b.pid],
  );
  assert.equal((await a.db.query("select * from public.reports")).rowCount, 1);
  assert.equal((await b.db.query("select * from public.reports")).rowCount, 0);
  await a.db.query("select public.block_member($1,true)", [b.pid]);
  await denied(a.db, "select public.read_thread($1)", [conversation]);
  assert.equal(
    (await a.db.query("select * from public.my_matches()")).rowCount,
    0,
  );
});

test("a fresh match cannot reopen the blocked conversation history; suspension revokes access", async () => {
  await b.db.query("select public.save_profile($1::jsonb)", [
    { ...payload, country: "ID", display_name: "ID Test", discoverable: true },
  ]);
  await a.db.query("select public.express_interest($1)", [b.pid]);
  await b.db.query("select public.express_interest($1)", [a.pid]);
  const next = (
    await a.db.query("select public.open_conversation($1) as id", [b.pid])
  ).rows[0].id;
  assert.notEqual(next, conversation);
  assert.equal(
    (await a.db.query("select public.read_thread($1) as t", [next])).rows[0].t
      .messages.length,
    0,
  );
  await denied(a.db, "select public.read_thread($1)", [conversation]);
  await admin.query(
    "update public.account_security set status='suspended' where user_id=$1",
    [b.id],
  );
  await denied(a.db, "select public.send_message($1,$2,$3)", [
    next,
    "Unavailable",
    ids(),
  ]);
  await denied(b.db, "select * from public.list_conversations()");
});

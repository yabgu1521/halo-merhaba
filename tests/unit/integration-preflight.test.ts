import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
// JavaScript diagnostic is intentionally dependency-free and does not load env files.
import {
  inspectConfiguration,
  verifySupabase,
} from "../../scripts/verify-supabase.mjs";
test("configuration diagnostics return only statuses when bindings are absent", async () => {
  const result = await verifySupabase({});
  assert.equal(
    result.remote,
    "not_attempted_missing_or_invalid_runtime_bindings",
  );
  assert.deepEqual(result.variables.NEXT_PUBLIC_SUPABASE_URL, {
    available: false,
    structural: "not_available",
  });
});
test("malformed configuration is never echoed in diagnostic output", async () => {
  const marker = "PRIVATE-TEST-MARKER-not-a-real-credential";
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: marker,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: marker,
    SUPABASE_SERVICE_ROLE_KEY: marker,
  };
  const state = inspectConfiguration(env);
  assert.equal(state.NEXT_PUBLIC_SUPABASE_URL.structural, "invalid");
  const result = await verifySupabase(env);
  assert.equal(
    result.remote,
    "not_attempted_missing_or_invalid_runtime_bindings",
  );
  assert.ok(!JSON.stringify(result).includes(marker));
});
test("member migration does not change permissions for unrelated schema objects", () => {
  const sql = readFileSync(
    "supabase/migrations/202610150001_members.sql",
    "utf8",
  );
  assert.doesNotMatch(
    sql,
    /revoke\s+all\s+on\s+all\s+functions\s+in\s+schema/i,
  );
  assert.doesNotMatch(sql, /grant\s+all\s+on\s+all\s+tables\s+in\s+schema/i);
  assert.doesNotMatch(sql, /alter\s+default\s+privileges/i);
  assert.match(sql, /revoke all on function public\.save_profile/);
});

test("remote schema guard rejects an empty HEAD 404 rather than treating it as an empty table", async () => {
  const { requireRemoteSchema } =
    await import("../../scripts/remote-schema.mjs");
  let requests = 0;
  const fakeFetch = async () => {
    requests++;
    return new Response(null, { status: 404 });
  };
  await assert.rejects(
    requireRemoteSchema({
      origin: "https://unit.invalid",
      serviceKey: "unit-test-marker",
      tables: ["profiles", "messages"],
      fetchImpl: fakeFetch,
    }),
    { message: "Required remote schema is unavailable; no fixtures created." },
  );
  assert.equal(requests, 1);
});

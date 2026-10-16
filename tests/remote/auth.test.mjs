// Real hosted Auth only. Generates two isolated TEST accounts; sends no email.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
if (process.env.RUN_REMOTE_AUTH_TESTS !== "1")
  throw new Error("Explicit remote Auth test opt-in required.");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || !secret)
  throw new Error("Remote Auth bindings unavailable.");
const options = {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: async (input, init) => {
      try {
        return await fetch(input, {
          ...init,
          redirect: "error",
          signal: AbortSignal.timeout(12000),
        });
      } catch {
        throw new Error("Provider transport unavailable");
      }
    },
  },
};
const admin = createClient(url, secret, options),
  created = [];
let accounts = [];
function check(error, operation) {
  assert.ok(!error, `${operation} was not confirmed`);
}
before(async () => {
  for (let i = 0; i < 2; i++) {
    const email = `codex-test-${randomUUID()}@example.test`,
      password = `Aa9!-${randomUUID()}`;
    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: { data: { adult_confirmed: true } },
    });
    check(error, "Admin-issued signup link");
    assert.ok(
      data?.user?.id && data.properties?.hashed_token,
      "Signup link must contain a new test identity and token",
    );
    created.push(data.user.id);
    accounts.push({
      id: data.user.id,
      email,
      password,
      token: data.properties.hashed_token,
      client: createClient(url, key, options),
    });
  }
});
after(async () => {
  for (const account of accounts) await account.client.auth.signOut();
  for (const id of created) {
    const { error } = await admin.auth.admin.deleteUser(id);
    check(error, "Cleanup of task-created TEST identity");
  }
});
test("REMOTE: two TEST identities reject login before email-token verification", async () => {
  for (const a of accounts) {
    const { error } = await a.client.auth.signInWithPassword({
      email: a.email,
      password: a.password,
    });
    assert.equal(error?.code, "email_not_confirmed");
  }
});
test("REMOTE: real signup-token verification yields valid authenticated identities", async () => {
  for (const a of accounts) {
    const { data, error } = await a.client.auth.verifyOtp({
      type: "signup",
      token_hash: a.token,
    });
    check(error, "Signup-token verification");
    assert.equal(data.user?.id, a.id);
    const user = await a.client.auth.getUser();
    check(user.error, "Authenticated identity");
    assert.ok(user.data.user?.email_confirmed_at);
  }
});
test("REMOTE: both TEST accounts log in with passwords and resume sessions", async () => {
  for (const a of accounts) {
    await a.client.auth.signOut();
    const { data, error } = await a.client.auth.signInWithPassword({
      email: a.email,
      password: a.password,
    });
    check(error, "Password login");
    assert.equal(data.user?.id, a.id);
    const session = await a.client.auth.getSession();
    assert.ok(session.data.session?.refresh_token);
  }
});
test("REMOTE: recovery-token verification changes password and rejects the old password", async () => {
  const a = accounts[0];
  await a.client.auth.signOut();
  const link = await admin.auth.admin.generateLink({
    type: "recovery",
    email: a.email,
  });
  check(link.error, "Admin-issued recovery link");
  const verified = await a.client.auth.verifyOtp({
    type: "recovery",
    token_hash: link.data.properties.hashed_token,
  });
  check(verified.error, "Recovery-token verification");
  const next = `Zz8!-${randomUUID()}`;
  check(
    (await a.client.auth.updateUser({ password: next })).error,
    "Password update",
  );
  await a.client.auth.signOut();
  assert.ok(
    (
      await a.client.auth.signInWithPassword({
        email: a.email,
        password: a.password,
      })
    ).error,
    "Old password must fail",
  );
  check(
    (await a.client.auth.signInWithPassword({ email: a.email, password: next }))
      .error,
    "New password login",
  );
  a.password = next;
});
test("REMOTE: logout removes SDK session and revokes refresh", async () => {
  for (const a of accounts) {
    const session = await a.client.auth.getSession();
    const refresh = session.data.session?.refresh_token;
    assert.ok(refresh);
    check((await a.client.auth.signOut({ scope: "global" })).error, "Logout");
    assert.equal((await a.client.auth.getSession()).data.session, null);
    assert.ok(
      (await a.client.auth.refreshSession({ refresh_token: refresh })).error,
    );
  }
});

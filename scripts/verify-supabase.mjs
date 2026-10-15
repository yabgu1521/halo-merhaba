import { pathToFileURL } from "node:url";

const names = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];
export function inspectConfiguration(env) {
  return Object.fromEntries(
    names.map((name) => {
      const value = env[name];
      let structural = "not_available";
      if (value) {
        if (name.endsWith("_URL")) {
          try {
            const url = new URL(value);
            structural =
              url.protocol === "https:" &&
              !url.username &&
              !url.password &&
              !url.search &&
              !url.hash &&
              url.pathname === "/"
                ? "valid"
                : "invalid";
          } catch {
            structural = "invalid";
          }
        } else {
          const prefix =
            name === "SUPABASE_SERVICE_ROLE_KEY"
              ? "sb_secret_"
              : "sb_publishable_";
          if (
            value.startsWith(prefix) &&
            /^[A-Za-z0-9_-]+$/.test(value.slice(prefix.length)) &&
            value.length >= prefix.length + 20
          )
            structural = "valid";
          else {
            try {
              const parts = value.split(".");
              const payload = JSON.parse(
                Buffer.from(parts[1] || "", "base64url").toString(),
              );
              structural =
                parts.length === 3 &&
                payload.role ===
                  (name === "SUPABASE_SERVICE_ROLE_KEY"
                    ? "service_role"
                    : "anon")
                  ? "valid"
                  : "unrecognized";
            } catch {
              structural = "unrecognized";
            }
          }
        }
      }
      // Never return input values, parsed claims, hostnames, exceptions, or token fragments.
      return [name, { available: Boolean(value), structural }];
    }),
  );
}

/** @param {Record<string, string | undefined>} [env] */
export async function verifySupabase(env = process.env) {
  const variables = inspectConfiguration(env);
  if (
    Object.values(variables).some(
      (v) => !v.available || v.structural === "invalid",
    )
  ) {
    return {
      variables,
      remote: "not_attempted_missing_or_invalid_runtime_bindings",
      tables: "not_inspected",
    };
  }
  // Unrecognized shapes may be proxy bindings: only an actual request establishes usability.
  try {
    const fetchWithTimeout = (input, init) =>
      fetch(input, {
        ...init,
        redirect: "error",
        signal: AbortSignal.timeout(12000),
      });
    const base = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
    const privilegedHeaders = {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    };
    const [auth, settings] = await Promise.all([
      fetchWithTimeout(`${base}/auth/v1/admin/users?page=1&per_page=1`, {
        headers: privilegedHeaders,
      }),
      fetchWithTimeout(`${base}/auth/v1/settings`, {
        headers: { apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
      }),
    ]);
    // Do not consume or log provider response bodies, including account data/errors.
    await auth.body?.cancel();
    await settings.body?.cancel();
    const tables = {};
    if (auth.ok) {
      await Promise.all(
        [
          "account_security",
          "profiles",
          "profile_photos",
          "countries",
          "purposes",
          "user_purposes",
          "languages",
          "user_languages",
          "interests",
          "user_interests",
          "likes",
          "matches",
          "blocks",
          "reports",
        ].map(async (name) => {
          const result = await fetchWithTimeout(
            `${base}/rest/v1/${name}?select=*`,
            { method: "HEAD", headers: privilegedHeaders },
          );
          tables[name] = result.ok ? "available" : "not_confirmed";
        }),
      );
    }
    return {
      variables,
      remote: !auth.ok
        ? "service_access_not_confirmed"
        : "service_access_confirmed",
      publishable_access: settings.ok ? "confirmed" : "not_confirmed",
      tables,
      rls: "not_tested_by_this_read_only_diagnostic",
      authentication_flows: "not_tested",
    };
  } catch {
    return { variables, remote: "request_failed", tables: "not_inspected" };
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  verifySupabase()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      if (
        result.remote !== "service_access_confirmed" ||
        result.publishable_access !== "confirmed"
      )
        process.exitCode = 2;
    })
    .catch(() => {
      console.log(JSON.stringify({ remote: "diagnostic_failed" }));
      process.exitCode = 2;
    });
}

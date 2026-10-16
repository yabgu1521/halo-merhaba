import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createHmac } from "node:crypto";
export function authConfigured() {
  return Boolean(
    process.env.HALO_SUPABASE_URL && process.env.HALO_SUPABASE_PUBLISHABLE_KEY,
  );
}
export function intakeConfigured() {
  return (
    authConfigured() &&
    Boolean(process.env.HALO_SUPABASE_SERVICE_ROLE_KEY) &&
    (process.env.HALO_RATE_LIMIT_SALT?.length || 0) >= 32
  );
}
// Deliberately never inherit the unrelated product's SUPABASE_* bindings.
export function intakeClient() {
  if (!intakeConfigured()) throw new Error("not_configured");
  return createClient(
    process.env.HALO_SUPABASE_URL!,
    process.env.HALO_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export async function adminClient() {
  if (!authConfigured()) throw new Error("not_configured");
  const jar = await cookies();
  return createServerClient(
    process.env.HALO_SUPABASE_URL!,
    process.env.HALO_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) =>
              jar.set(name, value, {
                ...options,
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.HALO_SITE_URL?.startsWith("https:"),
              }),
            );
          } catch {
            /* A route handler persists refreshed cookies. */
          }
        },
      },
    },
  );
}
export async function authorizedAdmin() {
  const db = await adminClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) return null;
  const { data: role } = await db
    .from("halo_admin_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  return role ? { db, user } : null;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.HALO_SITE_URL || new URL(request.url).origin;
  try {
    return (
      Boolean(origin && new URL(origin).origin === new URL(expected).origin) &&
      request.headers.get("sec-fetch-site") !== "cross-site"
    );
  } catch {
    return false;
  }
}
export function privateJson(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export async function readJson(request: Request, maxBytes = 12000) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new Error("content_type");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("body");
  let total = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error("too_large");
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export function rateHash(request: Request) {
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  return createHmac(
    "sha256",
    process.env.HALO_RATE_LIMIT_SALT || "local-unconfigured",
  )
    .update(ip)
    .digest("hex");
}
const loginAttempts = new Map<string, { count: number; until: number }>();
export function loginAllowed(request: Request) {
  const now = Date.now(),
    key = rateHash(request);
  if (loginAttempts.size > 1000)
    for (const [k, v] of loginAttempts)
      if (v.until < now) loginAttempts.delete(k);
  const entry = loginAttempts.get(key);
  if (!entry || entry.until < now) {
    loginAttempts.set(key, { count: 1, until: now + 15 * 60 * 1000 });
    return true;
  }
  entry.count++;
  return entry.count <= 8;
}

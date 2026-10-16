import { z } from "zod";
import {
  adminClient,
  authConfigured,
  authorizedAdmin,
  loginAllowed,
  privateJson,
  readJson,
  sameOrigin,
} from "@/lib/server";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "forbidden" }, 403);
  if (!authConfigured()) return privateJson({ error: "not_configured" }, 503);
  if (!loginAllowed(request)) return privateJson({ error: "try_later" }, 429);
  try {
    const body = z
      .object({
        email: z.email().max(254),
        password: z.string().min(1).max(128),
      })
      .strict()
      .parse(await readJson(request, 1500));
    const db = await adminClient();
    const { error } = await db.auth.signInWithPassword(body);
    if (error) return privateJson({ error: "login_failed" }, 401);
    if (!(await authorizedAdmin())) {
      await db.auth.signOut();
      return privateJson({ error: "login_failed" }, 401);
    }
    return privateJson({ ok: true });
  } catch {
    return privateJson({ error: "login_failed" }, 401);
  }
}

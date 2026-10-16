import {
  adminClient,
  authConfigured,
  privateJson,
  sameOrigin,
} from "@/lib/server";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "forbidden" }, 403);
  if (authConfigured()) await (await adminClient()).auth.signOut();
  return privateJson({ ok: true });
}

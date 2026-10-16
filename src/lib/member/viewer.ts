import "server-only";
import type { SharedProfile } from "./insights";
import type { supabase } from "../supabase/server";
export async function viewerSignals(
  db: Awaited<ReturnType<typeof supabase>>,
): Promise<SharedProfile> {
  const [p, l, i] = await Promise.all([
    db.from("user_purposes").select("code"),
    db.from("user_languages").select("code,kind"),
    db.from("user_interests").select("code"),
  ]);
  if (p.error || l.error || i.error)
    throw new Error("Profile signals unavailable");
  return {
    purposes: (p.data || []).map((x) => x.code),
    interests: (i.data || []).map((x) => x.code),
    speaks: (l.data || []).filter((x) => x.kind === "speak").map((x) => x.code),
    learns: (l.data || []).filter((x) => x.kind === "learn").map((x) => x.code),
  };
}

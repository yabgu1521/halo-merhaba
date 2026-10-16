import "server-only";
import type { SharedProfile } from "./insights";
import type { supabase } from "../supabase/server";
export async function viewerSignals(
  db: Awaited<ReturnType<typeof supabase>>,
): Promise<SharedProfile> {
  const [p, l, i, prefs, profile] = await Promise.all([
    db.from("user_purposes").select("code"),
    db.from("user_languages").select("code,kind"),
    db.from("user_interests").select("code"),
    db.rpc("my_matchmaking_preferences"),
    db.from("profiles").select("public_id").maybeSingle(),
  ]);
  if (p.error || l.error || i.error || prefs.error || profile.error)
    throw new Error("Profile signals unavailable");
  const context = profile.data
    ? await db.rpc("member_context", { profile_id: profile.data.public_id })
    : { data: null, error: null };
  if (context.error) throw new Error("Profile context unavailable");
  return {
    context: context.data,
    preferences: prefs.data,
    purposes: (p.data || []).map((x) => x.code),
    interests: (i.data || []).map((x) => x.code),
    speaks: (l.data || []).filter((x) => x.kind === "speak").map((x) => x.code),
    learns: (l.data || []).filter((x) => x.kind === "learn").map((x) => x.code),
  };
}

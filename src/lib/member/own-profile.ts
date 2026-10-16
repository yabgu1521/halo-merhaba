import "server-only";
import { memberContext, catalog } from "./data";
export async function ownProfile(locale: string) {
  const ctx = await memberContext(locale, false),
    { db, user, profile } = ctx;
  const [purposes, languages, interests, photo, options] = await Promise.all([
    db.from("user_purposes").select("code").eq("user_id", user.id),
    db.from("user_languages").select("code,kind").eq("user_id", user.id),
    db.from("user_interests").select("code").eq("user_id", user.id),
    db.from("profile_photos").select("id").eq("user_id", user.id).maybeSingle(),
    catalog(db),
  ]);
  if ([purposes, languages, interests, photo].some((r) => r.error))
    throw new Error("Member data unavailable");
  // Never serialize the raw profile/auth object into a client component.
  const initial = profile
    ? {
        display_name: profile.display_name,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        country: profile.country,
        city: profile.city,
        biography: profile.biography,
        discoverable: profile.discoverable,
        safety_acknowledged_at: profile.safety_acknowledged_at,
        purposes: (purposes.data || []).map((p) => p.code),
        speaks: (languages.data || [])
          .filter((l) => l.kind === "speak")
          .map((l) => l.code),
        learns: (languages.data || [])
          .filter((l) => l.kind === "learn")
          .map((l) => l.code),
        interests: (interests.data || []).map((i) => i.code),
      }
    : {};
  const context = await db.rpc("member_context", {
    profile_id: profile?.public_id || "00000000-0000-4000-8000-000000000000",
  });
  const preferences = await db.rpc("my_matchmaking_preferences");
  if (preferences.error) throw new Error("Preferences unavailable");
  return {
    preferences: preferences.data,
    ...ctx,
    initial,
    photo: photo.data?.id || null,
    options,
    context: context.data,
    contextAvailable: !context.error,
  };
}

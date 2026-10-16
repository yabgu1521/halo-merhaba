import type { ProfileContext } from "@/components/member/context-form";
import type { MatchmakingPreferences } from "./matchmaking";
import "server-only";
import { redirect } from "next/navigation";
import { supabase, configured } from "@/lib/supabase/server";
export type Choice = { code: string; labels: Record<string, string> };
export type Catalog = {
  countries: Choice[];
  purposes: Choice[];
  languages: Choice[];
  interests: Choice[];
};
export type Member = {
  public_id: string;
  display_name: string;
  age: number;
  gender: string;
  country: string;
  city: string;
  biography: string;
  verification: string;
  purposes: string[];
  speaks: string[];
  learns: string[];
  interests: string[];
  photo_id: string | null;
  interested: boolean;
  favorited?: boolean;
  matched_at?: string;
  context?: ProfileContext | null;
  looking_for?: MatchmakingPreferences | null;
  has_match?: boolean;
};
export async function memberContext(locale: string, requireComplete = true) {
  if (!configured()) redirect(`/${locale}/auth/login`);
  const db = await supabase();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user || !user.email_confirmed_at)
    redirect(`/${locale}/auth/login`);
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError) throw new Error("Member data unavailable");
  const { data: active } = await db.rpc("member_active");
  if (!active) redirect(`/${locale}/auth/login?notice=accountUnavailable`);
  if (requireComplete && !profile?.completed_at)
    redirect(`/${locale}/app/onboarding`);
  return { db, user, profile };
}
export async function catalog(
  db: Awaited<ReturnType<typeof supabase>>,
): Promise<Catalog> {
  const results = await Promise.all(
    ["countries", "purposes", "languages", "interests"].map((t) =>
      db.from(t).select("code,labels").eq("active", true).order("code"),
    ),
  );
  if (results.some((r) => r.error)) throw new Error("Catalog unavailable");
  return Object.fromEntries(
    ["countries", "purposes", "languages", "interests"].map((key, i) => [
      key,
      results[i].data,
    ]),
  ) as Catalog;
}
export function label(items: Choice[], code: string, locale: string) {
  const row = items.find((i) => i.code === code);
  return row?.labels[locale] || row?.labels.en || code;
}

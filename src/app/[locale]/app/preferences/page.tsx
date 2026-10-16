import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { memberContext, catalog } from "@/lib/member/data";
import { MatchmakingForm } from "@/components/member/matchmaking-form";
export default async function Preferences({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { db } = await memberContext(locale),
    options = await catalog(db);
  const prefs = await db.rpc("my_matchmaking_preferences");
  if (prefs.error) throw new Error("Preferences unavailable");
  return (
    <MatchmakingForm locale={locale} catalog={options} initial={prefs.data} />
  );
}

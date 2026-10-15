import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { memberCopy } from "@/lib/member/i18n";
import { memberContext, catalog, type Member } from "@/lib/member/data";
import { MemberCard } from "@/components/member/member-card";
export default async function Matches({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { db } = await memberContext(locale),
    options = await catalog(db),
    c = memberCopy[locale];
  const { data, error } = await db.rpc("my_matches");
  if (error) throw new Error("Matches unavailable");
  return (
    <>
      <div className="member-title">
        <p className="eyebrow">Türkiye × Indonesia</p>
        <h1>{c.matches}</h1>
      </div>
      {data?.length ? (
        <div className="members-grid">
          {(data as Member[]).map((m) => (
            <MemberCard
              member={m}
              key={m.public_id}
              locale={locale}
              catalog={options}
              match
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden>✦</span>
          <p>{c.noMatches}</p>
        </div>
      )}
    </>
  );
}

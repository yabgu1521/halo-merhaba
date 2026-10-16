import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { memberContext, catalog, type Member } from "@/lib/member/data";
import { viewerSignals } from "@/lib/member/viewer";
import { matchmakingCopy } from "@/lib/matchmaking-copy";
import { memberCopy } from "@/lib/member/i18n";
import { MemberCard } from "@/components/member/member-card";
import { uuid } from "@/lib/member/validation";
export default async function Interests({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ after?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { db } = await memberContext(locale),
    options = await catalog(db),
    viewer = await viewerSignals(db),
    q = await searchParams,
    c = matchmakingCopy[locale],
    m = memberCopy[locale];
  const result = await db.rpc("my_interests", {
    after_id: uuid.safeParse(q.after).success ? q.after : null,
  });
  if (result.error) throw new Error("Interests unavailable");
  const rows = (result.data || []) as Member[],
    people = rows.slice(0, 12);
  return (
    <>
      <div className="member-title">
        <h1>{c.interests}</h1>
        <p>{c.interestsHelp}</p>
      </div>
      <p className="interaction-guide">{c.actionGuide}</p>
      {people.length ? (
        <div className="members-grid">
          {people.map((person) => (
            <MemberCard
              key={person.public_id}
              member={person}
              catalog={options}
              locale={locale}
              viewer={viewer}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{c.noInterests}</p>
          <Link className="button" href={`/${locale}/app/discover`}>
            {m.discover}
          </Link>
        </div>
      )}
      {rows.length > 12 && (
        <Link
          className="button pagination"
          href={`/${locale}/app/likes?after=${people.at(-1)!.public_id}`}
        >
          {m.nextPage}
        </Link>
      )}
    </>
  );
}

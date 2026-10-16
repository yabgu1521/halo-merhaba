import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { memberContext, catalog, type Member } from "@/lib/member/data";
import { memberCopy } from "@/lib/member/i18n";
import { uuid } from "@/lib/member/validation";
import { MemberCard } from "@/components/member/member-card";
export default async function Favorites({
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
    c = memberCopy[locale],
    q = await searchParams;
  const { data, error } = await db.rpc("favorite_members", {
    after_id: uuid.safeParse(q.after).success ? q.after : null,
  });
  if (error) throw new Error("Favorites unavailable");
  const rows = (data || []) as Member[],
    members = rows.slice(0, 12);
  return (
    <>
      <div className="member-title">
        <h1>{c.favorites}</h1>
      </div>
      {members.length ? (
        <div className="members-grid">
          {members.map((m) => (
            <MemberCard
              key={m.public_id}
              member={m}
              catalog={options}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{c.noFavorites}</p>
        </div>
      )}
      {rows.length > 12 && (
        <Link
          className="button pagination"
          href={`/${locale}/app/favorites?after=${members.at(-1)!.public_id}`}
        >
          {c.nextPage}
        </Link>
      )}
    </>
  );
}

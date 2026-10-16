import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { memberContext, type Member } from "@/lib/member/data";
import { memberCopy } from "@/lib/member/i18n";
import { uuid } from "@/lib/member/validation";
export default async function Conversations({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ before?: string; id?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = memberCopy[locale],
    { db } = await memberContext(locale),
    q = await searchParams;
  const valid =
    typeof q.before === "string" &&
    !Number.isNaN(Date.parse(q.before)) &&
    uuid.safeParse(q.id).success;
  const { data, error } = await db.rpc("list_conversations", {
    before_time: valid ? q.before : null,
    before_id: valid ? q.id : null,
  });
  if (error) throw new Error("Conversations unavailable");
  const rows = (data || []) as {
      id: string;
      member: Member;
      created_at: string;
      unread: boolean;
    }[],
    items = rows.slice(0, 20),
    last = items.at(-1);
  return (
    <>
      <div className="member-title">
        <h1>{c.messages}</h1>
      </div>
      {!items.length && (
        <div className="empty-state">
          <p>{c.noConversations}</p>
          <Link href={`/${locale}/app/matches`}>{c.matches}</Link>
        </div>
      )}
      <div className="conversation-list">
        {items.map((row) => (
          <Link
            className="conversation-row"
            href={`/${locale}/app/messages/${row.id}`}
            key={row.id}
          >
            {row.member.photo_id && (
              <img
                src={`/api/photos/${row.member.photo_id}`}
                alt={c.photoAlt}
                width={60}
                height={60}
              />
            )}
            <span>
              <strong>{row.member.display_name}</strong>
              <small>{row.member.city}</small>
            </span>
            {row.unread && (
              <span className="tags">
                <span>{c.newMessages}</span>
              </span>
            )}
          </Link>
        ))}
      </div>
      {rows.length > 20 && last && (
        <Link
          className="button pagination"
          href={`/${locale}/app/messages?${new URLSearchParams({ before: last.created_at, id: last.id })}`}
        >
          {c.nextPage}
        </Link>
      )}
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { memberContext, type Member } from "@/lib/member/data";
import { memberCopy } from "@/lib/member/i18n";
import { uuid, messageCursor } from "@/lib/member/validation";
import { Thread, type ThreadMessage } from "@/components/member/thread";
import { BlockButton, Report } from "@/components/member/controls";
export default async function Conversation({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ before?: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale) || !uuid.safeParse(id).success) notFound();
  const { db } = await memberContext(locale),
    c = memberCopy[locale],
    q = await searchParams;
  const cursor = messageCursor.safeParse(q.before);
  const { data, error } = await db.rpc("read_thread", {
    conversation: id,
    before_id: cursor.success ? cursor.data : null,
  });
  if (error || !data)
    return (
      <div className="empty-state">
        <h1>{c.conversationUnavailable}</h1>
        <Link href={`/${locale}/app/messages`}>{c.messages}</Link>
      </div>
    );
  const thread = data as { member: Member; messages: ThreadMessage[] };
  return (
    <>
      <Link className="text-link" href={`/${locale}/app/messages`}>
        ← {c.messages}
      </Link>
      <div className="member-title">
        <h1>{thread.member.display_name}</h1>
        <Link href={`/${locale}/app/members/${thread.member.public_id}`}>
          {c.viewProfile}
        </Link>
      </div>
      {thread.messages.length === 50 && (
        <Link
          href={`/${locale}/app/messages/${id}?before=${thread.messages[0].id}`}
        >
          {c.olderMessages}
        </Link>
      )}
      {q.before && (
        <Link className="text-link" href={`/${locale}/app/messages/${id}`}>
          {c.refresh}
        </Link>
      )}
      <Thread
        key={id}
        locale={locale}
        conversation={id}
        messages={thread.messages}
      />
      <div className="safety-actions">
        <BlockButton id={thread.member.public_id} locale={locale} />
        <Report id={thread.member.public_id} locale={locale} />
      </div>
    </>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { memberCopy, message } from "@/lib/member/i18n";
import { postMember } from "./controls";
export type ThreadMessage = {
  id: string;
  body: string;
  mine: boolean;
  created_at: string;
};
export function Thread({
  locale,
  conversation,
  messages,
}: {
  locale: Locale;
  conversation: string;
  messages: ThreadMessage[];
}) {
  const c = memberCopy[locale],
    router = useRouter();
  const [body, setBody] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const retry = useRef<{ body: string; id: string } | null>(null);
  const latest = messages.at(-1)?.id;
  useEffect(() => {
    if (latest)
      void postMember({
        action: "read",
        conversation,
        through_id: latest,
      }).catch(() => {});
  }, [latest, conversation]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 15000);
    return () => clearInterval(timer);
  }, [router]);
  return (
    <>
      <div className="message-history" aria-live="polite">
        {!messages.length && <p>{c.noMessages}</p>}
        {messages.map((m) => (
          <article
            className={`message-bubble ${m.mine ? "mine" : ""}`}
            key={m.id}
          >
            <small>{m.mine ? c.you : ""}</small>
            <p>{m.body}</p>
            <time dateTime={m.created_at}>
              {new Intl.DateTimeFormat(locale, {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(m.created_at))}
            </time>
          </article>
        ))}
      </div>
      <form
        className="message-composer"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!body.trim() || busy) return;
          setBusy(true);
          setError("");
          const draft = body;
          if (retry.current?.body !== draft)
            retry.current = { body: draft, id: crypto.randomUUID() };
          try {
            const d = await postMember({
              action: "send",
              conversation,
              body: draft,
              request_id: retry.current.id,
            });
            if (d.error) setError(message(c, d.error));
            else {
              setBody((current) => (current === draft ? "" : current));
              retry.current = null;
              router.refresh();
            }
          } catch {
            setError(c.requestFailed);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          {c.messageBody}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            minLength={1}
            maxLength={2000}
            rows={3}
            required
          />
        </label>
        <div className="form-actions">
          <button
            type="button"
            className="quiet"
            onClick={() => router.refresh()}
          >
            {c.refresh}
          </button>
          <button className="button" disabled={busy || !body.trim()}>
            {busy ? c.working : c.sendMessage}
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
      </form>
    </>
  );
}

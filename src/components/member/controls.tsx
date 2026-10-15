"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { memberCopy, message } from "@/lib/member/i18n";
import type { Locale } from "@/lib/i18n";
import { reportCategories } from "@/lib/member/validation";
export async function postMember(body: unknown) {
  const r = await fetch("/api/member", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}
export function Logout({ locale }: { locale: Locale }) {
  const c = memberCopy[locale],
    router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <>
      <button
        className="quiet"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const r = await fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "logout", locale }),
            });
            const d = await r.json();
            if (d.redirect) {
              router.push(d.redirect);
              router.refresh();
            } else setError(message(c, d.error));
          } catch {
            setError(c.requestFailed);
          }
          setBusy(false);
        }}
      >
        {busy ? c.working : c.logout}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
export function Interest({
  id,
  locale,
  sent = false,
}: {
  id: string;
  locale: Locale;
  sent?: boolean;
}) {
  const c = memberCopy[locale],
    router = useRouter();
  const [busy, setBusy] = useState(false),
    [done, setDone] = useState(sent),
    [notice, setNotice] = useState("");
  return (
    <div>
      <button
        className="button"
        disabled={busy || done}
        onClick={async () => {
          setBusy(true);
          try {
            const d = await postMember({ action: "like", id });
            if (d.error) setNotice(message(c, d.error));
            else {
              setDone(true);
              setNotice(d.matched ? c.matched : c.interestSent);
              router.refresh();
            }
          } catch {
            setNotice(c.requestFailed);
          }
          setBusy(false);
        }}
      >
        {busy ? c.working : done ? c.interestSent : c.interested}
      </button>
      {notice && (
        <p className="form-notice" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}
export function BlockButton({
  id,
  locale,
  remove = false,
}: {
  id: string;
  locale: Locale;
  remove?: boolean;
}) {
  const c = memberCopy[locale],
    router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div>
      <button
        className="quiet danger"
        disabled={busy}
        onClick={async () => {
          if (!remove && !window.confirm(c.confirmBlock)) return;
          setBusy(true);
          try {
            const d = await postMember({
              action: remove ? "unblock" : "block",
              id,
            });
            if (d.error) setError(message(c, d.error));
            else {
              if (!remove) router.push(`/${locale}/app/discover`);
              router.refresh();
            }
          } catch {
            setError(c.requestFailed);
          }
          setBusy(false);
        }}
      >
        {remove ? c.unblock : c.block}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
export function Report({ id, locale }: { id: string; locale: Locale }) {
  const c = memberCopy[locale];
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  return (
    <details className="report">
      <summary>{c.report}</summary>
      <p>{c.reportHelp}</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          try {
            const d = await postMember({
              action: "report",
              id,
              category: f.get("category"),
              notes: f.get("notes"),
            });
            setNotice(d.error ? message(c, d.error) : c.reportSent);
          } catch {
            setNotice(c.requestFailed);
          }
          setBusy(false);
        }}
      >
        <label>
          {c.category}
          <select name="category">
            {reportCategories.map((r, i) => (
              <option key={r} value={r}>
                {c.reportCategories[i]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {c.notes}
          <textarea name="notes" maxLength={1500} />
        </label>
        <button className="button" disabled={busy}>
          {busy ? c.working : c.report}
        </button>
        <p role="status">{notice}</p>
      </form>
    </details>
  );
}

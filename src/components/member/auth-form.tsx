"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { memberCopy, message } from "@/lib/member/i18n";
import type { Locale } from "@/lib/i18n";
export type AuthMode = "login" | "signup" | "forgot" | "reset" | "resend";
export function AuthForm({
  locale,
  mode,
  configured,
  notice: initialNotice,
}: {
  locale: Locale;
  mode: AuthMode;
  configured: boolean;
  notice?: string;
}) {
  const c = memberCopy[locale],
    router = useRouter();
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(
      initialNotice ? message(c, initialNotice) : "",
    ),
    [error, setError] = useState(false);
  return (
    <div className="auth-card">
      <p className="eyebrow">18+ · Türkiye × Indonesia</p>
      <h1>{c[mode]}</h1>
      {!configured && (
        <p className="form-notice" role="status">
          {c.backendUnavailable}
        </p>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setNotice("");
          setError(false);
          const f = new FormData(e.currentTarget);
          setBusy(true);
          try {
            const r = await fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: mode,
                locale,
                email: f.get("email"),
                password: f.get("password"),
                adult: f.get("adult") === "on",
              }),
            });
            const d = await r.json();
            if (d.redirect) {
              router.push(d.redirect);
              router.refresh();
            } else {
              setError(Boolean(d.error));
              setNotice(message(c, d.error || d.notice));
            }
          } catch {
            setError(true);
            setNotice(c.requestFailed);
          }
          setBusy(false);
        }}
      >
        {mode !== "reset" && (
          <label>
            {c.email}
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
        )}
        {["login", "signup", "reset"].includes(mode) && (
          <label>
            {c.password}
            <input
              type="password"
              name="password"
              required
              minLength={mode === "login" ? 1 : 12}
              maxLength={128}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
            {mode !== "login" && <small>{c.passwordHelp}</small>}
          </label>
        )}
        {mode === "signup" && (
          <>
            <label className="check">
              <input type="checkbox" name="adult" required />
              {c.adult}
            </label>
            <small>{c.adultNote}</small>
          </>
        )}
        <button className="button full" disabled={!configured || busy}>
          {busy
            ? c.working
            : ["forgot", "resend"].includes(mode)
              ? c.send
              : c[mode]}
        </button>
        {notice && (
          <p className="form-notice" role={error ? "alert" : "status"}>
            {notice}
          </p>
        )}
      </form>
      <div className="auth-links">
        {(["login", "signup", "forgot", "resend"] as const)
          .filter((m) => m !== mode)
          .map((m) => (
            <Link key={m} href={`/${locale}/auth/${m}`}>
              {c[m]}
            </Link>
          ))}
      </div>
    </div>
  );
}

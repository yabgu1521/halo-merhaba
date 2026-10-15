import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { brand } from "@/lib/brand";
import { memberCopy } from "@/lib/member/i18n";
import { configured } from "@/lib/supabase/server";
import { Logout } from "@/components/member/controls";
import "./member.css";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function MemberLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = memberCopy[locale];
  if (!configured())
    return (
      <main className="wrap member-unavailable">
        <Link href={`/${locale}`} className="brand">
          {brand.name}
        </Link>
        <h1>{c.backendUnavailable}</h1>
        <Link className="button" href={`/${locale}/auth/login`}>
          {c.login}
        </Link>
      </main>
    );
  return (
    <>
      <header className="member-header">
        <Link href={`/${locale}`} className="brand">
          <span className="mark">{brand.monogram}</span>
          {brand.name}
        </Link>
        <div className="header-actions">
          <div className="locales">
            {(["en", "tr", "id"] as const).map((l) => (
              <Link
                key={l}
                href={`/${l}/app/discover`}
                lang={l}
                aria-current={locale === l ? "page" : undefined}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
          <Logout locale={locale} />
        </div>
      </header>
      <nav className="member-nav" aria-label={c.community}>
        <Link href={`/${locale}/app/discover`}>{c.discover}</Link>
        <Link href={`/${locale}/app/matches`}>{c.matches}</Link>
        <Link href={`/${locale}#community`}>{c.community}</Link>
        <Link href={`/${locale}#marriage`}>{c.marriage}</Link>
        <Link href={`/${locale}/app/profile`}>{c.profile}</Link>
      </nav>
      <main className="member-main wrap">{children}</main>
    </>
  );
}

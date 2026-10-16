import { matchmakingCopy } from "@/lib/matchmaking-copy";
import { NavLink } from "@/components/member/nav-link";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { brand } from "@/lib/brand";
import { memberCopy } from "@/lib/member/i18n";
import { productCopy } from "@/lib/product-copy";
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
  const c = memberCopy[locale],
    p = productCopy[locale];
  if (!configured())
    return (
      <main className="wrap member-unavailable">
        <Link className="brand" href={`/${locale}`}>
          {brand.name}
        </Link>
        <h1>{c.backendUnavailable}</h1>
        <Link className="button" href={`/${locale}/auth/login`}>
          {c.login}
        </Link>
      </main>
    );
  const nav = [
    ["discover", c.discover, "◈"],
    ["matches", c.matches, "↔"],
    ["messages", c.messages, "▤"],
    ["more", p.more, "☰"],
  ];
  return (
    <>
      <a className="skip" href="#member-main">
        {c.discover}
      </a>
      <header className="member-header">
        <Link className="brand" href={`/${locale}/app/discover`}>
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
          <Link href={`/${locale}/app/account`}>{c.account}</Link>
          <Logout locale={locale} />
        </div>
      </header>
      <div className="member-workspace">
        <nav className="member-nav" aria-label={c.discover}>
          {nav.map(([href, label, icon]) => (
            <NavLink key={href} href={`/${locale}/app/${href}`}>
              <span aria-hidden>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
          <div className="desktop-secondary">
            <Link href={`/${locale}/app/search`}>
              {matchmakingCopy[locale].search}
            </Link>
            <Link href={`/${locale}/app/preferences`}>
              {matchmakingCopy[locale].preferences}
            </Link>
            <Link href={`/${locale}/app/likes`}>
              {matchmakingCopy[locale].interests}
            </Link>
            <Link href={`/${locale}/app/favorites`}>{c.favorites}</Link>
            <Link href={`/${locale}/app/marriage`}>{p.marriage}</Link>
            <Link href={`/${locale}/app/premium`}>{p.premium}</Link>
            <Link href={`/${locale}/app/profile`}>{c.profile}</Link>
          </div>
          <p className="nav-note">{p.membersOnly}</p>
        </nav>
        <main id="member-main" className="member-main">
          {children}
        </main>
      </div>
    </>
  );
}

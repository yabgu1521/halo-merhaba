import { matchmakingCopy } from "@/lib/matchmaking-copy";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { productCopy } from "@/lib/product-copy";
import { memberCopy } from "@/lib/member/i18n";
import { memberContext } from "@/lib/member/data";
export default async function More({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  await memberContext(locale, false);
  const p = productCopy[locale],
    c = memberCopy[locale];
  return (
    <section className="more-area">
      <p className="eyebrow">{p.menu}</p>
      <h1>{p.more}</h1>
      <div className="destination-list">
        {[
          ["search", matchmakingCopy[locale].search],
          ["preferences", matchmakingCopy[locale].preferences],
          ["favorites", c.favorites],
          ["likes", matchmakingCopy[locale].interests],
          ["profile", c.profile],
          ["marriage", p.marriage],
          ["premium", p.premium],
          ["account", c.account],
        ].map(([path, label]) => (
          <Link key={path} href={`/${locale}/app/${path}`}>
            {label}
            <span aria-hidden>↗</span>
          </Link>
        ))}
      </div>
      <div className="locales secondary-locales">
        {(["en", "tr", "id"] as const).map((l) => (
          <Link
            key={l}
            href={`/${l}/app/more`}
            lang={l}
            aria-current={locale === l ? "page" : undefined}
          >
            {l.toUpperCase()}
          </Link>
        ))}
      </div>
      <aside className="trust-note">
        <h2>{p.safety}</h2>
        <p>{p.safetyText}</p>
      </aside>
    </section>
  );
}

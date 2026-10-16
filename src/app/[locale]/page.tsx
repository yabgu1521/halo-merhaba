import Link from "next/link";
import { productCopy } from "@/lib/product-copy";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { brand, siteUrl } from "@/lib/brand";
import { copy, isLocale, locales } from "@/lib/i18n";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = copy[locale],
    origin = siteUrl();
  return {
    title: `${brand.name} · ${c.pathsTitle}`,
    description: c.intro,
    ...(origin
      ? {
          metadataBase: origin,
          alternates: {
            canonical: `/${locale}`,
            languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
          },
        }
      : {}),
    openGraph: { title: brand.name, description: c.intro, type: "website" },
  };
}
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = copy[locale],
    p = productCopy[locale];
  return (
    <>
      <a className="skip" href="#main">
        {c.skip}
      </a>
      <header id="top">
        <Link className="brand" href={`/${locale}`}>
          <span className="mark">
            {brand.monogram}
            <i>✦</i>
          </span>
          <span>
            {brand.name}
            <small>{brand.countries}</small>
          </span>
        </Link>
        <nav aria-label={c.nav[0]}>
          {c.nav.map((n, i) => (
            <a key={n} href={["#community", "#how", "#marriage"][i]}>
              {n}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <div className="locales" aria-label="Language">
            {locales.map((l) => (
              <Link
                key={l}
                href={`/${l}`}
                lang={l}
                aria-current={locale === l ? "page" : undefined}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
          <Link className="signin-link" href={`/${locale}/auth/login`}>
            {p.signin}
          </Link>
          <a className="button small" href={`/${locale}/auth/signup`}>
            {c.join} <span aria-hidden className="arrow" />
          </a>
        </div>
      </header>
      <main id="main">
        <section className="product-hero wrap">
          <div className="hero-story">
            <p className="eyebrow">{p.heroLabel}</p>
            <h1>{p.heroTitle}</h1>
            <p className="intro">{p.heroText}</p>
            <div className="actions">
              <Link className="button" href={`/${locale}/auth/signup`}>
                {p.create} <span aria-hidden>↗</span>
              </Link>
              <a className="text-link" href="#how">
                {p.how} ↓
              </a>
            </div>
            <p className="fine">{p.membersOnly}</p>
          </div>
          <div className="connection-art" role="img" aria-label={p.hello}>
            <div className="art-caption">{brand.countries}</div>
            <div className="greeting turkish">
              Merhaba<span lang="tr">Türkiye</span>
            </div>
            <div className="cultural-bridge" aria-hidden>
              ↔
            </div>
            <div className="greeting indonesian">
              Halo<span lang="id">Indonesia</span>
            </div>
            <div className="art-footer">
              <h2>{p.hello}</h2>
              <p>{p.helloText}</p>
            </div>
          </div>
        </section>
        <section className="understanding-band">
          <div className="wrap understanding-layout">
            <p className="eyebrow">↔ {p.insights}</p>
            <div>
              <h2>{p.understand}</h2>
              <p>{p.understandText}</p>
            </div>
            <div className="signal-list">
              <span>{p.sharedPurpose}</span>
              <span>{p.sharedInterest}</span>
              <span>{p.commonLanguage}</span>
            </div>
          </div>
        </section>
        <section id="community" className="section pale">
          <div className="wrap">
            <p className="eyebrow">{p.intentions}</p>
            <div className="section-heading">
              <h2>{c.pathsTitle}</h2>
              <p>{c.pathsIntro}</p>
            </div>
            <div className="grid three">
              {c.cards.map(([num, title, text]) => (
                <article className="path-card" key={num}>
                  <span className="number">{num}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <a className="text-link" href={`/${locale}/auth/signup`}>
                    {c.join} <span aria-hidden className="arrow" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="how" className="section wrap">
          <p className="eyebrow">{c.nav[1]}</p>
          <h2>{c.stepsTitle}</h2>
          <div className="grid three steps">
            {c.steps.map(([title, text], i) => (
              <article key={title}>
                <span className="step">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="wrap safety">
          <div>
            <p className="eyebrow">18+ · {brand.name}</p>
            <h2>{c.safetyTitle}</h2>
            <p>{c.safetyText}</p>
          </div>
          <ul>
            {c.safetyRules.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
        <section id="marriage" className="section wrap marriage">
          <div className="marriage-art" aria-hidden>
            <div>✦</div>
            <span>Türkiye</span>
            <span>Indonesia</span>
            <i />
          </div>
          <div>
            <p className="eyebrow">{c.marriageLabel}</p>
            <h2>{c.marriageTitle}</h2>
            <p>{c.marriageText}</p>
            <ul className="service-list">
              {c.services.map((s) => (
                <li key={s}>
                  <span aria-hidden className="arrow" />
                  {s}
                </li>
              ))}
            </ul>
            <Link className="text-link" href={`/${locale}/app/marriage`}>
              {p.marriage} ↗
            </Link>
            <p className="warning">{c.warning}</p>
            <small>{c.legal}</small>
          </div>
        </section>
        <section className="section pale">
          <div className="wrap founder">
            <div>
              <p className="eyebrow">{c.founderLabel}</p>
              <h2>{c.founderTitle}</h2>
              <p>{c.founderText}</p>
              <small>{c.founderNote}</small>
            </div>
            <div className="media">
              <span aria-hidden>▷</span>
              <h3>{c.media}</h3>
              <p>{c.mediaText}</p>
            </div>
          </div>
        </section>
        <section className="section wrap">
          <h2>{c.pricingTitle}</h2>
          <p className="narrow">{c.pricingText}</p>
          <Link className="text-link" href={`/${locale}/app/premium`}>
            {p.viewPlans} ↗
          </Link>
          <div className="grid three pricing">
            {c.plans.map((p, i) => (
              <div key={p}>
                <span className="number">0{i + 1}</span>
                <h3>{p}</h3>
              </div>
            ))}
          </div>
        </section>
        <section className="section wrap faq">
          <h2>{c.faqTitle}</h2>
          <div>
            {c.faqs.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section id="join" className="launch wrap">
          <p className="eyebrow">{brand.name}</p>
          <h2>{p.joinTitle}</h2>
          <p>{p.joinText}</p>
          <Link className="button" href={`/${locale}/auth/signup`}>
            {p.create} ↗
          </Link>
          <Link className="text-link" href={`/${locale}/auth/login`}>
            {p.signin}
          </Link>
        </section>
      </main>
      <footer className="wrap">
        <div className="footer-top">
          <div>
            <strong>{brand.name}</strong>
            <p>{c.footer}</p>
          </div>
          <div className="policy-links">
            {c.policies.map((p, i) => (
              <a key={p} href={`#policy-${i}`}>
                {p}
              </a>
            ))}
          </div>
        </div>
        {c.policies.map((p, i) => (
          <details id={`policy-${i}`} key={p}>
            <summary>{p}</summary>
            <p>{c.policyText}</p>
          </details>
        ))}
        <small>
          © {new Date().getFullYear()} {brand.name} · 18+
        </small>
      </footer>
    </>
  );
}

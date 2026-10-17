"use client";
import Link from "next/link";
import { MarriageProduct } from "./marriage-product";
import { DocumentProduct } from "./document-product";
import { A1Product } from "./a1-product";
import { FamilyProduct } from "./family-product";
import { WorkbookProduct } from "./workbook-product";
import { TranslationProduct } from "./translation-product";
import { LifeProduct } from "./life-product";
import { CouplesProduct } from "./couples-product";
import { DigitalCatalog, ProductPrice } from "./digital-catalog";
import { useEffect, useRef, useState } from "react";
import {
  brandCopy,
  serviceWorlds,
  worldForService,
  serviceFaqs,
} from "@/content/brand-content";
import { BrandMotif, ConnectionPanel, LanguagePhrases } from "./brand-motif";
import { FlagPair } from "./country-art";
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import { business, track, whatsappLink } from "@/lib/config";
import { siteCopy } from "@/content/site-copy";
import {
  services,
  serviceBySlug,
  localizedList,
  type LeadKind,
} from "@/content/services";
import {
  productById,
  productTitles,
  productDescriptions,
  productMotif,
  productTone,
} from "@/content/catalog";
import { guides, guideById } from "@/content/guides";
import { IntakeForm } from "./intake-form";
import { Icon } from "./icons";
import { routePath, type PublicKind } from "@/lib/routes";
export function PublicPage({
  locale,
  kind = "home",
  slug,
  persistenceEnabled = false,
}: {
  locale: Locale;
  kind?: PublicKind;
  slug?: string;
  persistenceEnabled?: boolean;
}) {
  const c = siteCopy[locale],
    b = brandCopy[locale];
  const root = useRef<HTMLDivElement>(null),
    menuButton = useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = useState(false),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("all");
  const service = slug ? serviceBySlug(slug) : undefined,
    product = slug ? productById(slug) : undefined,
    article = slug ? guideById(slug) : undefined;
  const base = `/${locale}`;
  useEffect(() => {
    if (kind === "service" && service)
      track("service_view", { kind: service.kind });
  }, [kind, service]);
  useEffect(() => {
    if (!menu) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menu]);
  useEffect(() => {
    const element = root.current;
    if (
      !element ||
      !window.IntersectionObserver ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const nodes = element.querySelectorAll<HTMLElement>(".hm-reveal");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    nodes.forEach((node) => {
      if (node.getBoundingClientRect().top < window.innerHeight)
        node.classList.add("is-visible");
      else observer.observe(node);
    });
    element.dataset.revealReady = "true";
    return () => {
      observer.disconnect();
      delete element.dataset.revealReady;
    };
  }, [kind, locale, slug, query, category]);
  const activeNav = (url: string) =>
    url === "layanan"
      ? ["service", "services", "course"].includes(kind)
      : url === "panduan"
        ? ["guides", "article"].includes(kind)
        : url === "digital-guides"
          ? ["store", "product"].includes(kind)
          : kind === "about";
  const categoryName = (key: string) =>
    key === "marriage"
      ? c.categoryMarriage
      : key === "documents"
        ? c.categoryDocuments
        : key === "language"
          ? c.categoryLanguage
          : key === "life"
            ? c.categoryLife
            : c.categoryCulture;
  const href = (route: string) => `${base}/${route}`;
  const categoryIcon = (key: string) =>
    key === "marriage" ? "rings" : key === "documents" ? "file" : "book";
  const wa = whatsappLink(
    locale === "tr"
      ? "Halo Merhaba, danışmanlık hakkında bilgi almak istiyorum."
      : "Halo Merhaba, saya ingin informasi konsultasi.",
  );
  const serviceWa = service
    ? whatsappLink(`${c.whatsappIntro}: ${service.name[locale]}.`)
    : null;
  function courseLevels() {
    return (
      <div className="hm-course-levels">
        {c.courseLevels.map((level, index) => (
          <article key={level}>
            <span>0{index + 1}</span>
            <h2>{level}</h2>
            <p>{c.courseDescriptions[index]}</p>
            <a className="hm-text-link" href="#request-form">
              {c.courseCta}
              <Icon name="arrow" size={16} />
            </a>
          </article>
        ))}
      </div>
    );
  }
  function trust() {
    return (
      <section className="hm-section hm-trust" aria-labelledby="trust-title">
        <div className="hm-section-heading">
          <div>
            <p className="hm-eyebrow">{c.brandLine}</p>
            <h2 id="trust-title">{c.trustTitle}</h2>
          </div>
          <p>{c.trustIntro}</p>
        </div>
        <div className="hm-trust-grid">
          {c.trustPoints.map((point, index) => (
            <article className="hm-reveal" key={point}>
              <Icon name={index === 3 ? "shield" : "check"} size={22} />
              <h3>{point}</h3>
              <p>{c.trustTexts[index]}</p>
            </article>
          ))}
        </div>
        <p className="hm-trust-disclaimer">{c.officialNotice}</p>
      </section>
    );
  }
  function serviceCards() {
    return (
      <div className="hm-service-grid">
        {services
          .filter((s) => s.kind !== "precheck")
          .map((s, index) => (
            <Link
              className="hm-service-card"
              data-world={worldForService(s.slug)}
              href={href(`layanan/${s.slug}`)}
              key={s.slug}
            >
              <span className="hm-service-icon">
                <Icon name={s.icon} size={26} />
              </span>
              <span className="hm-card-number">0{index + 1}</span>
              <h3>{s.name[locale]}</h3>
              <p>{s.short[locale]}</p>
              <span className="hm-card-link">
                {s.cta[locale]}
                <Icon name="arrow" size={17} />
              </span>
            </Link>
          ))}
      </div>
    );
  }
  function faq(limit = c.faqQuestions.length) {
    const indexes =
      kind === "service" && service
        ? serviceFaqs[service.kind]
        : c.faqQuestions.map((_, index) => index);
    return (
      <div className="hm-faq-list">
        {indexes.slice(0, limit).map((index) => (
          <details key={c.faqQuestions[index]}>
            <summary>
              {c.faqQuestions[index]}
              <Icon name="chevron" size={17} />
            </summary>
            <p>{c.faqAnswers[index]}</p>
          </details>
        ))}
      </div>
    );
  }
  function guideCards() {
    const shown = guides.filter(
      (g) =>
        (category === "all" || g.category === category) &&
        (!query ||
          `${g.title[locale]} ${g.description[locale]}`
            .toLocaleLowerCase(locale)
            .includes(query.toLocaleLowerCase(locale))),
    );
    return (
      <>
        {kind === "guides" && (
          <div className="hm-guide-controls">
            <div className="hm-guide-tabs" aria-label={c.filter}>
              {[
                "all",
                "marriage",
                "documents",
                "life",
                "language",
                "culture",
              ].map((key) => (
                <button
                  key={key}
                  aria-pressed={category === key}
                  onClick={() => setCategory(key)}
                  className={category === key ? "active" : ""}
                >
                  {key === "all" ? c.all : categoryName(key)}
                </button>
              ))}
            </div>
            <label className="hm-search">
              <Icon name="search" size={17} />
              <input
                aria-label={c.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={c.search}
              />
            </label>
          </div>
        )}
        <div className="hm-guide-grid">
          {(kind === "home" ? shown.slice(0, 3) : shown).map((g, index) => (
            <article className="hm-guide-card hm-reveal" key={g.id}>
              <Link
                className={`hm-guide-art art-${g.category}`}
                href={href(`panduan/${g.id}`)}
                aria-label={g.title[locale]}
              >
                <BrandMotif
                  variant={
                    g.category === "marriage"
                      ? "marriage"
                      : g.category === "documents"
                        ? "documents"
                        : g.category === "language"
                          ? "language"
                          : "guidance"
                  }
                />
                <span className="hm-art-tag">
                  0{index + 1} · {categoryName(g.category)}
                </span>
              </Link>
              <p className="hm-meta">
                {categoryName(g.category)}
                <span>
                  {g.minutes} {c.minutes}
                </span>
              </p>
              <h3>
                <Link href={href(`panduan/${g.id}`)}>{g.title[locale]}</Link>
              </h3>
              <p>{g.description[locale]}</p>
              <Link className="hm-text-link" href={href(`panduan/${g.id}`)}>
                {c.read}
                <Icon name="arrow" size={16} />
              </Link>
            </article>
          ))}
        </div>
        {!shown.length && <p className="hm-empty">{c.noResults}</p>}
      </>
    );
  }
  function how() {
    return (
      <section className="hm-section hm-how">
        <p className="hm-eyebrow">{c.howEyebrow}</p>
        <h2>{c.howTitle}</h2>
        <ol className="hm-how-grid">
          {c.howSteps.map((title, index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{c.howTexts[index]}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }
  function worlds() {
    return (
      <section className="hm-section hm-worlds">
        <div className="hm-section-heading">
          <div>
            <p className="hm-eyebrow">{b.worldEyebrow}</p>
            <h2>{b.worldTitle}</h2>
          </div>
          <p>{b.worldIntro}</p>
        </div>
        <div className="hm-world-grid">
          {serviceWorlds.map((world, index) => (
            <article
              className="hm-world-card hm-reveal"
              data-world={world.key}
              key={world.key}
            >
              <div className="hm-world-art">
                <span>0{index + 1}</span>
                <BrandMotif variant={world.key} />
              </div>
              <div className="hm-world-copy">
                <h3>{b.worldNames[index]}</h3>
                <p>{b.worldTexts[index]}</p>
                <div>
                  {world.slugs.map((slug) => {
                    const item = serviceBySlug(slug)!;
                    return (
                      <Link
                        key={slug}
                        href={href(`layanan/${slug}`)}
                        className="hm-text-link"
                      >
                        {item.name[locale]}
                        <Icon name="arrow" size={16} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }
  function safety() {
    return (
      <section className="hm-safety hm-reveal">
        <div className="hm-safety-intro">
          <p className="hm-eyebrow">{b.safetyEyebrow}</p>
          <h2>{b.safetyTitle}</h2>
          <p>{b.safetyIntro}</p>
          <Link href={href("privasi")} className="hm-text-link">
            {c.privacy}
            <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="hm-safety-points">
          {b.safetyPoints.map((title, index) => (
            <article key={title}>
              <Icon
                name={["shield", "lock", "check", "compass"][index]}
                size={22}
              />
              <div>
                <h3>{title}</h3>
                <p>{b.safetyTexts[index]}</p>
              </div>
            </article>
          ))}
        </div>
        <aside className="hm-official-note">
          <span>{b.noticeTitle}</span>
          <p>{c.officialNotice}</p>
        </aside>
      </section>
    );
  }
  function finalCta() {
    return (
      <section className="hm-final-cta hm-reveal">
        <div>
          <p className="hm-eyebrow">{b.finalEyebrow}</p>
          <h2>{b.finalTitle}</h2>
          <p>{b.finalText}</p>
          <div className="hm-actions">
            <Link
              className="hm-button"
              href={href("layanan/konsultasi#request-form")}
            >
              {b.finalCta}
              <Icon name="arrow" size={18} />
            </Link>
            {wa && (
              <a
                className="hm-whatsapp"
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { source: "final_cta" })}
              >
                {c.whatsapp}
                <Icon name="arrow" size={16} />
              </a>
            )}
          </div>
        </div>
        <div className="hm-final-mark" aria-hidden="true">
          <BrandMotif />
        </div>
      </section>
    );
  }
  function heading(title: string, text?: string, eyebrow?: string) {
    return (
      <div className="hm-page-heading">
        <p className="hm-eyebrow">{eyebrow || c.brandLine}</p>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
    );
  }
  function instagram() {
    return (
      <section className="hm-instagram">
        <span className="hm-instagram-symbol">
          <Icon name="instagram" size={33} />
        </span>
        <div>
          <p className="hm-eyebrow">@{business.instagramHandle}</p>
          <h2>{c.instagram}</h2>
          <p>{c.instagramText}</p>
        </div>
        <a
          className="hm-button secondary"
          href={business.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {c.instagramCta}
          <Icon name="arrow" size={17} />
        </a>
      </section>
    );
  }
  return (
    <div className="hm-app" ref={root}>
      <a className="hm-skip" href="#hm-main">
        {c.choose}
      </a>
      <header className="hm-header">
        <Link className="hm-logo" href={base}>
          <span className="hm-logo-symbol">
            h<span>m</span>
          </span>
          <span>
            halo<span>merhaba</span>
            <small>{c.brandLine}</small>
          </span>
        </Link>
        <nav
          id="hm-navigation"
          className={menu ? "open" : ""}
          aria-label={c.services}
        >
          {[
            ["layanan", c.services],
            ["panduan", c.guides],
            ["digital-guides", c.store],
            ["tentang", c.about],
          ].map(([url, label]) => (
            <Link
              key={url}
              href={href(url)}
              aria-current={activeNav(url) ? "page" : undefined}
              onClick={() => setMenu(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            className="hm-mobile-contact"
            aria-current={kind === "contact" ? "page" : undefined}
            href={href("kontak")}
            onClick={() => setMenu(false)}
          >
            {c.contact}
            <Icon name="arrow" size={16} />
          </Link>
        </nav>
        <div className="hm-header-actions">
          <div className="hm-language" aria-label={b.languageNav}>
            {locales.map((l) => (
              <Link
                key={l}
                href={`/${l}${routePath(kind, slug)}`}
                lang={l}
                aria-current={locale === l ? "page" : undefined}
              >
                {l.toUpperCase()}
              </Link>
            ))}
          </div>
          <Link className="hm-button compact" href={href("kontak")}>
            {c.contact}
            <Icon name="arrow" size={15} />
          </Link>
          <button
            className="hm-menu"
            ref={menuButton}
            aria-controls="hm-navigation"
            aria-expanded={menu}
            aria-label={c.menu}
            onClick={() => setMenu(!menu)}
          >
            <Icon name={menu ? "close" : "menu"} size={22} />
          </button>
        </div>
      </header>
      <main id="hm-main" tabIndex={-1}>
        {kind === "home" && (
          <>
            <section className="hm-hero hm-wrap">
              <div className="hm-hero-copy">
                <p className="hm-eyebrow">{c.eyebrow}</p>
                <h1>
                  {c.heroTitle.split("\n")[0]}
                  <br />
                  <em>{c.heroTitle.split("\n")[1]}</em>
                </h1>
                <p className="hm-hero-text">{c.heroText}</p>
                <div className="hm-actions">
                  <Link className="hm-button" href="#services">
                    {c.choose}
                    <Icon name="arrow" size={18} />
                  </Link>
                  {wa ? (
                    <a
                      className="hm-whatsapp"
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        track("whatsapp_click", { source: "hero" })
                      }
                    >
                      <Icon name="chat" size={17} />
                      {c.whatsapp}
                    </a>
                  ) : (
                    <Link
                      className="hm-whatsapp"
                      href={href("layanan/konsultasi#request-form")}
                    >
                      <Icon name="chat" size={17} />
                      {c.consultCta}
                    </Link>
                  )}
                </div>
                <div className="hm-hero-foot">
                  <Icon name="shield" size={16} />
                  {c.heroFoot}
                </div>
              </div>
              <div className="hm-hero-art">
                <ConnectionPanel locale={locale} />
              </div>
            </section>
            <section className="hm-section hm-wrap" id="services">
              <div className="hm-section-heading">
                <div>
                  <p className="hm-eyebrow">{c.sectionEyebrow}</p>
                  <h2>{c.servicesTitle}</h2>
                </div>
                <p>{c.servicesText}</p>
              </div>
              {serviceCards()}
            </section>
            <div className="hm-wrap">
              {worlds()}
              {trust()}
            </div>
            <div className="hm-warm-band">
              <div className="hm-wrap">{how()}</div>
            </div>
            <div className="hm-wrap">{safety()}</div>
            <section className="hm-section hm-wrap">
              <div className="hm-section-heading">
                <div>
                  <p className="hm-eyebrow">{c.guides}</p>
                  <h2>{b.resourceTitle}</h2>
                </div>
                <Link className="hm-text-link" href={href("panduan")}>
                  {c.allGuides}
                  <Icon name="arrow" size={17} />
                </Link>
              </div>
              {guideCards()}
            </section>
            <div className="hm-wrap hm-resource-links">
              <Link href={href("kursus")}>
                <Icon name="book" size={24} />
                <span>
                  {c.course}
                  <small>{c.courseUnknown}</small>
                </span>
                <Icon name="arrow" size={20} />
              </Link>
              <Link href={href("digital-guides")}>
                <Icon name="file" size={24} />
                <span>
                  {c.store}
                  <small>
                    {c.coming} · {c.productUnavailable}
                  </small>
                </span>
                <Icon name="arrow" size={20} />
              </Link>
            </div>
            <section className="hm-section hm-wrap hm-home-faq">
              <div>
                <p className="hm-eyebrow">{c.faq}</p>
                <h2>{c.faqTitle}</h2>
                <Link className="hm-text-link" href={href("faq")}>
                  {c.details}
                  <Icon name="arrow" size={16} />
                </Link>
              </div>
              {faq(4)}
            </section>
            <div className="hm-wrap">
              {finalCta()}
              {instagram()}
            </div>
          </>
        )}
        {kind === "services" && (
          <div className="hm-wrap">
            {heading(c.servicesTitle, c.servicesText, c.services)}
            {serviceCards()}
            <section className="hm-precheck-callout">
              <Icon name="check" size={30} />
              <div>
                <h2>
                  {services.find((s) => s.kind === "precheck")!.name[locale]}
                </h2>
                <p>
                  {services.find((s) => s.kind === "precheck")!.short[locale]}
                </p>
              </div>
              <Link
                className="hm-button"
                href={href("layanan/pemeriksaan-dokumen")}
              >
                {c.details}
                <Icon name="arrow" size={17} />
              </Link>
            </section>
            {how()}
          </div>
        )}
        {kind === "service" && service && (
          <div
            className="hm-wrap"
            data-service-world={worldForService(service.slug)}
          >
            <section className="hm-service-hero">
              <div>
                {heading(
                  service.name[locale],
                  service.short[locale],
                  c.services,
                )}
                <div className="hm-actions">
                  <a className="hm-button" href="#request-form">
                    {service.cta[locale]}
                    <Icon name="arrow" size={18} />
                  </a>
                  {serviceWa && (
                    <a
                      className="hm-whatsapp"
                      href={serviceWa}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        track("whatsapp_click", { kind: service.kind })
                      }
                    >
                      {service.whatsappCta[locale]}
                    </a>
                  )}
                </div>
              </div>
              <div className="hm-service-sigil" aria-hidden="true">
                <BrandMotif variant={worldForService(service.slug)} />
                <span>{c.brandLine}</span>
              </div>
            </section>
            <div className="hm-service-detail">
              <article>
                <section>
                  <span className="hm-detail-icon">
                    <Icon name={service.icon} size={32} />
                  </span>
                  <h2>{c.forWhom}</h2>
                  <p>{service.audience[locale]}</p>
                </section>
                <section>
                  <h2>{c.problem}</h2>
                  <p>{service.problem[locale]}</p>
                </section>
                <section>
                  <h2>{c.help}</h2>
                  <ul className="hm-check-list">
                    {localizedList(service.help, locale).map((item) => (
                      <li key={item}>
                        <Icon name="check" size={16} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h2>{c.process}</h2>
                  <ol className="hm-process-list">
                    {c.howSteps.map((title, index) => (
                      <li key={title}>
                        <strong>{title}</strong>
                        <p>{c.howTexts[index]}</p>
                      </li>
                    ))}
                  </ol>
                </section>
                <section className="hm-boundary">
                  <Icon name="shield" size={23} />
                  <div>
                    <h2>{c.limitations}</h2>
                    <p>{service.limitations[locale]}</p>
                    <p>{c.officialNotice}</p>
                  </div>
                </section>
                <section>
                  <h2>{c.faqTitle}</h2>
                  {faq()}
                </section>
              </article>
              <aside className="hm-service-next">
                <p className="hm-eyebrow">{c.nextStep}</p>
                <h2>{service.cta[locale]}</h2>
                {service.provisionalPrice && (
                  <div className="hm-provisional-price">
                    <strong>{service.provisionalPrice} TRY</strong>
                    <small>{c.testPrice}</small>
                  </div>
                )}
                <p>{c.sensitiveWarning}</p>
                <a className="hm-button" href="#request-form">
                  {service.cta[locale]}
                  <Icon name="arrow" size={17} />
                </a>
                {serviceWa && (
                  <a
                    className="hm-text-link"
                    href={serviceWa}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track("whatsapp_click", { kind: service.kind })
                    }
                  >
                    {service.whatsappCta[locale]}
                    <Icon name="arrow" size={16} />
                  </a>
                )}
                <small>{c.inquiryNote}</small>
              </aside>
            </div>
            {service.kind === "course" && (
              <>
                <LanguagePhrases locale={locale} />
                {courseLevels()}
                <p className="hm-course-note">{c.courseUnknown}</p>
              </>
            )}
            <IntakeForm
              kind={service.kind}
              locale={locale}
              persistenceEnabled={persistenceEnabled}
            />
          </div>
        )}
        {kind === "course" && (
          <div className="hm-wrap">
            <section className="hm-service-hero">
              <div>
                {heading(c.courseTitle, c.courseText, c.course)}
                <a href="#request-form" className="hm-button">
                  {c.courseCta}
                  <Icon name="arrow" size={18} />
                </a>
              </div>
              <div className="hm-course-language">
                <BrandMotif variant="language" />
                <LanguagePhrases locale={locale} />
              </div>
            </section>
            {courseLevels()}
            <p className="hm-course-note">{c.courseUnknown}</p>
            <IntakeForm
              kind="course"
              locale={locale}
              persistenceEnabled={persistenceEnabled}
            />
          </div>
        )}
        {kind === "store" && (
          <div className="hm-wrap">
            {heading(c.storeTitle, c.storeText, "HALO MERHABA STORE")}
            <div className="hm-store-geography">
              <FlagPair />
              <span>{c.brandLine}</span>
            </div>
            <DigitalCatalog locale={locale} />
            <div className="hm-boundary hm-store-boundary">
              <Icon name="lock" size={23} />
              <p>
                {c.productUnavailable} {c.priceNote}
              </p>
            </div>
          </div>
        )}
        {kind === "product" && product && (
          <div className="hm-wrap">
            <Link className="hm-back" href={href("digital-guides")}>
              ← {c.store}
            </Link>
            {product.id === "marriage-checklist-wni" ? (
              <MarriageProduct locale={locale} />
            ) : product.id === "document-apostille-organizer" ? (
              <DocumentProduct locale={locale} />
            ) : product.id === "turkish-a1-survival" ? (
              <A1Product locale={locale} />
            ) : product.id === "family-meeting-toolkit" ? (
              <FamilyProduct locale={locale} />
            ) : product.id === "marriage-preparation-workbook" ? (
              <WorkbookProduct locale={locale} />
            ) : product.id === "translation-document-kit" ? (
              <TranslationProduct locale={locale} />
            ) : product.id === "turkiye-life-starter" ? (
              <LifeProduct locale={locale} />
            ) : product.id === "turkish-for-couples" ? (
              <CouplesProduct locale={locale} />
            ) : (
              <>
                <section className="hm-product-detail">
                  <div
                    className={`hm-book-scene ${productTone(product.category)}`}
                  >
                    <div className="hm-book">
                      <span>
                        HALO MERHABA<span>INDONESIA ↔ TÜRKİYE</span>
                      </span>
                      <BrandMotif variant={productMotif(product.category)} />
                      <FlagPair />
                      <small>{c.coming}</small>
                    </div>
                  </div>
                  <div>
                    <span className="hm-coming">
                      <i />
                      {product.contentReady ? c.productReadyLabel : c.preparing}
                    </span>
                    <h1>{productTitles[product.id][locale]}</h1>
                    <p>{productDescriptions[product.id][locale]}</p>
                    <div className="hm-product-price">
                      <ProductPrice product={product} locale={locale} />
                    </div>
                    <p className="hm-muted">{c.priceNote}</p>
                    <div className="hm-boundary">
                      <Icon name="lock" size={22} />
                      <p>{c.productUnavailable}</p>
                    </div>
                    <a className="hm-button" href="#request-form">
                      {c.notify}
                      <Icon name="arrow" size={17} />
                    </a>
                  </div>
                </section>
                <section className="hm-product-plan">
                  <h2>{c.productInside}</h2>
                  <ul>
                    {product.planned_contents[locale].map((item) => (
                      <li key={item}>
                        <Icon name="check" size={17} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
            <IntakeForm
              kind="product_interest"
              productId={product.id}
              locale={locale}
              persistenceEnabled={persistenceEnabled}
            />
          </div>
        )}
        {kind === "guides" && (
          <div className="hm-wrap">
            {heading(c.guidesTitle, c.guidesText, c.guides)}
            {guideCards()}
          </div>
        )}
        {kind === "article" && article && (
          <div className="hm-wrap">
            <Link className="hm-back" href={href("panduan")}>
              ← {c.guides}
            </Link>
            <article className="hm-article">
              <p className="hm-eyebrow">
                {categoryName(article.category)} · {article.minutes} {c.minutes}
              </p>
              <h1>{article.title[locale]}</h1>
              <p className="hm-article-lead">{article.description[locale]}</p>
              {article.category !== "language" && (
                <div className="hm-boundary">
                  <Icon name="shield" size={21} />
                  <p>{c.guideDisclaimer}</p>
                </div>
              )}
              {article.sections.map((section, index) => (
                <section key={index}>
                  <span className="hm-article-number">0{index + 1}</span>
                  <h2>{section.heading[locale]}</h2>
                  <p>{section.body[locale]}</p>
                  <ul>
                    {section.items[locale].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
              {article.category !== "language" && (
                <aside className="hm-article-sources">
                  <h3>
                    {c.officialTr} / {c.officialId}
                  </h3>
                  <a
                    href="https://www.konsolosluk.gov.tr/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    konsolosluk.gov.tr ↗
                  </a>
                  <a
                    href="https://kemlu.go.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    kemlu.go.id ↗
                  </a>
                </aside>
              )}
              <div className="hm-article-next">
                <p className="hm-eyebrow">{c.related}</p>
                <h2>{c.serviceLink}</h2>
                <Link
                  className="hm-button"
                  href={href(
                    article.category === "language"
                      ? "kursus"
                      : "layanan/pemeriksaan-dokumen",
                  )}
                  onClick={() =>
                    track("article_to_service_click", { article: article.id })
                  }
                >
                  {c.request}
                  <Icon name="arrow" size={17} />
                </Link>
                <Link
                  className="hm-text-link"
                  href={href(`produk/${article.product}`)}
                >
                  {c.productDetail}
                  <Icon name="arrow" size={16} />
                </Link>
              </div>
            </article>
          </div>
        )}
        {kind === "about" && (
          <div className="hm-wrap">
            {heading(c.aboutTitle, c.aboutText, c.about)}
            <p className="hm-about-context">{c.aboutContext}</p>
            <div className="hm-values">
              {c.aboutPrinciples.map((title, index) => (
                <article key={title}>
                  <span>0{index + 1}</span>
                  <h2>{title}</h2>
                  <p>{c.aboutPrincipleText[index]}</p>
                </article>
              ))}
            </div>
            <section className="hm-team">
              {/* Replace this decorative slot only with consented real team photography. */}
              <div
                className="hm-photo-placeholder"
                data-content-slot="team-photo"
                aria-hidden="true"
              >
                <BrandMotif />
                <span className="hm-photo-connection">Indonesia ↔ Türkiye</span>
              </div>
              <div>
                <p className="hm-eyebrow">HALO MERHABA</p>
                <h2>{c.aboutMission}</h2>
                <p>{c.aboutMissionText}</p>
                <a
                  className="hm-text-link"
                  href={business.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{business.instagramHandle}
                  <Icon name="arrow" size={16} />
                </a>
              </div>
            </section>
            <section className="hm-confidentiality">
              <Icon name="shield" size={31} />
              <div>
                <h2>{c.confidentiality}</h2>
                <p>{c.confidentialityText}</p>
                <Link className="hm-text-link" href={href("privasi")}>
                  {c.privacy}
                  <Icon name="arrow" size={16} />
                </Link>
              </div>
            </section>
            <p className="hm-trust-disclaimer">{c.officialNotice}</p>
            {instagram()}
          </div>
        )}
        {kind === "faq" && (
          <div className="hm-wrap hm-narrow">
            {heading(c.faqTitle, undefined, c.faq)}
            {faq()}
            <Link className="hm-button hm-faq-contact" href={href("kontak")}>
              {c.contact}
              <Icon name="arrow" size={17} />
            </Link>
          </div>
        )}
        {kind === "contact" && (
          <div className="hm-wrap">
            {heading(c.contactTitle, c.contactText, c.contact)}
            <a className="hm-button hm-contact-inquiry" href="#request-form">
              {c.contactInquiry}
              <Icon name="arrow" size={17} />
            </a>
            <section className="hm-contact-grid" id="channels">
              <div className="hm-contact-channels">
                {wa && (
                  <article>
                    <Icon name="chat" size={25} />
                    <h2>WhatsApp</h2>
                    <a
                      className="hm-text-link"
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        track("whatsapp_click", { source: "contact" })
                      }
                    >
                      {c.whatsapp}
                      <Icon name="arrow" size={16} />
                    </a>
                  </article>
                )}
                {business.email && (
                  <article>
                    <Icon name="mail" size={25} />
                    <h2>{c.email}</h2>
                    <a href={`mailto:${business.email}`}>{business.email}</a>
                  </article>
                )}
                <article>
                  <Icon name="instagram" size={25} />
                  <h2>Instagram</h2>
                  <a
                    href={business.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @{business.instagramHandle} ↗
                  </a>
                </article>
              </div>
              <div className="hm-contact-options">
                {services.map((s) => (
                  <Link href={href(`layanan/${s.slug}`)} key={s.slug}>
                    <Icon name={s.icon} size={20} />
                    <span>{s.name[locale]}</span>
                    <Icon name="arrow" size={17} />
                  </Link>
                ))}
              </div>
            </section>
            <IntakeForm
              kind="consultation"
              locale={locale}
              persistenceEnabled={persistenceEnabled}
            />
          </div>
        )}
        {(kind === "privacy" || kind === "terms") && (
          <div className="hm-wrap hm-narrow hm-legal">
            {heading(kind === "privacy" ? c.privacyTitle : c.termsTitle)}
            {kind === "privacy" && (
              <p className="hm-legal-intro">{c.privacyIntro}</p>
            )}
            {(kind === "privacy" ? c.privacySections : c.termsSections).map(
              (text, index) => (
                <section key={index}>
                  <span>0{index + 1}</span>
                  <p>{text}</p>
                </section>
              ),
            )}
            <Link className="hm-text-link" href={href("kontak")}>
              {c.contact}
              <Icon name="arrow" size={16} />
            </Link>
          </div>
        )}
      </main>
      <footer className="hm-footer">
        <div className="hm-wrap">
          <div className="hm-footer-top">
            <div>
              <Link className="hm-logo" href={base}>
                halo<span>merhaba</span>
              </Link>
              <p>{c.footer}</p>
              <span className="hm-footer-connection">
                <FlagPair />
                INDONESIA ↔ TÜRKİYE
              </span>
            </div>
            <div>
              <strong>{c.services}</strong>
              <Link href={href("layanan/menikah-di-turkiye")}>
                {services[0].name[locale]}
              </Link>
              <Link href={href("layanan/terjemahan")}>
                {services[2].name[locale]}
              </Link>
              <Link href={href("kursus")}>{c.course}</Link>
            </div>
            <div>
              <strong>{c.guides}</strong>
              <Link href={href("panduan")}>{c.guides}</Link>
              <Link href={href("digital-guides")}>{c.store}</Link>
              <Link href={href("faq")}>{c.faq}</Link>
            </div>
            <div>
              <strong>{c.contact}</strong>
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram ↗
              </a>
              <Link href={href("tentang")}>{c.about}</Link>
              <Link href={href("kontak")}>{c.contact}</Link>
            </div>
          </div>
          <div className="hm-footer-bottom">
            <span>© {new Date().getFullYear()} Halo Merhaba</span>
            <p>{c.footerNote}</p>
            <Link href={href("privasi")}>{c.privacy}</Link>
            <Link href={href("ketentuan")}>{c.terms}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

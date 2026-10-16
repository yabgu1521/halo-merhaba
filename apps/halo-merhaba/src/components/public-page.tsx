"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  products,
  productById,
  productTitles,
  productDescriptions,
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
  const c = siteCopy[locale];
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
            <article key={point}>
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
  function faq() {
    return (
      <div className="hm-faq-list">
        {c.faqQuestions.map((q, index) => (
          <details key={q}>
            <summary>
              {q}
              <Icon name="chevron" size={17} />
            </summary>
            <p>{c.faqAnswers[index]}</p>
          </details>
        ))}
      </div>
    );
  }
  function productCards() {
    return (
      <div className="hm-product-grid">
        {products.map((p) => (
          <article className="hm-product-card" key={p.id}>
            <Link
              className={`hm-book-scene tone-${p.index}`}
              href={href(`produk/${p.id}`)}
              aria-label={productTitles[p.id][locale]}
            >
              <div className="hm-book">
                <span>
                  HALO MERHABA<span>INDONESIA ↔ TÜRKİYE</span>
                </span>
                <Icon name={categoryIcon(p.category)} size={45} />
                <h3>{productTitles[p.id][locale]}</h3>
                <i>01 / 0{p.index + 1}</i>
                <small>{c.coming}</small>
              </div>
              <span className="hm-book-shadow" />
            </Link>
            <div className="hm-product-info">
              <span className="hm-coming">
                <i />
                {c.coming}
              </span>
              <h3>
                <Link href={href(`produk/${p.id}`)}>
                  {productTitles[p.id][locale]}
                </Link>
              </h3>
              <p>{productDescriptions[p.id][locale]}</p>
              <div className="hm-product-price">
                <strong>
                  {p.proposed_test_price.amount} <small>TRY</small>
                </strong>
                <span>{c.testPrice}</span>
              </div>
              <Link className="hm-text-link" href={href(`produk/${p.id}`)}>
                {c.productDetail}
                <Icon name="arrow" size={16} />
              </Link>
            </div>
          </article>
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
          {shown.map((g, index) => (
            <article className="hm-guide-card" key={g.id}>
              <Link
                className={`hm-guide-art art-${g.category}`}
                href={href(`panduan/${g.id}`)}
                aria-label={g.title[locale]}
              >
                <span className="hm-art-disc" />
                <span className="hm-art-arch" />
                <span className="hm-art-paper">
                  <Icon name={categoryIcon(g.category)} size={39} />
                  <i>
                    HALO
                    <br />
                    MERHABA
                  </i>
                </span>
                <span className="hm-art-tag">
                  0{index + 1} · {c.guides}
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
        <div className="hm-how-grid">
          {c.howSteps.map((title, index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{c.howTexts[index]}</p>
            </article>
          ))}
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
    <div className="hm-app">
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
        <nav className={menu ? "open" : ""} aria-label={c.services}>
          {[
            ["layanan", c.services],
            ["panduan", c.guides],
            ["digital-guides", c.store],
            ["tentang", c.about],
          ].map(([url, label]) => (
            <Link key={url} href={href(url)} onClick={() => setMenu(false)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="hm-header-actions">
          <div className="hm-language" aria-label="Language">
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
            aria-expanded={menu}
            aria-label={c.menu}
            onClick={() => setMenu(!menu)}
          >
            <Icon name={menu ? "close" : "menu"} size={22} />
          </button>
        </div>
      </header>
      <main id="hm-main">
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
              <div className="hm-hero-art" aria-hidden="true">
                <span className="hm-hero-circle" />
                <div className="hm-arch turkey">
                  <div />
                  <i />
                </div>
                <div className="hm-arch indonesia">
                  <div />
                  <i />
                </div>
                <div className="hm-hero-paper">
                  <p>{c.paperLabel}</p>
                  <h2>{c.paperTitle}</h2>
                  <span className="hm-paper-lines" />
                  <small>{c.paperText}</small>
                  <span className="hm-paper-seal">hm</span>
                </div>
                <div className="hm-hero-sticker">
                  {c.heroNote}
                  <span>↗</span>
                </div>
                <span className="hm-hero-route">
                  INDONESIA <i>╌╌╌ ✦ ╌╌╌</i> TÜRKİYE
                </span>
              </div>
            </section>
            <div className="hm-specialization">
              <span>INDONESIA</span>
              <Icon name="globe" size={17} />
              <p>{c.brandLine}</p>
              <span>TÜRKİYE</span>
            </div>
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
            <div className="hm-wrap">{trust()}</div>
            <div className="hm-warm-band">
              <div className="hm-wrap">{how()}</div>
            </div>
            <section className="hm-section hm-wrap">
              <div className="hm-section-heading">
                <div>
                  <p className="hm-eyebrow">{c.guides}</p>
                  <h2>{c.guidesTitle}</h2>
                </div>
                <Link className="hm-text-link" href={href("panduan")}>
                  {c.allGuides}
                  <Icon name="arrow" size={17} />
                </Link>
              </div>
              {guideCards()}
            </section>
            <section className="hm-course-strip hm-wrap">
              <div className="hm-course-art" aria-hidden="true">
                <span>merhaba.</span>
                <small>selamat datang.</small>
                <i>ı ş ğ ü ö ç</i>
              </div>
              <div>
                <p className="hm-eyebrow">{c.course}</p>
                <h2>{c.courseTitle}</h2>
                <p>{c.courseText}</p>
                <Link className="hm-button" href={href("kursus")}>
                  {c.courseCta}
                  <Icon name="arrow" size={17} />
                </Link>
                <small>{c.courseUnknown}</small>
              </div>
            </section>
            <section className="hm-section hm-wrap">
              <div className="hm-section-heading">
                <div>
                  <p className="hm-eyebrow">HALO MERHABA STORE</p>
                  <h2>{c.storeTitle}</h2>
                </div>
                <p>{c.storeText}</p>
              </div>
              {productCards()}
            </section>
            <section className="hm-section hm-wrap hm-home-faq">
              <div>
                <p className="hm-eyebrow">{c.faq}</p>
                <h2>{c.faqTitle}</h2>
                <Link className="hm-text-link" href={href("faq")}>
                  {c.details}
                  <Icon name="arrow" size={16} />
                </Link>
              </div>
              {faq()}
            </section>
            <div className="hm-wrap">{instagram()}</div>
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
          <div className="hm-wrap">
            {heading(service.name[locale], service.short[locale], c.services)}
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
            {heading(c.courseTitle, c.courseText, c.course)}
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
            {productCards()}
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
            <section className="hm-product-detail">
              <div className={`hm-book-scene tone-${product.index}`}>
                <div className="hm-book">
                  <span>
                    HALO MERHABA<span>INDONESIA ↔ TÜRKİYE</span>
                  </span>
                  <Icon name={categoryIcon(product.category)} size={55} />
                  <h2>{productTitles[product.id][locale]}</h2>
                  <small>{c.coming}</small>
                </div>
              </div>
              <div>
                <span className="hm-coming">
                  <i />
                  {c.preparing}
                </span>
                <h1>{productTitles[product.id][locale]}</h1>
                <p>{productDescriptions[product.id][locale]}</p>
                <div className="hm-product-price">
                  <strong>{product.proposed_test_price.amount} TRY</strong>
                  <span>{c.testPrice}</span>
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
                {product.id === "marriage-checklist-wni"
                  ? localizedList(
                      {
                        id: [
                          "Daftar pertanyaan untuk instansi",
                          "Pelacak persiapan dan dokumen",
                          "Catatan langkah tindak lanjut",
                        ],
                        tr: [
                          "Kuruma sorulacak sorular",
                          "Hazırlık ve belge takibi",
                          "Sonraki adım notları",
                        ],
                        en: [],
                      },
                      locale,
                    ).map((item) => (
                      <li key={item}>
                        <Icon name="check" size={17} />
                        {item}
                      </li>
                    ))
                  : product.id === "document-apostille-organizer"
                    ? localizedList(
                        {
                          id: [
                            "Inventaris dokumen",
                            "Catatan terjemahan dan pengesahan",
                            "Pelacak tanggal tindak lanjut",
                          ],
                          tr: [
                            "Belge envanteri",
                            "Tercüme ve tasdik notları",
                            "Takip tarihi çizelgesi",
                          ],
                          en: [],
                        },
                        locale,
                      ).map((item) => (
                        <li key={item}>
                          <Icon name="check" size={17} />
                          {item}
                        </li>
                      ))
                    : localizedList(
                        {
                          id: [
                            "Ungkapan sehari-hari",
                            "Dialog singkat",
                            "Lembar latihan",
                          ],
                          tr: [
                            "Günlük ifadeler",
                            "Kısa diyaloglar",
                            "Alıştırma sayfaları",
                          ],
                          en: [],
                        },
                        locale,
                      ).map((item) => (
                        <li key={item}>
                          <Icon name="check" size={17} />
                          {item}
                        </li>
                      ))}
              </ul>
            </section>
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
                <Icon name="globe" size={64} />
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
              <span className="hm-footer-connection">INDONESIA ↔ TÜRKİYE</span>
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

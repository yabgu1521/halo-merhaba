import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { a1Copy } from "@/content/a1-product";
import { productById } from "@/content/catalog";
import { ProductPrice } from "./digital-catalog";
import { BrandMotif } from "./brand-motif";
import { CountryFlag, FlagPair } from "./country-art";
import { Icon } from "./icons";

export function A1Product({ locale }: { locale: Locale }) {
  const c = a1Copy[locale === "tr" ? "tr" : "id"];
  const product = productById("turkish-a1-survival")!;
  const notify = (
    <a className="hm-button" href="#request-form">
      {c.notify}
      <Icon name="arrow" size={16} />
    </a>
  );
  return (
    <article className="hm-marriage-product hm-a1-product">
      <section className="hm-product-detail hm-marriage-hero">
        <div className="hm-marriage-cover">
          <div className="hm-cover-brand">
            HALO MERHABA<small>INDONESIA ↔ TÜRKİYE</small>
          </div>
          <BrandMotif variant="language" />
          <FlagPair />
          <p>PDF · ID + TR</p>
        </div>
        <div>
          <span className="hm-coming">
            <i />
            {c.status}
          </span>
          <h1>{product.titles[locale]}</h1>
          <p className="hm-marriage-subtitle">{c.subtitle}</p>
          <p className="hm-marriage-package">
            2 PDF · Bahasa Indonesia + Türkçe · {c.pages}
          </p>
          <p className="hm-muted">{c.total}</p>
          <div className="hm-product-price">
            <ProductPrice product={product} locale={locale} />
          </div>
          {notify}
          <p className="hm-muted hm-marriage-access">{c.access}</p>
          <p className="hm-muted">{c.interestNote}</p>
          <Link
            className="hm-text-link"
            href={`/${locale}/kursus#request-form`}
          >
            {c.help}
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </section>
      <section className="hm-marriage-section hm-marriage-receive">
        <div>
          <p className="hm-eyebrow">01 / ID + TR</p>
          <h2>{c.packageTitle}</h2>
          <p>{c.packageIntro}</p>
          <div className="hm-edition-pair">
            {c.editions.map((edition, i) => (
              <div key={edition}>
                <CountryFlag country={i === 0 ? "id" : "tr"} />
                <strong>{edition}</strong>
                <span>{c.pages}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2>{c.toolsTitle}</h2>
          <p>{c.toolsIntro}</p>
          <ul className="hm-tools-list">
            {c.tools.map((tool) => (
              <li key={tool}>
                <span aria-hidden="true">✓</span>
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="hm-marriage-section hm-marriage-bilingual">
        <div>
          <FlagPair />
          <h2>{c.bilingualTitle}</h2>
          <p>{c.bilingual}</p>
          <p>{c.bilingualHelp}</p>
        </div>
        <BrandMotif variant="language" />
      </section>
      <section className="hm-marriage-section">
        <p className="hm-eyebrow">02 / {c.modules.length}</p>
        <h2>{c.modulesTitle}</h2>
        <p>{c.modulesIntro}</p>
        <div className="hm-module-grid">
          {c.modules.map(([title, summary], i) => (
            <details className="hm-content-module" key={title} open={i === 0}>
              <summary>
                <span className="hm-module-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{title}</span>
                <span className="hm-module-toggle" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>{summary}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="hm-marriage-section hm-marriage-boundary">
        <h2>{c.boundaryTitle}</h2>
        <p>{c.boundaryText}</p>
        <ul>
          {c.boundaries.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="hm-marriage-section hm-marriage-trust">
        <p>{c.safety}</p>
      </section>
      <section className="hm-marriage-final">
        <span className="hm-coming">
          <i />
          {c.status}
        </span>
        <h2>{c.notify}</h2>
        <div className="hm-product-price">
          <ProductPrice product={product} locale={locale} />
        </div>
        {notify}
        <p>{c.access}</p>
        <p>{c.interestNote}</p>
      </section>
    </article>
  );
}

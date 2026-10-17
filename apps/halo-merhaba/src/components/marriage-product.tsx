import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { marriageCopy } from "@/content/marriage-product";
import { productTitles, productById } from "@/content/catalog";
import { ProductPrice } from "./digital-catalog";
import { BrandMotif } from "./brand-motif";
import { CountryFlag, FlagPair } from "./country-art";
import { Icon } from "./icons";

export function MarriageProduct({ locale }: { locale: Locale }) {
  const c = marriageCopy[locale === "tr" ? "tr" : "id"];
  const title = productTitles["marriage-checklist-wni"][locale];
  let sectionNumber = 0;
  const notify = (
    <a className="hm-button" href="#request-form">
      {c.notify}
      <Icon name="arrow" size={16} />
    </a>
  );
  return (
    <article className="hm-marriage-product">
      <section className="hm-product-detail hm-marriage-hero">
        <div className="hm-marriage-cover">
          <div className="hm-cover-brand">
            HALO MERHABA<small>INDONESIA ↔ TÜRKİYE</small>
          </div>
          <BrandMotif variant="marriage" />
          <FlagPair />
          <p>PDF · ID + TR</p>
        </div>
        <div>
          <span className="hm-coming">
            <i />
            {c.status}
          </span>
          <h1>{title}</h1>
          <p className="hm-marriage-subtitle">{c.subtitle}</p>
          <p className="hm-marriage-package">
            2 PDF · {c.pages} · Bahasa Indonesia + Türkçe
          </p>
          <div className="hm-product-price">
            <ProductPrice
              product={productById("marriage-checklist-wni")!}
              locale={locale}
            />
          </div>
          {notify}
          <p className="hm-muted hm-marriage-access">{c.access}</p>
          <Link
            className="hm-text-link"
            href={`/${locale}/layanan/konsultasi#request-form`}
          >
            {c.help}
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </section>
      <section className="hm-marriage-section hm-marriage-receive">
        <div>
          <p className="hm-eyebrow">01 / ID + TR</p>
          <h2>{c.receive}</h2>
          <p>{c.receiveIntro}</p>
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
        <ul className="hm-tools-list">
          {c.tools.map((tool) => (
            <li key={tool}>
              <span aria-hidden="true">✓</span>
              {tool}
            </li>
          ))}
        </ul>
      </section>
      <section className="hm-marriage-section hm-marriage-bilingual">
        <div>
          <FlagPair />
          <h2>{c.bilingual}</h2>
          <p>{c.bilingualText}</p>
        </div>
        <BrandMotif variant="marriage" />
      </section>
      <section className="hm-marriage-section">
        <p className="hm-eyebrow">02 / 16</p>
        <h2>{c.inside}</h2>
        <p>{c.insideIntro}</p>
        <div className="hm-module-grid">
          {c.groups.map((group, i) => {
            const start = sectionNumber + 1;
            sectionNumber += group.items.length;
            return (
              <details
                key={group.title}
                className="hm-content-module"
                open={i === 0}
              >
                <summary>
                  <span className="hm-module-number">0{i + 1}</span>
                  <span>
                    {group.title}
                    <small>
                      {String(start).padStart(2, "0")}—
                      {String(sectionNumber).padStart(2, "0")}
                    </small>
                  </span>
                  <span className="hm-module-toggle" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{group.text}</p>
                <ol start={start}>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </details>
            );
          })}
        </div>
      </section>
      <section className="hm-marriage-section">
        <p className="hm-eyebrow">03 / PREVIEW</p>
        <h2>{c.preview}</h2>
        <p className="hm-preview-note">{c.previewNote}</p>
        <div className="hm-preview-grid">
          {c.previewLabels.map((label, i) => (
            <figure key={label}>
              <div
                className={`hm-preview-sheet hm-preview-sheet-${i}`}
                aria-hidden="true"
              >
                <span className="hm-preview-brand">HALO MERHABA</span>
                {i === 0 ? (
                  <>
                    <BrandMotif variant="marriage" />
                    <FlagPair />
                  </>
                ) : (
                  <div className="hm-preview-lines">
                    {[0, 1, 2, 3, 4].map((row) => (
                      <div key={row}>
                        <i />
                        <b />
                        <b />
                      </div>
                    ))}
                  </div>
                )}
                <span className="hm-preview-folio">0{i + 1} / ID + TR</span>
              </div>
              <figcaption>{label}</figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="hm-marriage-section hm-marriage-audience">
        <div>
          <p className="hm-eyebrow">04 / INDONESIA ↔ TÜRKİYE</p>
          <h2>{c.audience}</h2>
        </div>
        <ul>
          {c.audienceItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="hm-marriage-section hm-marriage-boundary">
        <h2>{c.boundary}</h2>
        <p>{c.boundaryText}</p>
      </section>
      <section className="hm-marriage-section hm-marriage-trust">
        <h2>{c.trust}</h2>
        <ul>
          {c.trustItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="hm-marriage-final">
        <span className="hm-coming">
          <i />
          {c.status}
        </span>
        <h2>{c.notify}</h2>
        <div className="hm-product-price">
          <ProductPrice
            product={productById("marriage-checklist-wni")!}
            locale={locale}
          />
        </div>
        {notify}
        <p>{c.access}</p>
        <Link
          className="hm-text-link"
          href={`/${locale}/layanan/konsultasi#request-form`}
        >
          {c.help}
        </Link>
      </section>
    </article>
  );
}

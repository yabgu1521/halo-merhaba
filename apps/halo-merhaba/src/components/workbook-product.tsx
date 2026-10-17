import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { workbookCopy } from "@/content/workbook-product";
import { productById } from "@/content/catalog";
import { ProductPrice } from "./digital-catalog";
import { BrandMotif } from "./brand-motif";
import { CountryFlag, FlagPair } from "./country-art";
import { Icon } from "./icons";

export function WorkbookProduct({ locale }: { locale: Locale }) {
  const c = workbookCopy[locale === "tr" ? "tr" : "id"];
  const product = productById("marriage-preparation-workbook")!;
  const notify = (
    <a className="hm-button" href="#request-form">
      {c.notify}
      <Icon name="arrow" size={16} />
    </a>
  );
  return (
    <article className="hm-marriage-product hm-workbook-product">
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
            href={`/${locale}/layanan/konsultasi#request-form`}
          >
            {c.help}
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </section>
      <section className="hm-marriage-section hm-workbook-comparison">
        <h2>{c.compareTitle}</h2>
        <div className="hm-workbook-comparison-grid">
          {c.compareHeaders.map((title, i) => (
            <div key={title}>
              <span className="hm-eyebrow">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{c.compareTexts[i]}</p>
              {i === 0 && (
                <Link
                  className="hm-text-link"
                  href={`/${locale}/produk/marriage-checklist-wni`}
                >
                  {c.compareCta}
                  <Icon name="arrow" size={16} />
                </Link>
              )}
            </div>
          ))}
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
        <BrandMotif variant="marriage" />
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
      <section className="hm-marriage-section hm-workbook-previews">
        <h2>{c.previewTitle}</h2>
        <p>{c.previewNote}</p>
        <div className="hm-workbook-preview-grid">
          <figure>
            <figcaption>{c.previewLabels[0]}</figcaption>
            <table>
              <thead>
                <tr>
                  {c.tableHeaders.map((label) => (
                    <th scope="col" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.tableRows.map((label) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td>
                      <span aria-hidden="true" />
                    </td>
                    <td>
                      <span aria-hidden="true" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
          <figure>
            <figcaption>{c.previewLabels[1]}</figcaption>
            <div className="hm-decision-lines">
              {c.decisionLabels.map((label) => (
                <div key={label}>
                  <span>{label}</span>
                  <i aria-hidden="true" />
                </div>
              ))}
            </div>
          </figure>
        </div>
      </section>
      <section className="hm-marriage-section hm-workbook-autonomy">
        <h2>{c.autonomyTitle}</h2>
        <p>{c.autonomyText}</p>
        <ul>
          {c.autonomyItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
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

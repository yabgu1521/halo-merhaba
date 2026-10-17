"use client";
import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  products,
  productById,
  productCategories,
  productPriceText,
  productTone,
  productMotif,
  type Product,
} from "@/content/catalog";
import { marriageCopy } from "@/content/marriage-product";
import { siteCopy } from "@/content/site-copy";
import { BrandMotif } from "./brand-motif";
import { FlagPair } from "./country-art";
import { Icon } from "./icons";

const storeCopy = {
  id: {
    all: "Semua",
    marriage: "Pernikahan & Keluarga",
    documents: "Dokumen",
    language: "Bahasa Turki",
    life: "Kehidupan di Türkiye",
    guidance: "Persiapan & Konsultasi",
    featured: "Panduan digital pertama kami",
    view: "Lihat isi panduan",
    filters: "Kategori panduan",
    planned: "Harga peluncuran yang direncanakan",
  },
  tr: {
    all: "Tümü",
    marriage: "Evlilik & Aile",
    documents: "Belgeler",
    language: "Türkçe",
    life: "Türkiye’de Yaşam",
    guidance: "Hazırlık & Danışmanlık",
    featured: "İlk dijital rehberimiz",
    view: "Rehberin içeriğini incele",
    filters: "Rehber kategorileri",
    planned: "Planlanan çıkış fiyatı",
  },
};
export function ProductPrice({
  product,
  locale,
}: {
  product: Product;
  locale: Locale;
}) {
  const c = storeCopy[locale === "tr" ? "tr" : "id"];
  return locale === "tr" ? (
    <span>{productPriceText(product, locale)}</span>
  ) : (
    <>
      <strong>{productPriceText(product, locale)}</strong>
      <span>{c.planned}</span>
    </>
  );
}
export function DigitalCatalog({ locale }: { locale: Locale }) {
  const [category, setCategory] = useState("all");
  const c = storeCopy[locale === "tr" ? "tr" : "id"],
    b = marriageCopy[locale === "tr" ? "tr" : "id"],
    s = siteCopy[locale];
  const featured = productById("marriage-checklist-wni")!;
  const shown = products.filter(
    (p) => category === "all" || p.category === category,
  );
  return (
    <>
      <section
        className="hm-store-feature"
        aria-labelledby="featured-guide-title"
      >
        <div className="hm-store-feature-art" aria-hidden="true">
          <span>HALO MERHABA</span>
          <BrandMotif variant="marriage" />
          <FlagPair />
          <small>PDF · ID + TR</small>
        </div>
        <div>
          <p className="hm-eyebrow">{c.featured}</p>
          <span className="hm-coming">
            <i />
            {s.productReadyLabel}
          </span>
          <h2 id="featured-guide-title">{featured.titles[locale]}</h2>
          <p>{featured.descriptions[locale]}</p>
          <p className="hm-feature-package">
            2 PDF · Bahasa Indonesia + Türkçe · {b.pages}
          </p>
          <div className="hm-product-price">
            <ProductPrice product={featured} locale={locale} />
          </div>
          <p className="hm-product-ready">{b.status}</p>
          <Link className="hm-button" href={`/${locale}/produk/${featured.id}`}>
            {c.view}
            <Icon name="arrow" size={17} />
          </Link>
        </div>
      </section>
      <div className="hm-store-filters" role="group" aria-label={c.filters}>
        {(["all", ...productCategories] as const).map((key) => (
          <button
            type="button"
            key={key}
            aria-pressed={category === key}
            onClick={() => setCategory(key)}
          >
            {c[key]}
          </button>
        ))}
      </div>
      <p className="hm-store-count" role="status" aria-live="polite">
        {shown.length} / {products.length}
      </p>
      <div className="hm-product-grid" id="digital-product-grid">
        {shown.map((p) => (
          <article
            className={`hm-product-card ${p.contentReady ? "hm-product-card-ready" : "hm-product-card-planned"}`}
            key={p.id}
            data-product-id={p.id}
          >
            <Link
              className={`hm-book-scene ${productTone(p.category)}`}
              href={`/${locale}/produk/${p.id}`}
              aria-label={p.titles[locale]}
            >
              <div className="hm-book">
                <span>
                  HALO MERHABA<span>INDONESIA ↔ TÜRKİYE</span>
                </span>
                <BrandMotif variant={productMotif(p.category)} />
                <small>
                  {p.contentReady ? s.productReadyLabel : s.preparing}
                </small>
              </div>
              <span className="hm-book-shadow" />
            </Link>
            <div className="hm-product-info">
              <p className="hm-eyebrow">{c[p.category as keyof typeof c]}</p>
              <span className="hm-coming">
                <i />
                {p.contentReady ? b.status : s.preparing}
              </span>
              <h3>
                <Link href={`/${locale}/produk/${p.id}`}>
                  {p.titles[locale]}
                </Link>
              </h3>
              <p>{p.descriptions[locale]}</p>
              <div className="hm-product-price">
                <ProductPrice product={p} locale={locale} />
              </div>
              <Link className="hm-text-link" href={`/${locale}/produk/${p.id}`}>
                {p.contentReady ? c.view : s.productDetail}
                <Icon name="arrow" size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { locales } from "./i18n";
import { business } from "./config";
import { siteCopy } from "@/content/site-copy";
import { serviceBySlug } from "@/content/services";
import { productTitles, productDescriptions } from "@/content/catalog";
import { guideById } from "@/content/guides";
import { routePath, type PublicKind } from "./routes";
export function pageInfo(locale: Locale, kind: PublicKind, slug?: string) {
  const c = siteCopy[locale],
    service = slug ? serviceBySlug(slug) : undefined,
    article = slug ? guideById(slug) : undefined;
  const titles: Record<string, string> = {
    home: c.seoHomeTitle,
    services: c.seoServicesTitle,
    course: serviceBySlug("kursus-bahasa-turki")!.seoTitle[locale],
    store: c.store,
    guides: c.guides,
    about: c.seoAboutTitle,
    faq: c.faq,
    contact: c.seoContactTitle,
    privacy: c.privacyTitle,
    terms: c.termsTitle,
  };
  return {
    title:
      service?.seoTitle[locale] ||
      article?.title[locale] ||
      (slug ? productTitles[slug]?.[locale] : undefined) ||
      titles[kind] ||
      business.name,
    description:
      service?.short[locale] ||
      article?.description[locale] ||
      (slug ? productDescriptions[slug]?.[locale] : undefined) ||
      (kind === "course"
        ? c.courseText
        : kind === "about"
          ? c.aboutText
          : kind === "contact"
            ? c.contactText
            : kind === "services"
              ? c.servicesText
              : c.heroText),
  };
}
export function metadata(
  locale: Locale,
  kind: PublicKind,
  slug?: string,
): Metadata {
  const info = pageInfo(locale, kind, slug),
    path = routePath(kind, slug),
    url = new URL(`/${locale}${path}`, business.siteUrl).toString();
  const allow = process.env.HALO_ALLOW_INDEXING === "true";
  return {
    title: kind === "home" ? info.title : `${info.title} | Halo Merhaba`,
    description: info.description,
    metadataBase: new URL(business.siteUrl),
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [
          l,
          new URL(`/${l}${path}`, business.siteUrl).toString(),
        ]),
      ),
    },
    robots: { index: allow, follow: true },
    openGraph: {
      type: kind === "article" ? "article" : "website",
      title: info.title,
      description: info.description,
      url,
      siteName: business.name,
      locale: locale === "tr" ? "tr_TR" : "id_ID",
      images: [
        {
          url: "/halo-og.png",
          width: 1200,
          height: 630,
          alt: "Halo Merhaba · Indonesia ↔ Türkiye",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: info.title,
      description: info.description,
      images: ["/halo-og.png"],
    },
  };
}
export function structuredData(
  locale: Locale,
  kind: PublicKind,
  slug?: string,
) {
  const c = siteCopy[locale],
    info = pageInfo(locale, kind, slug),
    url = new URL(
      `/${locale}${routePath(kind, slug)}`,
      business.siteUrl,
    ).toString(),
    org = {
      "@type": "Organization",
      "@id": `${business.siteUrl}/#organization`,
      name: business.name,
      url: new URL(`/${locale}`, business.siteUrl).toString(),
      sameAs: [business.instagramUrl],
      ...(business.email ? { email: business.email } : {}),
    };
  const main =
    kind === "service"
      ? {
          "@type": "Service",
          name: info.title,
          description: info.description,
          provider: { "@id": `${business.siteUrl}/#organization` },
          url,
        }
      : kind === "article"
        ? {
            "@type": "Article",
            headline: info.title,
            description: info.description,
            inLanguage: locale,
            author: { "@id": `${business.siteUrl}/#organization` },
            mainEntityOfPage: url,
          }
        : kind === "product"
          ? {
              "@type": "Product",
              name: info.title,
              description: info.description,
              brand: { "@type": "Brand", name: business.name },
              url,
            }
          : { "@type": "WebPage", name: info.title, url, inLanguage: locale };
  return {
    "@context": "https://schema.org",
    "@graph": [
      org,
      main,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: c.home,
            item: new URL(`/${locale}`, business.siteUrl).toString(),
          },
          ...(kind === "home"
            ? []
            : [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: info.title,
                  item: url,
                },
              ]),
        ],
      },
    ],
  };
}

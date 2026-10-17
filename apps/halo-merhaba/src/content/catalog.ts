import source from "./launch-catalog.json";
import type { Locale } from "@/lib/i18n";
export type LocalText = Record<Locale, string>;
export const productCategories = [
  "marriage",
  "documents",
  "language",
  "life",
  "guidance",
] as const;
export type ProductCategory = (typeof productCategories)[number];
export const catalog = source;
export const products = source.products.map((p) => ({
  ...p,
  // Readiness is not an entitlement. Sales and delivery remain disabled.
  available: p.deliverable_available === true,
  contentReady: p.content_ready === true,
  editions: "editions" in p ? p.editions || [] : [],
  saleEnabled: false,
  downloadEnabled: false,
}));
export type Product = (typeof products)[number];
export const productById = (id: string) => products.find((p) => p.id === id);
export const productTitles: Record<string, LocalText> = Object.fromEntries(
  products.map((p) => [p.id, p.titles]),
);
export const productDescriptions: Record<string, LocalText> =
  Object.fromEntries(products.map((p) => [p.id, p.descriptions]));
export function productPriceText(product: Product, locale: Locale) {
  return locale === "tr"
    ? "Fiyat yakında açıklanacak"
    : `Rp${new Intl.NumberFormat("id-ID").format(product.proposed_test_price.amount)}`;
}
export function productMotif(category: string) {
  return category === "marriage"
    ? "marriage"
    : category === "documents"
      ? "documents"
      : category === "language"
        ? "language"
        : "guidance";
}
export function productTone(category: string) {
  return category === "marriage"
    ? "tone-0"
    : category === "documents"
      ? "tone-1"
      : category === "language"
        ? "tone-2"
        : "tone-guidance";
}

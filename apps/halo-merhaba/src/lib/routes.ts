import { services } from "@/content/services";
import { products } from "@/content/catalog";
import { guides } from "@/content/guides";
export type PublicKind =
  | "home"
  | "services"
  | "service"
  | "course"
  | "store"
  | "product"
  | "guides"
  | "article"
  | "about"
  | "faq"
  | "contact"
  | "privacy"
  | "terms";
export const simplePaths: Record<string, PublicKind> = {
  layanan: "services",
  kursus: "course",
  "digital-guides": "store",
  panduan: "guides",
  tentang: "about",
  faq: "faq",
  kontak: "contact",
  privasi: "privacy",
  ketentuan: "terms",
};
export function routePath(kind: PublicKind, slug?: string) {
  if (kind === "home") return "";
  if (kind === "service") return `/layanan/${slug}`;
  if (kind === "product") return `/produk/${slug}`;
  if (kind === "article") return `/panduan/${slug}`;
  return `/${Object.keys(simplePaths).find((key) => simplePaths[key] === kind) || ""}`;
}
export const publicRoutePaths = [
  ...Object.keys(simplePaths),
  ...services.map((s) => `layanan/${s.slug}`),
  ...products.map((p) => `produk/${p.id}`),
  ...guides.map((g) => `panduan/${g.id}`),
];
export function resolvePath(
  path: string[],
): { kind: PublicKind; slug?: string } | null {
  const key = path.join("/");
  if (simplePaths[key]) return { kind: simplePaths[key] };
  if (path.length === 2) {
    if (path[0] === "layanan" && services.some((s) => s.slug === path[1]))
      return { kind: "service", slug: path[1] };
    if (path[0] === "produk" && products.some((p) => p.id === path[1]))
      return { kind: "product", slug: path[1] };
    if (path[0] === "panduan" && guides.some((g) => g.id === path[1]))
      return { kind: "article", slug: path[1] };
  }
  return null;
}

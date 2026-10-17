import source from "./launch-catalog.json";
import type { Locale } from "@/lib/i18n";
export type LocalText = Record<Locale, string>;
export const catalog = source;
export const products = source.products.map((p, index) => ({
  ...p,
  index,
  // File existence/content readiness never grants sale or download access.
  available: p.deliverable_available === true,
  contentReady: p.content_ready === true,
  editions: "editions" in p ? p.editions || [] : [],
  saleEnabled: false,
  downloadEnabled: false,
  category: (["marriage", "documents", "language"] as const)[index],
}));
export type Product = (typeof products)[number];
export const productById = (id: string) => products.find((p) => p.id === id);
export const productTitles: Record<string, LocalText> = {
  "marriage-checklist-wni": {
    id: "Menikah di Türkiye – Complete Checklist",
    tr: "Türkiye’de Evlilik – WNI Hazırlık Kontrol Listesi",
    en: "Getting Married in Türkiye – Checklist",
  },
  "document-apostille-organizer": {
    id: "Dokumen & Apostille Organizer",
    tr: "Belge ve Apostil Düzenleyici",
    en: "Documents & Apostille Organizer",
  },
  "turkish-a1-survival": {
    id: "Türkçe A1 – Survival Pack untuk Orang Indonesia",
    tr: "Türkçe A1 – Endonezyalılar için Günlük Yaşam Paketi",
    en: "Turkish A1 – Survival Pack",
  },
};
export const productDescriptions: Record<string, LocalText> = {
  "marriage-checklist-wni": {
    id: "Panduan persiapan pernikahan di Türkiye dalam edisi Bahasa Indonesia dan Türkçe, masing-masing berformat PDF. Bukan daftar persyaratan resmi.",
    tr: "Türkiye’de evlilik hazırlığı için Endonezce ve Türkçe PDF rehberleri. Resmi belge listesi değildir.",
    en: "Marriage preparation guides in Indonesian and Turkish PDF editions. Not an official requirements list.",
  },
  "document-apostille-organizer": {
    id: "Inventaris dokumen dan catatan terjemahan serta pengesahan untuk membantu persiapanmu lebih teratur.",
    tr: "Belge envanteri, tercüme ve tasdik notlarıyla hazırlığını düzenlemek için bir araç.",
    en: "A document inventory with translation and certification notes.",
  },
  "turkish-a1-survival": {
    id: "Ungkapan dan latihan singkat untuk perkenalan, keluarga, dan kehidupan sehari-hari. Bukan kursus A1 lengkap atau sertifikat.",
    tr: "Tanışma, aile ve günlük yaşam için kısa ifadeler ve alıştırmalar. Tam A1 kursu veya sertifika değildir.",
    en: "Everyday phrases and short exercises, not a complete A1 course or certification.",
  },
};

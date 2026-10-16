export type Locale = "id" | "tr" | "en";
export const locales = ["id", "tr"] as const;
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
export const languageNames = {
  id: "Bahasa Indonesia",
  tr: "Türkçe",
  en: "English",
};

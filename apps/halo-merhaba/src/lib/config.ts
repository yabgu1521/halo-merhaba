export const business = {
  name: "Halo Merhaba",
  connection: "Indonesia ↔ Türkiye",
  instagramHandle: "halo_merhaba2022",
  instagramUrl: "https://www.instagram.com/halo_merhaba2022/",
  whatsapp: process.env.NEXT_PUBLIC_HALO_WHATSAPP || "",
  email: process.env.NEXT_PUBLIC_HALO_EMAIL || "",
  siteUrl: process.env.HALO_SITE_URL || "http://localhost:3000",
  address: null,
  team: [] as { name: string; role: string; photo: string }[],
  testimonials: [] as { quote: string; name: string }[],
  checkoutEnabled: false,
  uploadsEnabled: false,
};
export function validWhatsapp(value: string) {
  return /^\+?[1-9]\d{7,14}$/.test(value);
}
export function whatsappLink(message: string) {
  return validWhatsapp(business.whatsapp)
    ? `https://wa.me/${business.whatsapp.replace("+", "")}?text=${encodeURIComponent(message)}`
    : null;
}
export const analytics = {
  measurementId: process.env.NEXT_PUBLIC_HALO_GA_ID || "",
  enabled: false,
};
export type EventName =
  | "service_view"
  | "consultation_click"
  | "whatsapp_click"
  | "translation_request"
  | "course_interest"
  | "product_interest"
  | "article_to_service_click";
export function track(name: EventName, detail: Record<string, string> = {}) {
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent("halo:event", { detail: { name, ...detail } }),
    );
}

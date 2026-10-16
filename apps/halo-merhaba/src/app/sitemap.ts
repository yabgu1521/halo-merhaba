import type { MetadataRoute } from "next";
import { business } from "@/lib/config";
import { locales } from "@/lib/i18n";
import { publicRoutePaths } from "@/lib/routes";
export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    [
      "",
      ...publicRoutePaths.filter((p) => !["privasi", "ketentuan"].includes(p)),
    ].map((path) => ({
      url: new URL(
        `/${locale}${path ? "/" + path : ""}`,
        business.siteUrl,
      ).toString(),
    })),
  );
}

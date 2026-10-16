import type { MetadataRoute } from "next";
import { business } from "@/lib/config";
export default function robots(): MetadataRoute.Robots {
  const rule =
    process.env.HALO_ALLOW_INDEXING === "true"
      ? { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }
      : { userAgent: "*", disallow: "/" };
  return {
    rules: [rule],
    sitemap: new URL("/sitemap.xml", business.siteUrl).toString(),
  };
}

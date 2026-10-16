import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { resolvePath, publicRoutePaths } from "@/lib/routes";
import { metadata, structuredData } from "@/lib/seo";
import { intakeConfigured } from "@/lib/server";
import { PublicPage } from "@/components/public-page";
export function generateStaticParams() {
  return publicRoutePaths.map((path) => ({ path: path.split("/") }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; path: string[] }>;
}) {
  const { locale, path } = await params,
    route = resolvePath(path);
  return isLocale(locale) && route
    ? metadata(locale, route.kind, route.slug)
    : {};
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; path: string[] }>;
}) {
  const { locale, path } = await params,
    route = resolvePath(path);
  if (!isLocale(locale) || !route) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData(locale, route.kind, route.slug),
          ).replace(/</g, "\\u003c"),
        }}
      />
      <PublicPage
        locale={locale}
        kind={route.kind}
        slug={route.slug}
        persistenceEnabled={intakeConfigured()}
      />
    </>
  );
}

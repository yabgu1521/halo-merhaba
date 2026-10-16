import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { metadata, structuredData } from "@/lib/seo";
import { intakeConfigured } from "@/lib/server";
import { PublicPage } from "@/components/public-page";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return isLocale(locale) ? metadata(locale, "home") : {};
}
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData(locale, "home")).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <PublicPage locale={locale} persistenceEnabled={intakeConfigured()} />
    </>
  );
}

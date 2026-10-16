import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { memberContext } from "@/lib/member/data";
import { ProductArea } from "@/components/product-area";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  await memberContext(locale, false);
  return <ProductArea locale={locale} kind="premium" />;
}

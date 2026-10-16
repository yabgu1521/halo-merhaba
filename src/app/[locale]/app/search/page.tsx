import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  redirect(`/${locale}/app/discover?view=search`);
}

import { notFound } from "next/navigation";
import { isLocale, copy } from "@/lib/i18n";
import { ownProfile } from "@/lib/member/own-profile";
import { ProfileForm } from "@/components/member/profile-form";
export default async function Onboarding({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { initial, photo, options, context, contextAvailable, preferences } =
    await ownProfile(locale);
  return (
    <ProfileForm
      locale={locale}
      initial={initial}
      initialPhoto={photo}
      initialContext={context}
      contextAvailable={contextAvailable}
      initialPreferences={preferences}
      catalog={options}
      onboarding
      safetyRules={copy[locale].safetyRules}
    />
  );
}

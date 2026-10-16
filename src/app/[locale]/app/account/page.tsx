import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { memberContext } from "@/lib/member/data";
import { memberCopy } from "@/lib/member/i18n";
import { Logout } from "@/components/member/controls";
export default async function Account({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  await memberContext(locale, false);
  const c = memberCopy[locale];
  return (
    <div className="onboarding">
      <h1>{c.account}</h1>
      <p>{c.accountHelp}</p>
      <div className="auth-links">
        <Link href={`/${locale}/app/profile`}>{c.editProfile}</Link>
        <Link href={`/${locale}/auth/forgot`}>{c.forgot}</Link>
        <Logout locale={locale} />
      </div>
    </div>
  );
}

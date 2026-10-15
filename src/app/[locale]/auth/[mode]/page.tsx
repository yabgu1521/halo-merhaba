import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { brand } from "@/lib/brand";
import { AuthForm, type AuthMode } from "@/components/member/auth-form";
import { configured } from "@/lib/supabase/server";
export const metadata = { robots: { index: false, follow: false } };
export default async function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; mode: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { locale, mode } = await params;
  if (
    !isLocale(locale) ||
    !["login", "signup", "forgot", "reset", "resend"].includes(mode)
  )
    notFound();
  const { notice } = await searchParams;
  return (
    <main className="auth-page">
      <Link className="brand" href={`/${locale}`}>
        {brand.name}
      </Link>
      <div className="locale-links">
        {(["en", "tr", "id"] as const).map((l) => (
          <Link
            key={l}
            lang={l}
            aria-current={locale === l ? "page" : undefined}
            href={`/${l}/auth/${mode}`}
          >
            {l.toUpperCase()}
          </Link>
        ))}
      </div>
      <AuthForm
        locale={locale}
        mode={mode as AuthMode}
        configured={
          configured() &&
          Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
          Boolean(process.env.NEXT_PUBLIC_SITE_URL)
        }
        notice={notice}
      />
    </main>
  );
}

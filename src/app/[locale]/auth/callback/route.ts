import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { isLocale } from "@/lib/i18n";
import { appOrigin } from "@/lib/member/http";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!process.env.NEXT_PUBLIC_SITE_URL)
    return new Response(null, { status: 503 });
  if (!isLocale(locale)) return new Response(null, { status: 404 });
  const url = new URL(request.url),
    code = url.searchParams.get("code");
  try {
    if (code) {
      const db = await supabase();
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(
          `${appOrigin()}/${locale}/${url.searchParams.get("flow") === "recovery" ? "auth/reset" : "app/onboarding"}`,
        );
    }
  } catch {}
  return NextResponse.redirect(
    `${appOrigin()}/${locale}/auth/login?notice=linkExpired`,
  );
}

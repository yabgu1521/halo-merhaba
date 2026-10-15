import { boundedBody } from "@/lib/member/body";
import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { z } from "zod";
import { supabase, storageAdmin, configured } from "@/lib/supabase/server";
import { failure, sameOrigin, appOrigin } from "@/lib/member/http";
import { email, password } from "@/lib/member/validation";
import { isLocale } from "@/lib/i18n";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("requestFailed", 403);
  if (!configured() || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return failure("backendUnavailable", 503);
  try {
    if (Number(request.headers.get("content-length") || 0) > 4096)
      return failure();
    const body = JSON.parse((await boundedBody(request, 4096)).toString());
    const locale = isLocale(body.locale) ? body.locale : "en";
    const action = z
      .enum(["signup", "login", "logout", "forgot", "reset", "resend"])
      .parse(body.action);
    const db = await supabase();
    if (action === "logout") {
      const { error } = await db.auth.signOut();
      if (error) return failure();
      return NextResponse.json({ redirect: `/${locale}` });
    }
    if (action === "reset") {
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) return failure("loginRequired", 401);
      const { error } = await db.auth.updateUser({
        password: password.parse(body.password),
      });
      if (error) return failure();
      await db.auth.signOut({ scope: "global" });
      return NextResponse.json({
        redirect: `/${locale}/auth/login?notice=passwordChanged`,
      });
    }
    const address = email.parse(body.email);
    const bucket = createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY!)
      .update(`${action}:${address}`)
      .digest("hex");
    const { data: allowed, error: limitError } = await storageAdmin().rpc(
      "consume_auth_attempt",
      { bucket, maximum: action === "login" ? 12 : 5 },
    );
    if (limitError) return failure("backendUnavailable", 503);
    if (!allowed) return failure("rateLimited", 429);
    const callback = `${appOrigin()}/${locale}/auth/callback`;
    if (action === "signup") {
      if (body.adult !== true) return failure("adultRequired");
      const { error } = await db.auth.signUp({
        email: address,
        password: password.parse(body.password),
        options: { data: { adult_confirmed: true }, emailRedirectTo: callback },
      });
      if (error) return failure("signupFailed");
      return NextResponse.json({ notice: "checkEmail" });
    }
    if (action === "login") {
      const { error } = await db.auth.signInWithPassword({
        email: address,
        password: z.string().min(1).max(128).parse(body.password),
      });
      if (error) return failure("loginFailed", 401);
      return NextResponse.json({ redirect: `/${locale}/app/discover` });
    }
    if (action === "resend")
      await db.auth.resend({
        type: "signup",
        email: address,
        options: { emailRedirectTo: callback },
      });
    else
      await db.auth.resetPasswordForEmail(address, {
        redirectTo: `${callback}?flow=recovery`,
      });
    // Enumeration-resistant response even for unknown addresses.
    return NextResponse.json({ notice: "checkEmail" });
  } catch {
    return failure();
  }
}

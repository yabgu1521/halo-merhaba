import "server-only";
import { NextResponse } from "next/server";
export function failure(code = "requestFailed", status = 400) {
  return NextResponse.json(
    { error: code },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
export function sameOrigin(request: Request) {
  const expected = process.env.NEXT_PUBLIC_SITE_URL;
  if (!expected) return false;
  try {
    return (
      new URL(request.headers.get("origin") || "").origin ===
      new URL(expected).origin
    );
  } catch {
    return false;
  }
}
export function appOrigin() {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin;
}

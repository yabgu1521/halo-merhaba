"use client";
import { useParams } from "next/navigation";
import { memberCopy } from "@/lib/member/i18n";
import { isLocale } from "@/lib/i18n";
export default function MemberError({ reset }: { reset: () => void }) {
  const params = useParams();
  const locale =
      typeof params.locale === "string" && isLocale(params.locale)
        ? params.locale
        : "en",
    c = memberCopy[locale];
  return (
    <div className="empty-state">
      <h1>{c.requestFailed}</h1>
      <button className="button" onClick={() => reset()}>
        {c.continue}
      </button>
    </div>
  );
}

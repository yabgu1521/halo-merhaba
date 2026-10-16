import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Member, Catalog } from "@/lib/member/data";
import { label } from "@/lib/member/data";
import { memberCopy } from "@/lib/member/i18n";
import { Interest, Favorite, OpenConversation } from "./controls";
import { Insights } from "./insights";
import type { SharedProfile } from "@/lib/member/insights";
export function MemberCard({
  member: m,
  catalog,
  locale,
  match = false,
  viewer,
}: {
  member: Member;
  catalog: Catalog;
  locale: Locale;
  match?: boolean;
  viewer?: SharedProfile;
}) {
  const c = memberCopy[locale];
  return (
    <article className="member-card">
      <Link
        className="member-photo"
        href={`/${locale}/app/members/${m.public_id}`}
        aria-label={`${c.viewProfile}: ${m.display_name}`}
      >
        {m.photo_id ? (
          <img
            src={`/api/photos/${m.photo_id}`}
            alt={`${c.photoAlt}: ${m.display_name}`}
            width={480}
            height={480}
            loading="lazy"
          />
        ) : (
          <span aria-hidden>{m.display_name.slice(0, 1)}</span>
        )}
        <span className="photo-country">
          {label(catalog.countries, m.country, locale)}
        </span>
      </Link>
      <div className="member-card-body">
        <Link href={`/${locale}/app/members/${m.public_id}`}>
          <h2>
            {m.display_name}
            <span>, {m.age}</span>
          </h2>
        </Link>
        <p className="location">
          {m.city} · {label(catalog.countries, m.country, locale)}
        </p>
        <div className="tags">
          {m.purposes.map((p) => (
            <span key={p}>{label(catalog.purposes, p, locale)}</span>
          ))}
        </div>
        <p className="member-bio">{m.biography}</p>
        <p className="member-languages">
          {m.speaks.map((l) => label(catalog.languages, l, locale)).join(" · ")}
        </p>
        {viewer && (
          <Insights
            me={viewer}
            member={m}
            catalog={catalog}
            locale={locale}
            compact
          />
        )}
        <div className="member-card-actions">
          <Favorite id={m.public_id} locale={locale} saved={m.favorited} />
          {match ? (
            <>
              <p className="form-notice">{c.matched}</p>
              <OpenConversation id={m.public_id} locale={locale} />
              <small>
                {c.matchDate}{" "}
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: "medium",
                  timeZone: "UTC",
                }).format(new Date(m.matched_at!))}
              </small>
            </>
          ) : (
            <Interest locale={locale} id={m.public_id} sent={m.interested} />
          )}
        </div>
      </div>
    </article>
  );
}

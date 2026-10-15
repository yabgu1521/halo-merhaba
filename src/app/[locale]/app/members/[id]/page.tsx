import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { memberCopy } from "@/lib/member/i18n";
import { memberContext, catalog, label, type Member } from "@/lib/member/data";
import { uuid } from "@/lib/member/validation";
import { Interest, BlockButton, Report } from "@/components/member/controls";
export default async function MemberProfile({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale) || !uuid.safeParse(id).success) notFound();
  const { db } = await memberContext(locale),
    options = await catalog(db),
    c = memberCopy[locale];
  const { data, error } = await db.rpc("member_profile", { profile_id: id });
  if (error) throw new Error("Profile unavailable");
  if (!data)
    return (
      <div className="empty-state">
        <h1>{c.memberUnavailable}</h1>
        <Link href={`/${locale}/app/discover`}>{c.discover}</Link>
      </div>
    );
  const m = data as Member;
  return (
    <>
      <Link className="text-link" href={`/${locale}/app/discover`}>
        ← {c.discover}
      </Link>
      <article className="profile-detail">
        <div>
          {m.photo_id && (
            <img
              className="detail-photo"
              src={`/api/photos/${m.photo_id}`}
              alt={`${c.photoAlt}: ${m.display_name}`}
              width={600}
              height={700}
            />
          )}
          <p className="verified">✓ {c.emailVerified}</p>
          <small>{c.verificationHelp}</small>
        </div>
        <div>
          <p className="eyebrow">
            {label(options.countries, m.country, locale)}
          </p>
          <h1>
            {m.display_name}, {m.age}
          </h1>
          <p>
            {m.city} · {label(options.countries, m.country, locale)}
          </p>
          <div className="tags">
            {m.purposes.map((p) => (
              <span key={p}>{label(options.purposes, p, locale)}</span>
            ))}
          </div>
          <h2>{c.about}</h2>
          <p className="biography">{m.biography}</p>
          <h2>{c.speaks}</h2>
          <p>
            {m.speaks
              .map((l) => label(options.languages, l, locale))
              .join(" · ")}
          </p>
          {m.learns.length > 0 && (
            <>
              <h2>{c.learns}</h2>
              <p>
                {m.learns
                  .map((l) => label(options.languages, l, locale))
                  .join(" · ")}
              </p>
            </>
          )}
          <h2>{c.interests}</h2>
          <div className="tags">
            {m.interests.map((i) => (
              <span key={i}>{label(options.interests, i, locale)}</span>
            ))}
          </div>
          <Interest id={id} locale={locale} sent={m.interested} />
          <div className="safety-actions">
            <BlockButton id={id} locale={locale} />
            <Report id={id} locale={locale} />
          </div>
        </div>
      </article>
    </>
  );
}

import { matchmakingCopy } from "@/lib/matchmaking-copy";
import { viewerSignals } from "@/lib/member/viewer";
import { Insights } from "@/components/member/insights";
import { productCopy } from "@/lib/product-copy";
import type { ProfileContext } from "@/components/member/context-form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { memberCopy } from "@/lib/member/i18n";
import { memberContext, catalog, label, type Member } from "@/lib/member/data";
import { uuid } from "@/lib/member/validation";
import {
  Interest,
  BlockButton,
  Report,
  Favorite,
  OpenConversation,
} from "@/components/member/controls";
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
  const { data, error } = await db.rpc("candidate_profile", { profile_id: id });
  if (error) throw new Error("Profile unavailable");
  if (!data)
    return (
      <div className="empty-state">
        <h1>{c.memberUnavailable}</h1>
        <Link href={`/${locale}/app/discover`}>{c.discover}</Link>
      </div>
    );
  const m = data as Member,
    viewer = await viewerSignals(db),
    p = productCopy[locale];
  const context = m.context as ProfileContext | null,
    k = matchmakingCopy[locale];
  const country = (v: string) => label(options.countries, v, locale);
  return (
    <>
      <Link className="text-link" href={`/${locale}/app/discover`}>
        ← {c.discover}
      </Link>
      <article className="profile-detail product-profile">
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
          <h2>{p.story}</h2>
          <p className="biography">{m.biography}</p>
          <section className="looking-story">
            <h2>{k.aboutLooking}</h2>
            {m.looking_for ? (
              <>
                <p className="biography">
                  {m.looking_for.looking_for || k.any}
                </p>
                <p>
                  {c.minAge}: {m.looking_for.min_age}–{m.looking_for.max_age}
                </p>
                <div className="tags">
                  {m.looking_for.genders.map((g) => (
                    <span key={g}>{c[g as "woman"]}</span>
                  ))}
                  {m.looking_for.countries.map((code) => (
                    <span key={code}>
                      {label(options.countries, code, locale)}
                    </span>
                  ))}
                  {m.looking_for.purpose && (
                    <span>
                      {label(options.purposes, m.looking_for.purpose, locale)}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p>{k.notShared}</p>
            )}
          </section>
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
          {context && (
            <section className="international-story">
              <p className="eyebrow">{p.sharedWith}</p>
              <h2>{p.international}</h2>
              <dl>
                {context.nationality && (
                  <>
                    <dt>{p.nationality}</dt>
                    <dd>{country(context.nationality)}</dd>
                  </>
                )}
                {context.relocation && (
                  <>
                    <dt>{p.relocate}</dt>
                    <dd>
                      {
                        (
                          { yes: p.yes, maybe: p.maybe, no: p.no } as Record<
                            string,
                            string
                          >
                        )[context.relocation]
                      }
                    </dd>
                  </>
                )}
                {context.future_country && (
                  <>
                    <dt>{p.future}</dt>
                    <dd>{country(context.future_country)}</dd>
                  </>
                )}
                {!!context.destinations.length && (
                  <>
                    <dt>{p.destinations}</dt>
                    <dd>{context.destinations.map(country).join(" · ")}</dd>
                  </>
                )}
                {context.education && (
                  <>
                    <dt>{p.education}</dt>
                    <dd>{context.education}</dd>
                  </>
                )}
                {context.profession && (
                  <>
                    <dt>{p.profession}</dt>
                    <dd>{context.profession}</dd>
                  </>
                )}
                {context.children && (
                  <>
                    <dt>{p.children}</dt>
                    <dd>
                      {
                        (
                          {
                            yes: p.childrenYes,
                            no: p.childrenNo,
                            discuss: p.childrenDiscuss,
                          } as Record<string, string>
                        )[context.children]
                      }
                    </dd>
                  </>
                )}
              </dl>
            </section>
          )}
          <Insights me={viewer} member={m} catalog={options} locale={locale} />
          <div className="profile-connect">
            <Favorite id={id} locale={locale} saved={m.favorited} />
            {m.has_match ? (
              <OpenConversation id={id} locale={locale} />
            ) : (
              <Interest id={id} locale={locale} sent={m.interested} />
            )}
          </div>
          <div className="safety-actions">
            <BlockButton id={id} locale={locale} />
            <Report id={id} locale={locale} />
          </div>
        </div>
      </article>
    </>
  );
}

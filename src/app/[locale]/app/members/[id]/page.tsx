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
  const { data, error } = await db.rpc("member_profile", { profile_id: id });
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
  const contextResult = await db.rpc("member_context", { profile_id: id });
  if (contextResult.error && contextResult.error.code !== "PGRST202")
    throw new Error("Optional profile unavailable");
  const context = contextResult.data as ProfileContext | null;
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
          <Insights me={viewer} member={m} catalog={options} locale={locale} />
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
          <div className="profile-connect">
            <Favorite id={id} locale={locale} saved={m.favorited} />
            <Interest id={id} locale={locale} sent={m.interested} />
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

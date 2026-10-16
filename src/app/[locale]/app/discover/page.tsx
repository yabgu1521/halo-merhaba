import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { memberContext, catalog, type Member } from "@/lib/member/data";
import { viewerSignals } from "@/lib/member/viewer";
import { candidateFiltersSchema } from "@/lib/member/matchmaking";
import { matchmakingCopy } from "@/lib/matchmaking-copy";
import { productCopy } from "@/lib/product-copy";
import { memberCopy } from "@/lib/member/i18n";
import { MemberCard } from "@/components/member/member-card";
import { DiscoveryFilters } from "@/components/member/discovery-filters";
import { CandidateSearch } from "@/components/member/candidate-search";
import { uuid } from "@/lib/member/validation";
export default async function Discover({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { db } = await memberContext(locale),
    viewer = await viewerSignals(db),
    options = await catalog(db),
    q = await searchParams,
    c = matchmakingCopy[locale],
    p = productCopy[locale],
    m = memberCopy[locale];
  const mode =
    typeof q.view === "string" &&
    ["for-you", "new", "discover", "search"].includes(q.view)
      ? q.view
      : "for-you";
  const saved = await db
    .from("member_preferences")
    .select("country,min_age,max_age,purpose,language,interest,advanced")
    .maybeSingle();
  if (saved.error) throw new Error("Search unavailable");
  const defaults =
    q.reset === "1"
      ? {}
      : saved.data?.advanced && Object.keys(saved.data.advanced).length
        ? saved.data.advanced
        : saved.data
          ? {
              country: saved.data.country || "",
              min_age: saved.data.min_age,
              max_age: saved.data.max_age,
              purpose: saved.data.purpose || "",
              language: saved.data.language || "",
              interest: saved.data.interest || "",
            }
          : {};
  const input: Record<string, unknown> = { ...defaults };
  for (const [key, value] of Object.entries(q))
    if (typeof value === "string") input[key] = value;
  // Search submit checkboxes must clear a saved true value when omitted.
  if (q.view && "min_age" in q) input.with_photo = q.with_photo === "1";
  for (const key of ["min_age", "max_age"])
    if (key in input) {
      const n = Number(input[key]);
      input[key] = Number.isInteger(n) ? n : undefined;
    }
  if (typeof input.with_photo === "string")
    input.with_photo = input.with_photo === "1";
  const parsed = candidateFiltersSchema.safeParse(input);
  if (!parsed.success)
    return (
      <section className="empty-state">
        <h1>{m.invalidInput}</h1>
        <Link
          className="button"
          href={`/${locale}/app/discover?view=search&reset=1`}
        >
          {c.clearSearch}
        </Link>
      </section>
    );
  const filters = parsed.data,
    after = uuid.safeParse(q.after);
  const result = await db.rpc("find_candidates", {
    filters,
    view_mode: mode,
    after_id: after.success ? after.data : null,
  });
  if (result.error) throw new Error("Candidate search unavailable");
  const rows = (result.data || []) as Member[],
    members = rows.slice(0, 12);
  const query = new URLSearchParams({ view: mode });
  for (const [k, v] of Object.entries(filters))
    if (v !== "" && v !== false) query.set(k, v === true ? "1" : String(v));
  const link = (view: string) => {
    const x = new URLSearchParams(query);
    x.set("view", view);
    return `/${locale}/app/discover?${x}`;
  };
  if (members.length) query.set("after", members.at(-1)!.public_id);
  return (
    <>
      <div className="member-title candidate-title">
        <p className="eyebrow">Türkiye ↔ Indonesia</p>
        <h1>{c.title}</h1>
        <p>{c.intro}</p>
      </div>
      <div className="candidate-shortcuts">
        <Link
          className="button"
          href={`/${locale}/app/discover?view=search#candidate-filters`}
        >
          {c.search} ↗
        </Link>
        <Link className="text-link" href={`/${locale}/app/preferences`}>
          {c.preferences}
        </Link>
        <Link className="text-link" href={`/${locale}/app/favorites`}>
          {m.favorites}
        </Link>
        <Link className="text-link" href={`/${locale}/app/likes`}>
          {c.interests}
        </Link>
      </div>
      <nav className="discovery-tabs" aria-label={m.discover}>
        {[
          ["for-you", p.forYou],
          ["new", p.newMembers],
          ["discover", c.discover],
          ["search", c.search],
        ].map(([key, title]) => (
          <Link
            key={key}
            href={link(key)}
            aria-current={mode === key ? "page" : undefined}
          >
            {title}
          </Link>
        ))}
      </nav>
      <p className="ordering-note">
        {mode === "for-you"
          ? c.forYou
          : mode === "new"
            ? p.newHelp
            : c.activePreferences}
      </p>
      <div className="preference-strip">
        <p>{viewer.preferences ? c.activePreferences : c.noPreferences}</p>
        <Link href={`/${locale}/app/preferences`}>{c.editPreferences} ↗</Link>
      </div>
      <div className="discovery-workspace">
        <div id="candidate-filters">
          <DiscoveryFilters title={c.search}>
            <CandidateSearch
              key={JSON.stringify(filters)}
              locale={locale}
              catalog={options}
              filters={filters}
              mode={mode}
            />
          </DiscoveryFilters>
        </div>
        <section className="discovery-results" aria-label={p.results}>
          {members.length ? (
            <>
              <p className="eyebrow">{p.results}</p>
              <div className="members-grid">
                {members.map((person) => (
                  <MemberCard
                    key={person.public_id}
                    member={person}
                    catalog={options}
                    locale={locale}
                    viewer={viewer}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state smart-empty">
              <h2>{c.emptyTitle}</h2>
              <p>{c.emptyText}</p>
              <div className="actions">
                <Link
                  className="button"
                  href={`/${locale}/app/discover?view=${mode}&reset=1`}
                >
                  {c.clearSearch}
                </Link>
                <Link href={`/${locale}/app/preferences`}>
                  {c.editPreferences}
                </Link>
              </div>
              <p>{c.completeHelp}</p>
              <Link href={`/${locale}/app/profile`}>{m.editProfile} ↗</Link>
              <details>
                <summary>{c.invite}</summary>
                <p>{c.inviteText}</p>
                <Link href={`/${locale}`}>TurkIndo Connect ↗</Link>
              </details>
            </div>
          )}
          {rows.length > 12 && (
            <Link
              className="button pagination"
              href={`/${locale}/app/discover?${query}`}
            >
              {m.nextPage} →
            </Link>
          )}
        </section>
      </div>
      <p className="interaction-guide">{c.actionGuide}</p>
    </>
  );
}

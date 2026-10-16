import { DiscoveryFilters } from "@/components/member/discovery-filters";
import { productCopy } from "@/lib/product-copy";
import { viewerSignals } from "@/lib/member/viewer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { memberCopy } from "@/lib/member/i18n";
import { memberContext, catalog, type Member } from "@/lib/member/data";
import { MemberCard } from "@/components/member/member-card";
import { SavePreferences } from "@/components/member/controls";
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
    c = memberCopy[locale],
    q = await searchParams;
  const p = productCopy[locale],
    mode = q.view === "new" ? "new" : "for-you";
  const { data: preferences, error: preferenceError } = await db
    .from("member_preferences")
    .select("country,min_age,max_age,purpose,language,interest")
    .maybeSingle();
  if (preferenceError) throw new Error("Preferences unavailable");
  const defaults: Record<string, string> =
    q.reset === "1"
      ? {}
      : {
          country: preferences?.country || "",
          purpose: preferences?.purpose || "",
          language: preferences?.language || "",
          interest: preferences?.interest || "",
          min: String(preferences?.min_age || 18),
          max: String(preferences?.max_age || 100),
        };
  const value = (k: string) =>
    typeof q[k] === "string" ? (q[k] as string) : defaults[k] || "";
  const validCode = (k: string, rows: { code: string }[]) =>
    rows.some((r) => r.code === value(k)) ? value(k) : null;
  const num = (k: string, fallback: number) =>
    /^\d{1,3}$/.test(value(k))
      ? Math.max(18, Math.min(125, Number(value(k))))
      : fallback;
  const min = num("min", 18),
    max = Math.max(min, num("max", 100));
  const filters = {
    name_filter: value("name").trim().slice(0, 60) || null,
    country_filter: validCode("country", options.countries),
    purpose_filter: validCode("purpose", options.purposes),
    language_filter: validCode("language", options.languages),
    interest_filter: validCode("interest", options.interests),
    min_age: min,
    max_age: max,
    after_id: uuid.safeParse(value("after")).success ? value("after") : null,
  };
  let { data, error } = await db.rpc("search_product_members", {
    ...filters,
    view_mode: mode,
  });
  const pendingMigration = error?.code === "PGRST202";
  if (pendingMigration) {
    const legacy = await db.rpc("search_members", filters);
    data = legacy.data;
    error = legacy.error;
  }
  if (error) throw new Error("Discovery unavailable");
  const rows = (data || []) as Member[],
    members = rows.slice(0, 12);
  const next = new URLSearchParams({ view: mode });
  for (const k of [
    "country",
    "purpose",
    "language",
    "interest",
    "min",
    "max",
    "name",
    "reset",
  ])
    if (value(k)) next.set(k, value(k));
  if (members.length) next.set("after", members.at(-1)!.public_id);
  return (
    <>
      <div className="member-title">
        <p className="eyebrow">Türkiye × Indonesia</p>
        <h1>{p.discoverTitle}</h1>
        <p>{p.discoverText}</p>
      </div>
      {pendingMigration ? (
        <p className="availability-note">{p.setupRequired}</p>
      ) : (
        <>
          <nav className="discovery-tabs" aria-label={c.discover}>
            {[
              ["for-you", p.forYou],
              ["new", p.newMembers],
            ].map(([key, title]) => {
              const tab = new URLSearchParams(next);
              tab.delete("after");
              tab.set("view", key);
              return (
                <Link
                  key={key}
                  href={`/${locale}/app/discover?${tab}`}
                  aria-current={mode === key ? "page" : undefined}
                >
                  {title}
                </Link>
              );
            })}
          </nav>
          <p className="ordering-note">
            {mode === "new" ? p.newHelp : p.forYouHelp}
          </p>
        </>
      )}
      <div className="discovery-workspace">
        <DiscoveryFilters title={p.filters}>
          <form className="filter-form" action={`/${locale}/app/discover`}>
            <input type="hidden" name="view" value={mode} />
            <p className="filter-group-label">{p.connection}</p>
            {(
              [
                ["country", c.country, options.countries],
                ["purpose", c.purpose, options.purposes],
                ["language", c.languages, options.languages],
                ["interest", c.interests, options.interests],
              ] as const
            ).map(([name, title, items]) => (
              <label key={name}>
                {title}
                <select name={name} defaultValue={value(name)}>
                  <option value="">{c.all}</option>
                  {items.map((i) => (
                    <option key={i.code} value={i.code}>
                      {i.labels[locale] || i.labels.en}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <p className="filter-group-label">{p.basics}</p>
            <label>
              {c.minAge}
              <input
                type="number"
                min={18}
                max={125}
                name="min"
                defaultValue={min}
              />
            </label>
            <label>
              {c.maxAge}
              <input
                type="number"
                min={18}
                max={125}
                name="max"
                defaultValue={max}
              />
            </label>
            <label>
              {c.searchName}
              <input name="name" maxLength={60} defaultValue={value("name")} />
            </label>
            <button className="button">{c.apply}</button>
            <SavePreferences locale={locale} />
            <Link
              className="text-link"
              href={`/${locale}/app/discover?reset=1`}
            >
              {c.clear}
            </Link>
          </form>
        </DiscoveryFilters>
        <section className="discovery-results" aria-label={p.results}>
          <p className="eyebrow">{p.results}</p>
          {members.length ? (
            <div className="members-grid">
              {members.map((m) => (
                <MemberCard
                  key={m.public_id}
                  viewer={viewer}
                  member={m}
                  catalog={options}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden>✦</span>
              <p>{c.noMembers}</p>
            </div>
          )}
          {rows.length > 12 && (
            <Link
              className="button pagination"
              href={`/${locale}/app/discover?${next}`}
            >
              {c.nextPage} →
            </Link>
          )}
        </section>
      </div>
    </>
  );
}

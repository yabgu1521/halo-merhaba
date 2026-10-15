import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { memberCopy } from "@/lib/member/i18n";
import { memberContext, catalog, type Member } from "@/lib/member/data";
import { MemberCard } from "@/components/member/member-card";
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
    options = await catalog(db),
    c = memberCopy[locale],
    q = await searchParams;
  const value = (k: string) =>
    typeof q[k] === "string" ? (q[k] as string) : "";
  const validCode = (k: string, rows: { code: string }[]) =>
    rows.some((r) => r.code === value(k)) ? value(k) : null;
  const num = (k: string, fallback: number) =>
    /^\d{1,3}$/.test(value(k))
      ? Math.max(18, Math.min(125, Number(value(k))))
      : fallback;
  const min = num("min", 18),
    max = Math.max(min, num("max", 100));
  const filters = {
    country_filter: validCode("country", options.countries),
    purpose_filter: validCode("purpose", options.purposes),
    language_filter: validCode("language", options.languages),
    interest_filter: validCode("interest", options.interests),
    min_age: min,
    max_age: max,
    after_id: uuid.safeParse(value("after")).success ? value("after") : null,
  };
  const { data, error } = await db.rpc("discover_members", filters);
  if (error) throw new Error("Discovery unavailable");
  const rows = (data || []) as Member[],
    members = rows.slice(0, 12);
  const next = new URLSearchParams();
  for (const k of ["country", "purpose", "language", "interest", "min", "max"])
    if (value(k)) next.set(k, value(k));
  if (members.length) next.set("after", members.at(-1)!.public_id);
  return (
    <>
      <div className="member-title">
        <p className="eyebrow">Türkiye × Indonesia</p>
        <h1>{c.discoverTitle}</h1>
        <p>{c.discoverText}</p>
      </div>
      <details className="filters" open>
        <summary>{c.filters}</summary>
        <form className="filter-form" action={`/${locale}/app/discover`}>
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
          <button className="button">{c.apply}</button>
          <Link className="text-link" href={`/${locale}/app/discover`}>
            {c.clear}
          </Link>
        </form>
      </details>
      {members.length ? (
        <div className="members-grid">
          {members.map((m) => (
            <MemberCard
              key={m.public_id}
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
    </>
  );
}

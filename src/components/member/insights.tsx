import type { Locale } from "@/lib/i18n";
import type { Catalog, Member } from "@/lib/member/data";
import {
  compatibility,
  insightText,
  type SharedProfile,
} from "@/lib/member/insights";
import {
  preferenceFit,
  sharedLife,
  type PreferenceFit,
} from "@/lib/member/matchmaking";
import { productCopy } from "@/lib/product-copy";
import { matchmakingCopy } from "@/lib/matchmaking-copy";
export function Insights({
  me,
  member,
  catalog,
  locale,
  compact = false,
}: {
  me: SharedProfile;
  member: Member;
  catalog: Catalog;
  locale: Locale;
  compact?: boolean;
}) {
  const rows = compatibility(me, member).map((x) =>
      insightText(x, catalog, locale),
    ),
    c = matchmakingCopy[locale],
    p = productCopy[locale],
    fit = preferenceFit(me.preferences, member),
    life = sharedLife(me.context, member.context);
  if (life.relocation) rows.push({ heading: c.bothRelocate, detail: "" });
  if (life.countries.length)
    rows.push({
      heading: c.futureTogether,
      detail: life.countries
        .map(
          (code) =>
            catalog.countries.find((x) => x.code === code)?.labels[locale] ||
            code,
        )
        .join(" · "),
    });
  const fitLabels: Record<PreferenceFit, string> = {
    age: c.fitAge,
    country: c.fitCountry,
    gender: c.fitGender,
    purpose: c.fitPurpose,
    language: c.fitLanguage,
    relocation: c.fitRelocation,
  };
  const fitRow = fit.includes("purpose")
    ? "purpose"
    : fit.includes("country")
      ? "country"
      : fit[0];
  const sharedList = (
    <ul>
      {rows.map((r, i) => (
        <li key={i}>
          <span className="insight-mark" aria-hidden>
            ↔
          </span>
          <div>
            <strong>{r.heading}</strong>
            {r.detail && <span>{r.detail}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
  if (compact)
    return (
      <section className="candidate-reasons" aria-label={c.why}>
        {fitRow && <p className="fit-line">✓ {fitLabels[fitRow]}</p>}
        {rows[0] && (
          <p className="shared-line">
            ↔ {rows[0].heading}: {rows[0].detail}
          </p>
        )}
        <details>
          <summary>{c.why}</summary>
          {fit.length > 0 && (
            <>
              <h3>{c.fit}</h3>
              <ul>
                {fit.map((key) => (
                  <li key={key}>{fitLabels[key]}</li>
                ))}
              </ul>
            </>
          )}
          <h3>{c.shared}</h3>
          {rows.length ? sharedList : <p>{p.noInsights}</p>}
        </details>
      </section>
    );
  return (
    <section className="insights" aria-label={p.insights}>
      <p className="eyebrow">{p.insights}</p>
      <h2>{c.shared}</h2>
      <p className="insights-note">{p.insightsHelp}</p>
      {rows.length ? sharedList : <p>{p.noInsights}</p>}
      {fit.length > 0 && (
        <div className="preference-fit">
          <h3>{c.fit}</h3>
          <ul>
            {fit.map((key) => (
              <li key={key}>
                <span aria-hidden>✓</span>
                <span>{fitLabels[key]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

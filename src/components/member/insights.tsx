import type { Locale } from "@/lib/i18n";
import type { Catalog, Member } from "@/lib/member/data";
import {
  compatibility,
  insightText,
  type SharedProfile,
} from "@/lib/member/insights";
import { productCopy } from "@/lib/product-copy";
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
  const rows = compatibility(me, member),
    c = productCopy[locale];
  return (
    <section
      className={`insights ${compact ? "compact" : ""}`}
      aria-label={c.insights}
    >
      {compact ? (
        <p className="insight-heading">
          <span aria-hidden>↔</span> {c.insights}
        </p>
      ) : (
        <>
          <p className="eyebrow">↔ {c.insights}</p>
          <h2>{c.understand}</h2>
          <p className="insights-note">{c.insightsHelp}</p>
        </>
      )}
      {rows.length ? (
        <ul>
          {rows.slice(0, compact ? 2 : 5).map((r, i) => {
            const t = insightText(r, catalog, locale);
            return (
              <li key={i}>
                <span className="insight-mark" aria-hidden>
                  ↔
                </span>
                <div>
                  <strong>{t.heading}</strong>
                  <span>{t.detail}</span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>{c.noInsights}</p>
      )}
    </section>
  );
}

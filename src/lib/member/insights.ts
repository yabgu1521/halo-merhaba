import type { Member, Catalog } from "./data";
import { productCopy } from "../product-copy";
import type { Locale } from "../i18n";
// Pure and inspectable: no inferred beliefs, demographic stereotypes, scores or hidden fields.
export type Insight = {
  kind: "purpose" | "interest" | "language" | "learning";
  codes: string[];
  direction?: "they" | "you";
};
export type SharedProfile = Pick<
  Member,
  "purposes" | "interests" | "speaks" | "learns"
>;
const overlap = (a: string[], b: string[]) =>
  [...new Set(a)].filter((x) => b.includes(x)).sort();
export function compatibility(
  me: SharedProfile,
  other: SharedProfile,
): Insight[] {
  const rows: Insight[] = [];
  for (const [kind, key] of [
    ["purpose", "purposes"],
    ["interest", "interests"],
    ["language", "speaks"],
  ] as const) {
    const codes = overlap(me[key], other[key]);
    if (codes.length) rows.push({ kind, codes });
  }
  const they = overlap(me.speaks, other.learns),
    you = overlap(me.learns, other.speaks);
  if (they.length)
    rows.push({ kind: "learning", codes: they, direction: "they" });
  if (you.length) rows.push({ kind: "learning", codes: you, direction: "you" });
  return rows;
}
export function insightText(row: Insight, catalog: Catalog, locale: Locale) {
  const c = productCopy[locale];
  const source =
    row.kind === "purpose"
      ? catalog.purposes
      : row.kind === "interest"
        ? catalog.interests
        : catalog.languages;
  const labels = row.codes.map(
    (code) =>
      source.find((i) => i.code === code)?.labels[locale] ||
      source.find((i) => i.code === code)?.labels.en ||
      code,
  );
  const heading =
    row.kind === "purpose"
      ? c.sharedPurpose
      : row.kind === "interest"
        ? c.sharedInterest
        : row.kind === "language"
          ? c.commonLanguage
          : row.direction === "they"
            ? c.theyLearn
            : c.youLearn;
  return { heading, detail: labels.join(" · ") };
}
export function conversationStarters(
  me: SharedProfile,
  other: Member,
  catalog: Catalog,
  locale: Locale,
) {
  const c = productCopy[locale],
    insights = compatibility(me, other),
    rows: string[] = [];
  const interest = insights.find((x) => x.kind === "interest")?.codes[0];
  const learning = insights.find((x) => x.kind === "learning")?.codes[0];
  const label = (key: keyof Catalog, code: string) =>
    catalog[key].find((x) => x.code === code)?.labels[locale] ||
    catalog[key].find((x) => x.code === code)?.labels.en;
  if (interest && label("interests", interest))
    rows.push(
      c.interestPrompt.replace("{value}", label("interests", interest)!),
    );
  if (learning && label("languages", learning))
    rows.push(
      c.languagePrompt.replace("{value}", label("languages", learning)!),
    );
  if (label("countries", other.country))
    rows.push(
      c.culturePrompt.replace("{value}", label("countries", other.country)!),
    );
  return [...new Set(rows)].slice(0, 3);
}

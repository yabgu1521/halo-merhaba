"use client";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Catalog } from "@/lib/member/data";
import type { CandidateFilters } from "@/lib/member/matchmaking";
import { candidateFiltersSchema } from "@/lib/member/matchmaking";
import { memberCopy } from "@/lib/member/i18n";
import { matchmakingCopy } from "@/lib/matchmaking-copy";
import { productCopy } from "@/lib/product-copy";
import { postMember } from "./controls";
export function CandidateSearch({
  locale,
  catalog,
  filters,
  mode,
}: {
  locale: Locale;
  catalog: Catalog;
  filters: CandidateFilters;
  mode: string;
}) {
  const m = memberCopy[locale],
    c = matchmakingCopy[locale],
    p = productCopy[locale];
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const select = (
    key: keyof CandidateFilters,
    title: string,
    rows: { code: string; labels: Record<string, string> }[],
  ) => (
    <label key={key}>
      {title}
      <select name={key} defaultValue={String(filters[key] || "")}>
        <option value="">{m.all}</option>
        {rows.map((x) => (
          <option key={x.code} value={x.code}>
            {x.labels[locale] || x.labels.en}
          </option>
        ))}
      </select>
    </label>
  );
  const text = (
    key: "city" | "education" | "profession" | "name",
    title: string,
  ) => (
    <label key={key}>
      {title}
      <input name={key} maxLength={100} defaultValue={filters[key]} />
    </label>
  );
  const choices = (values: string[], labels: string[]) =>
    values.map((code, i) => ({ code, labels: { [locale]: labels[i] } }));
  return (
    <form
      className="filter-form candidate-filter-form"
      action={`/${locale}/app/discover`}
    >
      <input type="hidden" name="view" value={mode} />
      <fieldset className="essential-filters">
        <legend>{c.essentials}</legend>
        {text("name", m.searchName)}
        {select(
          "gender",
          m.gender,
          choices(
            ["woman", "man", "nonbinary", "undisclosed"],
            [m.woman, m.man, m.nonbinary, m.undisclosed],
          ),
        )}
        <div className="field-row">
          {(["min_age", "max_age"] as const).map((key, i) => (
            <label key={key}>
              {i ? m.maxAge : m.minAge}
              <input
                name={key}
                type="number"
                min={18}
                max={125}
                defaultValue={filters[key]}
              />
            </label>
          ))}
        </div>
        {select("country", m.country, catalog.countries)}
        {text("city", m.city)}
        {select("purpose", m.purpose, catalog.purposes)}
      </fieldset>
      <details
        className="more-filters"
        open={Boolean(
          filters.nationality ||
          filters.education ||
          filters.profession ||
          filters.relocation ||
          filters.future_country ||
          filters.children ||
          filters.with_photo ||
          filters.language ||
          filters.interest,
        )}
      >
        <summary>{c.moreFilters}</summary>
        {select("language", m.speaks, catalog.languages)}
        {select("interest", m.interests, catalog.interests)}
        {select("nationality", p.nationality, catalog.countries)}
        {text("education", p.education)}
        {text("profession", p.profession)}
        {select(
          "relocation",
          p.relocate,
          choices(["yes", "maybe", "no"], [p.yes, p.maybe, p.no]),
        )}
        {select("future_country", p.future, catalog.countries)}
        {select(
          "children",
          p.children,
          choices(
            ["yes", "no", "discuss"],
            [p.childrenYes, p.childrenNo, p.childrenDiscuss],
          ),
        )}
        <label className="check">
          <input
            type="checkbox"
            name="with_photo"
            value="1"
            defaultChecked={filters.with_photo}
          />
          {c.photo}
        </label>
        <p className="fine">{c.sharedOnly}</p>
      </details>
      <button className="button">{m.apply}</button>
      <button
        type="button"
        className="quiet"
        disabled={busy}
        onClick={async (e) => {
          const form = e.currentTarget.form;
          if (!form?.reportValidity()) return;
          const f = new FormData(form),
            input = Object.fromEntries(f.entries());
          const parsed = candidateFiltersSchema.safeParse({
            ...input,
            min_age: Number(f.get("min_age")),
            max_age: Number(f.get("max_age")),
            with_photo: f.has("with_photo"),
          });
          if (!parsed.success) {
            setNotice(m.invalidInput);
            return;
          }
          setBusy(true);
          try {
            const r = await postMember({
              action: "candidate-search",
              filters: parsed.data,
            });
            setNotice(r.error ? m.requestFailed : m.preferencesSaved);
          } catch {
            setNotice(m.requestFailed);
          } finally {
            setBusy(false);
          }
        }}
      >
        {c.savedSearch}
      </button>
      <a
        className="text-link"
        href={`/${locale}/app/discover?view=${mode}&reset=1`}
      >
        {c.clearSearch}
      </a>
      <p role="status">{notice}</p>
    </form>
  );
}

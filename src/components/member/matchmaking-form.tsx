"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import type { Catalog } from "@/lib/member/data";
import {
  emptyMatchmaking,
  matchmakingSchema,
  type MatchmakingPreferences,
} from "@/lib/member/matchmaking";
import { matchmakingCopy } from "@/lib/matchmaking-copy";
import { memberCopy } from "@/lib/member/i18n";
import { productCopy } from "@/lib/product-copy";
import { postMember } from "./controls";
export function MatchmakingForm({
  locale,
  catalog,
  initial,
}: {
  locale: Locale;
  catalog: Catalog;
  initial?: MatchmakingPreferences | null;
}) {
  const c = matchmakingCopy[locale],
    m = memberCopy[locale],
    p = productCopy[locale],
    router = useRouter();
  const [seed, setSeed] = useState(initial || emptyMatchmaking);
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [reset, setReset] = useState(0);
  const choices = (
    key: "countries" | "languages" | "genders",
    title: string,
  ) => {
    const source =
      key === "genders"
        ? ["woman", "man", "nonbinary", "undisclosed"].map((code) => ({
            code,
            labels: { [locale]: m[code as "woman"] },
          }))
        : key === "countries"
          ? catalog.countries
          : catalog.languages;
    return (
      <fieldset>
        <legend>{title}</legend>
        <div className="choice-grid">
          {source.map((x) => (
            <label className="choice" key={x.code}>
              <input
                type="checkbox"
                name={key}
                value={x.code}
                defaultChecked={seed[key].some(
                  (selected) => selected === x.code,
                )}
              />
              {x.labels[locale] || x.labels.en}
            </label>
          ))}
        </div>
      </fieldset>
    );
  };
  return (
    <section id="looking-for" className="matchmaking-editor">
      <h2>{c.preferences}</h2>
      <p>{c.preferenceHelp}</p>
      <p className="fine">{c.anyHelp}</p>
      <form
        key={reset}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const f = new FormData(e.currentTarget);
          const draft = {
            min_age: Number(f.get("min_age")),
            max_age: Number(f.get("max_age")),
            genders: f.getAll("genders"),
            countries: f.getAll("countries"),
            languages: f.getAll("languages"),
            purpose: f.get("purpose"),
            relocation: f.get("relocation"),
            looking_for: f.get("looking_for"),
            share_summary: f.get("share_summary") === "on",
          };
          const parsed = matchmakingSchema.safeParse(draft);
          if (!parsed.success) {
            setNotice(m.invalidInput);
            setBusy(false);
            return;
          }
          try {
            const r = await postMember({
              action: "matchmaking",
              preferences: parsed.data,
            });
            setNotice(r.error ? m.requestFailed : m.saved);
            if (!r.error) router.refresh();
          } catch {
            setNotice(m.requestFailed);
          } finally {
            setBusy(false);
          }
        }}
      >
        {choices("genders", c.genders)}
        <div className="field-row">
          {(["min_age", "max_age"] as const).map((k, i) => (
            <label key={k}>
              {i ? m.maxAge : m.minAge}
              <input
                type="number"
                name={k}
                min={18}
                max={125}
                required
                defaultValue={seed[k]}
              />
            </label>
          ))}
        </div>
        {choices("countries", c.countries)}
        {choices("languages", c.languages)}
        <label>
          {c.intention}
          <select name="purpose" defaultValue={seed?.purpose || ""}>
            <option value="">{c.any}</option>
            {catalog.purposes.map((x) => (
              <option key={x.code} value={x.code}>
                {x.labels[locale] || x.labels.en}
              </option>
            ))}
          </select>
        </label>
        <label>
          {c.relocation}
          <select name="relocation" defaultValue={seed?.relocation || ""}>
            <option value="">{c.any}</option>
            <option value="yes">{p.yes}</option>
            <option value="maybe">{p.maybe}</option>
            <option value="no">{p.no}</option>
          </select>
          <small>{c.sharedOnly}</small>
        </label>
        <label>
          {c.aboutLooking}
          <textarea
            name="looking_for"
            maxLength={600}
            rows={4}
            defaultValue={seed?.looking_for || ""}
          />
        </label>
        <label className="check">
          <input
            name="share_summary"
            type="checkbox"
            defaultChecked={seed?.share_summary || false}
          />
          <span>
            {c.share}
            <small>{c.private}</small>
          </span>
        </label>
        <div className="form-actions">
          <button className="button" disabled={busy}>
            {busy ? m.working : c.save}
          </button>
          <button
            type="button"
            className="quiet"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const r = await postMember({
                  action: "matchmaking",
                  preferences: emptyMatchmaking,
                });
                setNotice(r.error ? m.requestFailed : m.saved);
                if (!r.error) {
                  setSeed(emptyMatchmaking);
                  router.refresh();
                  setReset((x) => x + 1);
                }
              } catch {
                setNotice(m.requestFailed);
              } finally {
                setBusy(false);
              }
            }}
          >
            {c.resetPreferences}
          </button>
        </div>
        <p role="status">{notice}</p>
      </form>
    </section>
  );
}

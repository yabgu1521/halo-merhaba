"use client";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Catalog } from "@/lib/member/data";
import { productCopy } from "@/lib/product-copy";
import { memberCopy } from "@/lib/member/i18n";
import { postMember } from "./controls";
export type ProfileContext = {
  nationality: string | null;
  relocation: string | null;
  future_country: string | null;
  education: string | null;
  profession: string | null;
  children: string | null;
  destinations: string[];
  shared: boolean;
};
export function ContextForm({
  locale,
  catalog,
  initial,
  available,
}: {
  locale: Locale;
  catalog: Catalog;
  initial?: ProfileContext | null;
  available: boolean;
}) {
  const c = productCopy[locale],
    m = memberCopy[locale];
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const countrySelect = (name: string, title: string) => (
    <label>
      {title}
      <select name={name} defaultValue={initial?.[name as "nationality"] || ""}>
        <option value="">{c.unspecified}</option>
        {catalog.countries.map((x) => (
          <option key={x.code} value={x.code}>
            {x.labels[locale] || x.labels.en}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <details className="context-editor">
      <summary>{c.optional}</summary>
      <p>{c.optionalHelp}</p>
      {!available ? (
        <p className="form-notice">{c.setupRequired}</p>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setBusy(true);
            setNotice("");
            try {
              const d = await postMember({
                action: "profile-context",
                context: {
                  nationality: f.get("nationality"),
                  relocation: f.get("relocation"),
                  future_country: f.get("future_country"),
                  education: f.get("education"),
                  profession: f.get("profession"),
                  children: f.get("children"),
                  destinations: f.getAll("destinations"),
                  shared: f.get("shared") === "on",
                },
              });
              setNotice(d.error ? m.requestFailed : m.saved);
            } catch {
              setNotice(m.requestFailed);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="field-row">
            {countrySelect("nationality", c.nationality)}
            {countrySelect("future_country", c.future)}
          </div>
          <label>
            {c.relocate}
            <select name="relocation" defaultValue={initial?.relocation || ""}>
              <option value="">{c.unspecified}</option>
              <option value="yes">{c.yes}</option>
              <option value="maybe">{c.maybe}</option>
              <option value="no">{c.no}</option>
            </select>
          </label>
          <fieldset>
            <legend>{c.destinations}</legend>
            <div className="choice-grid">
              {catalog.countries.map((x) => (
                <label className="choice" key={x.code}>
                  <input
                    type="checkbox"
                    name="destinations"
                    value={x.code}
                    defaultChecked={initial?.destinations.includes(x.code)}
                  />
                  {x.labels[locale] || x.labels.en}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field-row">
            {(
              [
                ["education", c.education],
                ["profession", c.profession],
              ] as const
            ).map(([key, title]) => (
              <label key={key}>
                {title}
                <input
                  name={key}
                  maxLength={100}
                  defaultValue={initial?.[key] || ""}
                />
              </label>
            ))}
          </div>
          <label>
            {c.children}
            <select name="children" defaultValue={initial?.children || ""}>
              <option value="">{c.unspecified}</option>
              <option value="yes">{c.childrenYes}</option>
              <option value="no">{c.childrenNo}</option>
              <option value="discuss">{c.childrenDiscuss}</option>
            </select>
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="shared"
              defaultChecked={initial?.shared || false}
            />
            <span>
              {c.share}
              <small>{c.privateNote}</small>
            </span>
          </label>
          <button className="button" disabled={busy}>
            {busy ? m.working : c.saveContext}
          </button>
          <p role="status">{notice}</p>
        </form>
      )}
    </details>
  );
}

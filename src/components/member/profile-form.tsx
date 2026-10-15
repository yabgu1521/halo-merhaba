"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { memberCopy, message } from "@/lib/member/i18n";
import type { Catalog, Choice } from "@/lib/member/data";
import { completion, profileSchema, ageFromDob } from "@/lib/member/validation";
import { postMember } from "./controls";
export type Draft = {
  display_name: string;
  date_of_birth: string;
  gender: string;
  country: string;
  city: string;
  biography: string;
  discoverable: boolean;
  purposes: string[];
  speaks: string[];
  learns: string[];
  interests: string[];
  safety_acknowledged_at?: string | null;
};
const empty: Draft = {
  display_name: "",
  date_of_birth: "",
  gender: "undisclosed",
  country: "",
  city: "",
  biography: "",
  discoverable: true,
  purposes: [],
  speaks: [],
  learns: [],
  interests: [],
};
function Choices({
  items,
  locale,
  value,
  onChange,
  title,
}: {
  items: Choice[];
  locale: Locale;
  value: string[];
  onChange: (v: string[]) => void;
  title: string;
}) {
  return (
    <fieldset className="choice-set">
      <legend>{title}</legend>
      <div className="choice-grid">
        {items.map((item) => (
          <label className="choice" key={item.code}>
            <input
              type="checkbox"
              checked={value.includes(item.code)}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...value, item.code]
                    : value.filter((v) => v !== item.code),
                )
              }
            />
            {item.labels[locale] || item.labels.en}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
export function ProfileForm({
  locale,
  catalog,
  initial,
  initialPhoto,
  onboarding = false,
  safetyRules,
}: {
  locale: Locale;
  catalog: Catalog;
  initial: Partial<Draft>;
  initialPhoto: string | null;
  onboarding?: boolean;
  safetyRules: readonly string[];
}) {
  const c = memberCopy[locale],
    router = useRouter();
  const [draft, setDraft] = useState<Draft>({ ...empty, ...initial }),
    [step, setStep] = useState(onboarding ? 1 : 0),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [photo, setPhoto] = useState(initialPhoto),
    [safety, setSafety] = useState(false),
    [finished, setFinished] = useState(false);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const titles = [
    c.editProfile,
    c.welcome,
    c.basic,
    c.purpose,
    c.languages,
    c.interests,
    c.about,
    c.photo,
    c.safety,
    c.complete,
  ];
  const selected = (s: number) => step === 0 || step === s;
  const score = completion(draft, Boolean(photo));
  async function save() {
    const parsed = profileSchema.safeParse(draft);
    if (!parsed.success) {
      setNotice(c.invalidInput);
      return false;
    }
    const d = await postMember({ action: "profile", profile: parsed.data });
    if (d.error) {
      setNotice(message(c, d.error));
      return false;
    }
    return true;
  }
  async function next() {
    setBusy(true);
    setNotice("");
    try {
      if (
        step === 2 &&
        (!draft.display_name.trim() ||
          !draft.country ||
          !draft.city.trim() ||
          ageFromDob(draft.date_of_birth) < 18)
      ) {
        setNotice(c.invalidInput);
        return;
      }
      if (
        (step === 3 && !draft.purposes.length) ||
        (step === 4 && !draft.speaks.length) ||
        (step === 5 && !draft.interests.length)
      ) {
        setNotice(c.invalidInput);
        return;
      }
      if (step === 6 || step === 0) {
        if (!(await save())) return;
        if (step === 0) {
          setNotice(c.saved);
          router.refresh();
          return;
        }
      }
      if (step === 7 && !photo) {
        setNotice(c.invalidPhoto);
        return;
      }
      if (step === 8) {
        if (!safety) {
          setNotice(c.safetyRequired);
          return;
        }
        const d = await postMember({ action: "complete", safety: true });
        if (d.error) {
          setNotice(message(c, d.error));
          return;
        }
        setDraft((d) => ({
          ...d,
          safety_acknowledged_at: new Date().toISOString(),
        }));
        setFinished(true);
      }
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setNotice(c.requestFailed);
    } finally {
      setBusy(false);
    }
  }
  async function photoUpload(form: HTMLFormElement) {
    setBusy(true);
    setNotice("");
    try {
      const data = new FormData(form);
      const file = data.get("photo");
      if (!(file instanceof File) || file.size > 5 * 1024 * 1024) {
        setNotice(c.invalidPhoto);
        return;
      }
      const r = await fetch("/api/photos", { method: "POST", body: data }),
        d = await r.json();
      if (d.error) setNotice(message(c, d.error));
      else {
        setPhoto(d.photoId);
        setNotice(c.saved);
        router.refresh();
      }
    } catch {
      setNotice(c.requestFailed);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="onboarding">
      <div className="progress-heading">
        <span>{c.completion}</span>
        <strong>{score}%</strong>
      </div>
      <progress value={score} max={100} aria-label={c.completion} />
      {onboarding && (
        <p className="eyebrow">
          {c.step} {step} / 9
        </p>
      )}
      <h1>{titles[step]}</h1>
      {selected(1) && step !== 0 && <p className="intro">{c.welcomeText}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void next();
        }}
        className="profile-fields"
      >
        {selected(2) && (
          <fieldset>
            <legend>{c.basic}</legend>
            <label>
              {c.displayName}
              <input
                value={draft.display_name}
                onChange={(e) => set("display_name", e.target.value)}
                required
                minLength={2}
                maxLength={60}
                autoComplete="nickname"
              />
            </label>
            <label>
              {c.dob}
              <input
                type="date"
                value={draft.date_of_birth}
                onChange={(e) => set("date_of_birth", e.target.value)}
                required
                min="1900-01-01"
              />
              <small>{c.dobHelp}</small>
            </label>
            <div className="field-row">
              <label>
                {c.gender}
                <select
                  value={draft.gender}
                  onChange={(e) => set("gender", e.target.value)}
                >
                  {(["woman", "man", "nonbinary", "undisclosed"] as const).map(
                    (g) => (
                      <option key={g} value={g}>
                        {c[g]}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label>
                {c.country}
                <select
                  required
                  value={draft.country}
                  onChange={(e) => set("country", e.target.value)}
                >
                  <option value="">{c.choose}</option>
                  {catalog.countries.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.labels[locale] || item.labels.en}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              {c.city}
              <input
                value={draft.city}
                onChange={(e) => set("city", e.target.value)}
                required
                maxLength={80}
                autoComplete="address-level2"
              />
            </label>
          </fieldset>
        )}
        {selected(3) && (
          <>
            <p>{c.purposeHelp}</p>
            <Choices
              title={c.purpose}
              items={catalog.purposes}
              locale={locale}
              value={draft.purposes}
              onChange={(v) => set("purposes", v)}
            />
          </>
        )}
        {selected(4) && (
          <>
            <Choices
              title={c.speaks}
              items={catalog.languages}
              locale={locale}
              value={draft.speaks}
              onChange={(v) => set("speaks", v)}
            />
            <Choices
              title={c.learns}
              items={catalog.languages}
              locale={locale}
              value={draft.learns}
              onChange={(v) => set("learns", v)}
            />
          </>
        )}
        {selected(5) && (
          <Choices
            title={c.interests}
            items={catalog.interests}
            locale={locale}
            value={draft.interests}
            onChange={(v) => set("interests", v)}
          />
        )}
        {selected(6) && (
          <label>
            {c.about}
            <textarea
              value={draft.biography}
              onChange={(e) => set("biography", e.target.value)}
              required
              minLength={20}
              maxLength={1000}
              rows={6}
            />
            <small>
              {c.bioHelp} · {draft.biography.length}/1000
            </small>
          </label>
        )}
        {step === 0 && (
          <label className="check">
            <input
              type="checkbox"
              checked={draft.discoverable}
              onChange={(e) => set("discoverable", e.target.checked)}
            />
            <span>
              {c.visibility}
              <small>{c.visibilityHelp}</small>
            </span>
          </label>
        )}
        {step === 8 && (
          <div className="safety-card">
            <ul>
              {safetyRules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p>{c.verificationHelp}</p>
            <label className="check">
              <input
                type="checkbox"
                checked={safety}
                onChange={(e) => setSafety(e.target.checked)}
                required
              />
              {c.safetyAck}
            </label>
          </div>
        )}
        {step === 9 && finished && (
          <>
            <p>{c.completeText}</p>
            <Link className="button" href={`/${locale}/app/discover`}>
              {c.discover}
            </Link>
          </>
        )}
        {step !== 7 && step < 9 && (
          <div className="form-actions">
            {onboarding && step > 1 && (
              <button
                type="button"
                className="quiet"
                disabled={busy}
                onClick={() => {
                  setStep((s) => s - 1);
                  setNotice("");
                }}
              >
                {c.back}
              </button>
            )}
            <button className="button" disabled={busy}>
              {busy ? c.working : step === 0 ? c.save : c.continue}
            </button>
          </div>
        )}
      </form>
      {(step === 7 || step === 0) && (
        <section className="photo-editor">
          <h2>{c.photo}</h2>
          <p>{c.photoHelp}</p>
          {photo && (
            <div className="photo-preview">
              {photo !== "uploaded" ? (
                <img
                  src={`/api/photos/${photo}`}
                  alt={c.photoAlt}
                  width={160}
                  height={160}
                />
              ) : (
                <p>{c.saved}</p>
              )}
              <button
                type="button"
                className="quiet danger"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const r = await fetch("/api/photos", { method: "DELETE" }),
                      d = await r.json();
                    if (d.error) setNotice(message(c, d.error));
                    else {
                      setPhoto(null);
                      setNotice(c.saved);
                      router.refresh();
                    }
                  } catch {
                    setNotice(c.requestFailed);
                  }
                  setBusy(false);
                }}
              >
                {c.deletePhoto}
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void photoUpload(e.currentTarget);
            }}
          >
            <label>
              {c.photo}
              <input
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp"
                required
              />
            </label>
            <button className="button" disabled={busy}>
              {busy ? c.working : c.upload}
            </button>
          </form>
          {step === 7 && (
            <div className="form-actions">
              <button
                className="quiet"
                disabled={busy}
                onClick={() => setStep(6)}
              >
                {c.back}
              </button>
              <button
                className="button"
                disabled={busy || !photo}
                onClick={() => void next()}
              >
                {c.continue}
              </button>
            </div>
          )}
        </section>
      )}
      {notice && (
        <p className="form-notice" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}

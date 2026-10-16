"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { locales, languageNames, type Locale } from "@/lib/i18n";
import { siteCopy } from "@/content/site-copy";
import { serviceByKind, type LeadKind } from "@/content/services";
import { intakeSchema, formatHandoff, type Intake } from "@/lib/intake";
import { products, productTitles } from "@/content/catalog";
import { track, whatsappLink } from "@/lib/config";
import { Icon } from "./icons";
type Key =
  | "nationality"
  | "currentCountry"
  | "targetCountry"
  | "topic"
  | "processType"
  | "documentCategory"
  | "sourceLanguage"
  | "targetLanguage"
  | "documentType"
  | "pages"
  | "deadline"
  | "certified"
  | "eventType"
  | "mode"
  | "city"
  | "plannedDate"
  | "duration"
  | "preferredLanguage"
  | "contactMethod"
  | "level";
const fields: Record<LeadKind, Key[]> = {
  marriage: ["nationality", "currentCountry", "topic"],
  documents: ["documentCategory", "targetCountry"],
  translation: [
    "sourceLanguage",
    "targetLanguage",
    "documentType",
    "pages",
    "deadline",
    "certified",
  ],
  interpreter: [
    "eventType",
    "mode",
    "city",
    "currentCountry",
    "sourceLanguage",
    "targetLanguage",
    "plannedDate",
    "duration",
  ],
  consultation: [
    "topic",
    "currentCountry",
    "preferredLanguage",
    "contactMethod",
  ],
  course: ["level", "preferredLanguage", "currentCountry"],
  precheck: ["nationality", "processType", "documentCategory", "targetCountry"],
  product_interest: [],
};
const required: Partial<Record<LeadKind, Key[]>> = {
  marriage: ["nationality", "currentCountry"],
  documents: ["documentCategory", "targetCountry"],
  translation: fields.translation,
  interpreter: fields.interpreter,
  consultation: fields.consultation,
  course: ["level", "preferredLanguage"],
  precheck: fields.precheck,
};
export function IntakeForm({
  kind,
  locale,
  persistenceEnabled,
  productId,
}: {
  kind: LeadKind;
  locale: Locale;
  persistenceEnabled: boolean;
  productId?: string;
}) {
  const c = siteCopy[locale];
  const [canPersist, setCanPersist] = useState(persistenceEnabled);
  useEffect(() => {
    let live = true;
    fetch("/api/capabilities", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (live && typeof data?.intakeEnabled === "boolean")
          setCanPersist(data.intakeEnabled);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [errors, setErrors] = useState<string[]>([]),
    [reference, setReference] = useState(""),
    [message, setMessage] = useState(""),
    [notice, setNotice] = useState("");
  const product = products.find((p) => p.id === productId);
  const name =
    kind === "product_interest"
      ? c.interestTitle
      : serviceByKind(kind)?.name[locale] || c.request;
  const options = (key: Key): [string, string][] | null =>
    key === "sourceLanguage" ||
    key === "targetLanguage" ||
    key === "preferredLanguage"
      ? locales.map((code) => [code, languageNames[code]] as [string, string])
      : key === "certified"
        ? [
            ["yes", c.yes],
            ["no", c.no],
            ["unsure", c.unsure],
          ]
        : key === "mode"
          ? [
              ["online", c.online],
              ["in_person", c.inPerson],
            ]
          : key === "contactMethod"
            ? [
                ["email", c.email],
                ["whatsapp", c.whatsappContact],
              ]
            : key === "level"
              ? c.courseLevels.map(
                  (label, index) =>
                    [["a1", "a2", "conversation", "private"][index], label] as [
                      string,
                      string,
                    ],
                )
              : null;
  async function submit(form: HTMLFormElement) {
    setError("");
    setErrors([]);
    setNotice("");
    setMessage("");
    const fd = new FormData(form),
      answers: Record<string, string> = {};
    for (const key of fields[kind]) answers[key] = String(fd.get(key) || "");
    if (productId) answers.productId = productId;
    const parsed = intakeSchema.safeParse({
      kind,
      locale,
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      whatsapp: String(fd.get("whatsapp") || ""),
      summary: String(fd.get("summary") || ""),
      answers,
      consent: fd.get("consent") === "on",
      website: String(fd.get("website") || ""),
    });
    if (!parsed.success) {
      setError(c.validation);
      setErrors(
        parsed.error.issues.map((issue) =>
          String(issue.path[issue.path.length - 1]),
        ),
      );
      return;
    }
    const draft = formatHandoff(
      parsed.data,
      Object.fromEntries(
        Object.entries(c).filter(([, value]) => typeof value === "string"),
      ) as Record<string, string>,
      name,
    );
    const event =
      kind === "product_interest"
        ? "product_interest"
        : kind === "course"
          ? "course_interest"
          : kind === "translation"
            ? "translation_request"
            : "consultation_click";
    track(event, { kind });
    if (!canPersist) {
      setMessage(draft);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();
      if (
        response.status === 201 &&
        data.stored === true &&
        typeof data.id === "string"
      )
        setReference(data.id);
      else {
        setError(c.failed);
        setMessage(draft);
      }
    } catch {
      setError(c.failed);
      setMessage(draft);
    } finally {
      setBusy(false);
    }
  }
  function field(key: Key) {
    const choices = options(key),
      isRequired = Boolean(required[kind]?.includes(key));
    const help =
      key === "documentCategory" || key === "documentType"
        ? c.documentHelp
        : key === "deadline" || key === "plannedDate"
          ? c.deadlineHelp
          : key === "certified"
            ? c.certifiedHelp
            : key === "pages"
              ? c.pagesHelp
              : key === "eventType"
                ? c.eventHelp
                : key === "level"
                  ? c.levelHelp
                  : undefined;
    return (
      <label className="hm-field" key={key}>
        <span>
          {c[key]}
          {isRequired && <i aria-label={c.required}>*</i>}
        </span>
        {choices ? (
          <select
            name={key}
            aria-label={c[key]}
            aria-describedby={help ? `help-${key}` : undefined}
            required={isRequired}
            aria-invalid={errors.includes(key)}
            defaultValue=""
          >
            <option value="">{c.chooseOption}</option>
            {choices.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={key}
            aria-label={c[key]}
            aria-describedby={help ? `help-${key}` : undefined}
            required={isRequired}
            aria-invalid={errors.includes(key)}
            type={
              key === "pages" || key === "duration"
                ? "number"
                : key === "deadline" || key === "plannedDate"
                  ? "date"
                  : "text"
            }
            min={key === "duration" ? ".5" : key === "pages" ? "1" : undefined}
            step={key === "duration" ? ".5" : undefined}
            maxLength={200}
          />
        )}
        {help && <small id={`help-${key}`}>{help}</small>}
      </label>
    );
  }
  if (reference)
    return (
      <div className="hm-form-success" role="status">
        <Icon name="check" size={35} />
        <h3>{c.received}</h3>
        <p>
          {c.reference}: <code>{reference}</code>
        </p>
        <button
          className="hm-button secondary"
          onClick={() => setReference("")}
        >
          {c.newRequest}
        </button>
      </div>
    );
  return (
    <section className="hm-intake" id="request-form">
      <p className="hm-eyebrow">{name}</p>
      <h2>
        {kind === "product_interest"
          ? c.notify
          : serviceByKind(kind)?.cta[locale] || c.requestTitle}
      </h2>
      <p className="hm-form-intro">
        {kind === "product_interest" ? c.interestHelp : c.formIntro}
      </p>
      {kind !== "product_interest" && (
        <p className="hm-form-required">{c.formRequired}</p>
      )}
      {!canPersist && (
        <div className="hm-dev-state">
          <Icon name="lock" size={16} />
          <p>
            <strong>{c.development}</strong>
            {c.developmentText}
          </p>
        </div>
      )}
      <div className="hm-sensitive">
        <Icon name="shield" size={19} />
        <p>{c.sensitiveWarning}</p>
      </div>
      {product && (
        <p className="hm-product-selection">
          {productTitles[product.id][locale]}
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(e.currentTarget);
        }}
        noValidate
      >
        <div className="hm-form-grid">
          <label className="hm-field">
            <span>
              {c.name}
              {kind !== "product_interest" && <i>*</i>}
            </span>
            <input
              name="name"
              aria-label={c.name}
              aria-describedby="help-name"
              autoComplete="name"
              maxLength={120}
              required={kind !== "product_interest"}
              aria-invalid={errors.includes("name")}
            />
            <small id="help-name">{c.nameHelp}</small>
          </label>
          <label className="hm-field">
            <span>
              {c.email}
              {kind === "product_interest" && <i>*</i>}
            </span>
            <input
              name="email"
              aria-label={c.email}
              aria-describedby={
                kind !== "product_interest" ? "help-contact" : undefined
              }
              type="email"
              autoComplete="email"
              maxLength={254}
              required={kind === "product_interest"}
              aria-invalid={errors.includes("email")}
            />
          </label>
          {kind !== "product_interest" && (
            <label className="hm-field">
              <span>{c.whatsappContact}</span>
              <input
                name="whatsapp"
                aria-label={c.whatsappContact}
                aria-describedby="help-contact"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                aria-invalid={errors.includes("whatsapp")}
              />
            </label>
          )}
          {kind !== "product_interest" && (
            <p className="hm-form-contact-help" id="help-contact">
              {c.contactHelp}
            </p>
          )}
          {fields[kind].map(field)}
        </div>
        {kind !== "product_interest" && (
          <label className="hm-field">
            <span>
              {c.summary}
              <i>*</i>
            </span>
            <textarea
              name="summary"
              aria-label={c.summary}
              aria-describedby="help-summary"
              rows={4}
              minLength={8}
              maxLength={1800}
              required
              aria-invalid={errors.includes("summary")}
            />
            <small id="help-summary">{c.summaryHelp}</small>
          </label>
        )}
        <div className="hm-honeypot" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="hm-consent">
          <input
            name="consent"
            type="checkbox"
            required
            aria-invalid={errors.includes("consent")}
          />
          <span>
            {kind === "product_interest" ? c.productConsent : c.consent}{" "}
            <Link href={`/${locale}/privasi`}>{c.privacy}</Link>
          </span>
        </label>
        {error && (
          <p className="hm-form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="hm-button" disabled={busy}>
          {busy ? c.submitting : canPersist ? c.submit : c.prepareMessage}
          <Icon name="arrow" size={18} />
        </button>
      </form>
      {message && (
        <section className="hm-handoff" aria-label={c.handoff}>
          <h3>{c.handoff}</h3>
          <p>{whatsappLink(message) ? c.handoffText : c.sendUnavailable}</p>
          <textarea value={message} readOnly rows={8} aria-label={c.handoff} />
          <div className="hm-form-actions">
            <button
              className="hm-button secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(message);
                  setNotice(c.copied);
                } catch {
                  setNotice(c.copyFailed);
                }
              }}
            >
              {c.copy}
            </button>
            {whatsappLink(message) && (
              <a
                className="hm-button"
                href={whatsappLink(message)!}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { kind })}
              >
                {c.openWhatsapp}
                <Icon name="arrow" size={16} />
              </a>
            )}
          </div>
          {notice && <p role="status">{notice}</p>}
        </section>
      )}
    </section>
  );
}

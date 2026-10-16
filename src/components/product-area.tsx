import type { Locale } from "@/lib/i18n";
import { productCopy } from "@/lib/product-copy";
export function ProductArea({
  locale,
  kind,
}: {
  locale: Locale;
  kind: "marriage" | "premium";
}) {
  const c = productCopy[locale];
  return kind === "marriage" ? (
    <div className="product-area">
      <p className="eyebrow">{c.chapter}</p>
      <h1>{c.marriageTitle}</h1>
      <p className="area-intro">{c.marriageIntro}</p>
      <div className="journey-layout">
        <section>
          <h2>{c.journey}</h2>
          <ol className="journey-steps">
            {c.journeySteps.map((x, i) => (
              <li key={x}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <p>{x}</p>
              </li>
            ))}
          </ol>
        </section>
        <aside className="guidance-note">
          <span className="bridge-symbol" aria-hidden>
            ↔
          </span>
          <h2>{c.marriage}</h2>
          <p>{c.guidance}</p>
          <p className="warning">{c.requirementWarning}</p>
        </aside>
      </div>
      <section className="service-overview">
        <h2>{c.services}</h2>
        <div className="service-columns">
          {c.serviceNames.map((name, i) => (
            <article key={name}>
              <span className="eyebrow">0{i + 1}</span>
              <h3>{name}</h3>
              <p>{c.serviceTexts[i]}</p>
            </article>
          ))}
        </div>
        <p className="availability-note">{c.notAvailable}</p>
      </section>
    </div>
  ) : (
    <div className="product-area">
      <p className="eyebrow">{c.premium}</p>
      <h1>{c.premiumTitle}</h1>
      <p className="area-intro">{c.premiumText}</p>
      <div className="membership-columns">
        {[
          [c.free, c.freeBenefits],
          [c.planned, c.premiumBenefits],
        ].map(([title, items], i) => (
          <section key={i}>
            <span className="eyebrow">0{i + 1}</span>
            <h2>{title}</h2>
            <ul>
              {(items as readonly string[]).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="availability-note">{c.premiumNotice}</p>
    </div>
  );
}

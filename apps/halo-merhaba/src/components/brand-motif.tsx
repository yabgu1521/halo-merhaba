import { brandCopy, type ServiceWorld } from "@/content/brand-content";
import type { Locale } from "@/lib/i18n";
/** Original line artwork. Decorative; the surrounding copy carries the meaning. */
export function BrandMotif({
  variant = "connection",
}: {
  variant?: ServiceWorld | "connection";
}) {
  return (
    <svg
      className={`hm-brand-motif motif-${variant}`}
      viewBox="0 0 400 280"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {variant === "connection" && (
        <>
          <path
            className="hm-route-secondary"
            d="M65 208C65 72 335 208 335 72"
          />
          <path className="hm-route-primary" d="M65 190C65 88 335 192 335 90" />
          <circle cx="65" cy="190" r="28" />
          <circle cx="335" cy="90" r="28" />
          <circle className="hm-route-point" cx="65" cy="190" r="5" />
          <circle className="hm-route-point" cx="335" cy="90" r="5" />
          <path d="M184 140h32m-8-8 8 8-8 8" />
          <path className="hm-motif-rule" d="M65 238v12m270-220v12" />
        </>
      )}
      {variant === "marriage" && (
        <>
          <circle cx="160" cy="137" r="70" />
          <circle cx="240" cy="137" r="70" />
          <path
            className="hm-route-primary"
            d="M160 67a70 70 0 0 1 55 113m25 27a70 70 0 0 1-55-113"
          />
          <path
            className="hm-motif-rule"
            d="M90 235h220M130 225v20m70-20v20m70-20v20"
          />
        </>
      )}
      {variant === "documents" && (
        <>
          <path d="M112 40h122l54 54v148H112V40Z" />
          <path d="M234 40v54h54" />
          <path
            className="hm-route-primary"
            d="m142 130 7 7 14-17m-21 51 7 7 14-17m-21 51 7 7 14-17"
          />
          <path d="M182 129h71m-71 41h71m-71 41h48" />
          <path className="hm-motif-rule" d="M91 68H76v178h186" />
        </>
      )}
      {variant === "language" && (
        <>
          <path d="M60 55h200v110H112l-34 29v-29H60V55Z" />
          <path
            className="hm-route-primary"
            d="M145 192h135l40 28v-28h20V98h-53"
          />
          <path d="M91 92h126m-126 29h87" />
          <path className="hm-motif-rule" d="M202 154v-26m-13 13h26" />
          <circle cx="249" cy="221" r="3" />
          <circle cx="270" cy="221" r="3" />
          <circle cx="291" cy="221" r="3" />
        </>
      )}
      {variant === "guidance" && (
        <>
          <circle cx="200" cy="140" r="91" />
          <circle className="hm-motif-rule" cx="200" cy="140" r="71" />
          <path
            className="hm-route-primary"
            d="m237 103-24 50-50 24 24-50 50-24Z"
          />
          <path d="m187 127 26 26M200 33v16m0 182v16M93 140h16m182 0h16" />
          <circle cx="200" cy="140" r="4" />
        </>
      )}
    </svg>
  );
}
export function ConnectionPanel({ locale }: { locale: Locale }) {
  const b = brandCopy[locale];
  return (
    <div className="hm-connection-panel" aria-hidden="true">
      <div className="hm-panel-top">
        <span>hm</span>
        <span>{b.connectionEyebrow}</span>
        <i>01 — 02</i>
      </div>
      <div className="hm-connection-chart">
        <BrandMotif />
        <span className="hm-chart-id">Indonesia</span>
        <span className="hm-chart-tr">Türkiye</span>
      </div>
      <div className="hm-panel-bottom">
        <h2>{b.connectionTitle}</h2>
        <p>{b.connectionCaption}</p>
        <div>
          {b.connectionLabels.map((label, index) => (
            <span key={label}>
              <i>0{index + 1}</i>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
export function LanguagePhrases({ locale }: { locale: Locale }) {
  const b = brandCopy[locale];
  return (
    <div className="hm-language-phrases">
      {["Merhaba", "Teşekkürler", "Nasılsın?"].map((phrase, index) => (
        <span key={phrase}>
          <strong lang="tr">{phrase}</strong>
          <small>{b.phraseMeanings[index]}</small>
        </span>
      ))}
    </div>
  );
}

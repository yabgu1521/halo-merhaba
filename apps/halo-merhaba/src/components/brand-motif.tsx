import { brandCopy, type ServiceWorld } from "@/content/brand-content";
import type { Locale } from "@/lib/i18n";
import { CountryOutline, CountryFlag } from "./country-art";
/** Original editorial country artwork. All labels remain live HTML outside the SVG. */
export function BrandMotif({
  variant = "connection",
}: {
  variant?: ServiceWorld | "connection";
}) {
  return (
    <svg
      className={`hm-brand-motif hm-geographic-motif motif-${variant}`}
      viewBox="0 0 600 360"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g transform="translate(330 24) scale(.79)">
        <CountryOutline country="tr" />
      </g>
      <g transform="translate(14 202) scale(.86)">
        <CountryOutline country="id" />
      </g>
      <path
        className="hm-map-connection"
        pathLength="1"
        d={
          variant === "connection"
            ? "M264 234C356 234 259 126 347 126"
            : "M254 239C279 239 280 218 282 207M329 155C339 143 334 126 347 126"
        }
      />
      <circle className="hm-map-node" cx="264" cy="234" r="3" />
      <circle className="hm-map-node" cx="347" cy="126" r="3" />
      <circle className="hm-map-halo" cx="347" cy="126" r="10" />
      {variant === "connection" && (
        <path className="hm-motif-rule" d="m294 168 6-5 5 6m-5-6-1 15" />
      )}
      {variant === "marriage" && (
        <g className="hm-map-symbol">
          <circle cx="288" cy="181" r="24" />
          <circle cx="316" cy="181" r="24" />
          <path
            className="hm-route-primary"
            d="M288 157a24 24 0 0 1 19 39m9 9a24 24 0 0 1-19-39"
          />
        </g>
      )}
      {variant === "documents" && (
        <g className="hm-map-symbol">
          <path d="M277 144h38l18 18v54h-56v-72Zm38 0v18h18" />
          <path
            className="hm-route-primary"
            d="m286 177 4 4 7-9m-11 24 4 4 7-9"
          />
          <path d="M304 178h17m-17 17h17" />
        </g>
      )}
      {variant === "language" && (
        <g className="hm-map-symbol">
          <path d="M261 148h68v42h-42l-13 11v-11h-13v-42Z" />
          <path
            className="hm-route-primary"
            d="M292 204h30l15 10v-10h9v-38h-10"
          />
          <path d="M273 163h39m-39 12h28" />
        </g>
      )}
      {variant === "guidance" && (
        <g className="hm-map-symbol">
          <circle cx="303" cy="180" r="33" />
          <path
            className="hm-route-primary"
            d="m316 167-8 19-18 7 7-18 19-8Z"
          />
          <path d="M303 141v6m0 66v6m-39-39h6m66 0h6" />
        </g>
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
        <span className="hm-chart-id">
          <CountryFlag country="id" />
          Indonesia
        </span>
        <span className="hm-chart-tr">
          <CountryFlag country="tr" />
          Türkiye
        </span>
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

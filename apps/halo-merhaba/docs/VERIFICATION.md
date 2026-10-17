# Verification — 2026-10-16

- Next.js production build and TypeScript passed.
- Custom source/security lint passed (not ESLint).
- 8 unit tests passed: validation, consent/contact, strict payloads, translation, product-interest boundaries, configuration, bilingual routes and SQL/source boundaries.
- 2 browser tests passed: all 50 localized pages at 375/768/1440px (150 renders), single h1, correct language, canonical/OG and valid JSON-LD, no horizontal overflow, no uploads/downloads, honest unsent fallback, language-path preservation, disabled unconfigured admin, CSRF and unconfigured API responses. Chromium used; this is not a full WCAG audit.
- Actual migration applied to disposable PostgreSQL 17: anonymous/non-admin denial, role boundaries, admin reads/status/notes, note author binding, private notes, rate limiting and inactive-admin revocation passed.
- Isolated real GoTrue + PostgREST + PostgreSQL + Next.js browser flow passed: all 8 inquiry types persisted, HTTP 429 rate-limit enforcement, admin password login, list/detail, status/note changes and refresh persistence, anonymous API/direct-table denial. No mocked persistence. Synthetic local admin/credentials only, containers removed afterward.

## Limits

No live Halo Merhaba Supabase connection exists in this environment. No remote migration or real business admin creation was performed. Existing TurkIndo credentials/database were not accessed. Static cloud review disables backend/admin. No real WhatsApp/email delivery was tested. Legal/business text awaits approval. At the initial verification, products had no deliverables. The marriage checklist now records two owner-confirmed private PDF editions; purchases/downloads remain disabled. Live bucket/object verification has not been performed in this environment. Admin list currently shows latest 100 per service filter; summary counts include all rows. Add pagination before exceeding that operational volume. Verify final hosted RLS, provider/proxy configuration and business content before public launch.

## Completed marriage product page

Typecheck, source/security lint, 9 unit tests, production build, and 3 browser tests pass. Browser coverage: 50 localized routes at 360/375/390/412/430/768/1440px (350 renders), both marriage product editions, 16 content headings in 4 expandable modules, four illustrative previews, correct localized planned pricing, notify anchor and consultation link, unchanged interest form. Generated client assets and prerendered HTML/RSC contain no private bucket/object identifiers or Storage public/signing URLs. Desktop and 360px/Retina layouts reviewed visually. No PDF fetched, signed or made public; no remote Storage configuration inspected or modified. Live interest delivery is not asserted in this environment because dedicated Halo backend bindings are unavailable; existing honest fallback remains.

## Nine-product Digital Guides catalog

Typecheck, source/security lint, 10 unit tests and production build pass. The catalog has nine explicit-category records with IDR planned pricing, localized titles/descriptions and proposed inclusion lists. Only marriage-checklist-wni has finished content; all sales/downloads remain disabled. Existing isolated Auth + PostgREST + PostgreSQL regression passed: all 8 inquiry types persisted, rate limit enforced, admin login/list/detail/status/notes survived refresh, anonymous API/direct-table access denied; disposable resources cleaned up. Production Supabase was not accessed and its settings were not changed.

Browser coverage for this catalog update: 62 localized routes at 360/375/390/412/430/768/1440px (434 renders); all 18 localized product routes; nine cards and one ready product; all category filters; exact Indonesian IDR prices and Turkish price-pending notices; featured premium-page navigation; private access notices; no download links or private identifiers in rendered pages/client build output. Desktop and 360px layouts reviewed in both languages.

## Second completed private product

The document/apostille organizer now has two owner-confirmed private PDF editions, 19 pages each / 38 total. Exactly two catalog records are ready and seven remain unfinished; every sale/download gate remains false. Typecheck, source/security lint, 11 unit tests and production build pass. Isolated Auth/PostgREST/PostgreSQL regression passed for all 8 inquiry types, admin login/list/detail/status/note persistence, rate limiting and anonymous-access denial. Production Supabase was not accessed. The marriage product page/content and main featured product remain unchanged.

Browser checks cover 62 localized routes at seven widths (434 renders), both document-guide locales at 360/375/390/412/430/768/1440px, edition/page/price/access facts, 14 tools, 16 expandable module summaries, notify anchor and retained interest form. Public-artifact leak checks include all four private filenames, bucket identifier and public/signing Storage paths. No PDF was accessed, signed or made public.

## Third completed private product — A1 survival pack

The A1 pack now records two owner-confirmed private PDF editions, 25 pages each / 50 total. Exactly three products are ready and six unfinished; all sale/download gates remain false. Planned Indonesian price is Rp129.000, replacing Rp99.000 for this product only; Turkish pricing is pending. First two product page/content files remain unchanged.

Typecheck, source/security lint, 12 unit tests and production build pass. Isolated Auth/PostgREST/PostgreSQL regression passed: all 8 inquiry types persisted, admin login/list/detail/status/note refresh persistence, rate limit enforcement and anonymous API/direct-table denial. No production Supabase access or policy change. Browser coverage includes 62 localized routes at seven widths (434 renders), three ready cards, all product routes, both A1 locales at 360/375/390/412/430/768/1440px, 25/50-page facts, 26 tools/modules, bilingual practice, CEFR/certificate/teaching boundaries, interest CTA and no private PDF identifiers or download links. Leak scan includes all six registered filenames and bucket/public/signing identifiers. Desktop and mobile layouts reviewed visually.

## Fourth completed private product — family meeting toolkit

The family toolkit records two owner-confirmed private PDF editions, 27 pages each / 54 total. Exactly four products are ready and five unfinished; all sale/download gates remain false. Planned Indonesian price is Rp119.000, replacing Rp79.000 for this product only; Turkish pricing is pending. The first three completed product records and dedicated page/content files remain unchanged.

Typecheck, source/security lint, 13 unit tests and production build pass. Isolated Auth/PostgREST/PostgreSQL regression passed for all 8 inquiry types, admin persistence, rate limits and anonymous-access denial. Production Supabase and its policies were not accessed or modified. Browser coverage includes 62 localized routes at seven widths (434 renders), four ready cards, both family toolkit locales at 360/375/390/412/430/768/1440px, 27/54-page facts, 25 tools/modules, bilingual support, flexible-script/protocol/legal/counseling/agreement boundaries, and the existing interest CTA/form. Artifact leak scan includes all eight private filenames plus bucket/public/signing identifiers. Desktop and mobile layouts reviewed visually. No PDF was accessed, signed or made public.

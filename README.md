# TurkIndo Connect

A trust-centered Türkiye–Indonesia connection platform, with future professional marriage support.

## Current delivery
Localized public website plus the first member implementation: managed email authentication, adult onboarding, private profile editing, processed photos, bounded/filterable discovery, interests, mutual matches, blocks and confidential profile reports. **Supabase configuration is required. Database policies and delivered-email integration have not been exercised in this environment; do not launch to real users until those gates pass.** No messaging, billing, subscriptions or private marriage documents are implemented.

## Develop
Node.js 24 and npm. Run `npm ci`, copy `.env.example` to `.env.local` and configure the four required member values below. Run `npm run dev`. Public routes are `/en`, `/tr`, `/id`; member entry is `/<locale>/auth/signup`. Without backend configuration the public site works, auth forms are disabled with a localized explanation, and protected pages fail safely.

Required member configuration (enter values securely; never commit `.env.local`):
- `NEXT_PUBLIC_SITE_URL`: exact browser origin, including port locally, HTTPS on deployment.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project API URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: publishable or legacy anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service-role key, never a NEXT_PUBLIC variable.

`DATABASE_URL` is only needed if the chosen migration tooling uses it; application queries use authenticated Supabase clients and RLS. Configure provider email verification, SMTP and callback allowlists. Apply both migrations before signup is enabled. See DEPLOYMENT.md and DATABASE.md.

## Checks
`npm run build`, `npm run typecheck`, `npm run test:unit`, `npm test`. Browser tests use system Chromium or Playwright's installed Chromium; run `npx playwright install --with-deps chromium` on another machine, or configure `PLAYWRIGHT_CHROMIUM_EXECUTABLE`.

`npm run test:integration` additionally requires a **disposable local Supabase** stack, Mailpit and `.env.local` containing its generated keys. It refuses non-loopback URLs and generates fictional users with random passwords, then cleans up. It must not target production. These tests are authored but currently blocked by local runtime/network limitations; see docs/PROGRESS.md.

Brand: `src/lib/brand.ts` and CSS theme variables. Public UI copy: `src/lib/i18n.ts`; member UI copy: `src/lib/member/i18n.ts`. Country/language/purpose/interest choices are database catalogs with localized labels. Human translation and legal review remain launch prerequisites.

Start with PRODUCT_PLAN.md, MVP_SCOPE.md, USER_FLOWS.md, ARCHITECTURE.md, DATABASE_SCHEMA.md, SECURITY_THREAT_MODEL.md, SECURITY.md, DEPLOYMENT.md and docs/MEMBER_SYSTEM.md. The source and migration files are not proof of a verified live deployment.

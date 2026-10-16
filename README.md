# TurkIndo Connect

A trust-centered Türkiye–Indonesia connection platform, with future professional marriage support.

## Current delivery
Localized public website and member implementation: managed email Auth, adult onboarding, profiles/private photos, saved search, discovery, favorites, mutual matches, text messaging, blocks/reports and account navigation. **Hosted API/Auth checks pass, but remote member migrations and the full member journey are still blocked. Do not launch to real users until hosted RLS/storage, email delivery/callbacks and operations gates pass.** Local PostgreSQL policy tests pass. Billing, subscriptions and private marriage documents remain unimplemented.

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

## Remote integration follow-up
`npm run verify:supabase` checks injected runtime variable presence/format and, when available, makes read-only provider/table checks without printing values. Current result: all three API bindings are **not available to this task**, despite their reported secure configuration. Apply existing saved bindings to the running environment rather than pasting/recreating credentials. No remote migration, table inventory, RLS/Auth or storage success is claimed. SQL migration access additionally needs a secure database connection or supported CLI credentials; see DATABASE.md.

Local validation in this follow-up: build/typecheck passed; **15 tests passed** (9 unit, 6 browser/runtime). Remote member flows are not tested. No stable public preview URL is known, so NEXT_PUBLIC_SITE_URL remains unset. Dashboard callback setup and exact paths are in docs/MEMBER_SYSTEM.md. The member foundation is not yet verified for the next product phase.

### Latest published-binding check
All three Supabase API variables are now available to the running task. Remote access is still unconfirmed: the environment proxy returns tunnel HTTP 403 before Supabase. A draft adds only the configured project API hostname; review/save and publish the network change to apply it. Dev/start/diagnostic scripts now use Node 24 `--use-env-proxy`. Secure SQL migration access and a confirmed application origin are still missing. No migrations or remote Auth/storage/RLS tests ran during this check.


### Published network retry
Latest retry: the exact API-host network rule is published, but runtime proxy requests still return HTTP 403. No remote integration success is claimed. Reconnect or retry in a fresh task using the published environment to diagnose policy activation; migration credentials and the public origin remain outstanding.

## Functional member journey update
The approved UI is retained. Favorites, saved search preferences, real SQL display-name search, matched-user text messaging/unread state and account navigation are now implemented on the existing member architecture. Apply all three reviewed migrations before using these routes; no hosted member schema is currently confirmed.

See [functional MVP status](docs/FUNCTIONAL_MVP.md) for the actual remote/local evidence and two-TEST-account procedure. Commands: `npm run test:postgres` (disposable local PostgreSQL, non-root runtime), `RUN_REMOTE_AUTH_TESTS=1 npm run test:remote:auth` (real Auth, no email delivery), `RUN_REMOTE_MEMBER_TESTS=1 npm run test:remote:members` (real hosted member journey, blocked until migrations exist). These are explicit opt-ins, create random-password TEST identities only and remove their own fixtures; never use shared/demo credentials. The live application has no demo-data fallback.

Current results: 29 local tests and 5 remote Auth tests passed; full hosted profile/photo/match/message/RLS verification is still blocked. DATABASE_URL is malformed and the cloud has no supported public PostgreSQL TCP route. Use reviewed SQL Editor execution or securely configured management API access. NEXT_PUBLIC_SITE_URL and delivered-email/callback validation are still required. Payments remain unimplemented.

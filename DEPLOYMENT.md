# Deployment

## Current foundation
Node.js 24, npm. Run npm ci, npm run typecheck, npm test, npm run build, then npm start. Configure NEXT_PUBLIC_SITE_URL to the HTTPS canonical domain before build. No Supabase credentials are needed for the public foundation.

## Before a member launch
Provision separate development/staging/production databases; select region after legal review. Apply reviewed migrations, private storage policies and policy tests. Configure verified sender email, auth callback allowlists, staff MFA, rate-limit backing store, document scanner, monitoring without sensitive payloads, encrypted backups and restore drills. Configure TLS/domain and security headers. Review all legal copy and translations. Test at phone, tablet and desktop widths.

## Payments
No payment provider is active. Select an eligible provider for the operating company, verify signed sandbox webhooks, replay protection, reconciliation, refunds and invoice behavior before enabling checkout. Never mark an order paid from a browser redirect.

## Release and rollback
CI must run type checks, tests and production build; subsequent phases add DB/integration tests. Use staged compatible database migrations, deploy immutable application builds, retain previous build for rollback and document recovery. Do not deploy shared demo accounts or seeds. Environment snapshot publication is separate from application deployment.

## First member system configuration
Before enabling registration, apply the member migrations to staging; provide exact `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and server-only `SUPABASE_SERVICE_ROLE_KEY`. `DATABASE_URL` is migration-tooling-only. No payments or document-service credentials are needed. Do not set a service key in any NEXT_PUBLIC variable.

Enable Supabase email confirmations, minimum 12-character passwords, safe email-change behavior and appropriate native Auth rate limits. Configure SMTP with a verified domain and deliverability controls. Hosted redirect allowlists must contain the exact HTTPS locale callback URLs `/en/auth/callback`, `/tr/auth/callback`, `/id/auth/callback` and their `?flow=recovery` variants. Avoid production wildcards; the wildcards in supabase/config.toml are local-only. PKCE links need the original browser. Confirm both signup and password-reset emails against the intended sender/provider.

Run database/browser integration in a disposable local Supabase before staging review. The suite intentionally refuses production URLs. Verify permissions using anon, owner, stranger, blocked and suspended accounts; do not test only with a service role. Configure trusted-ingress abuse controls and a real moderation response process before opening registration. Terms/privacy/community/cookie placeholders must be professionally replaced; this engineering phase does not approve public launch.

No hosted project or public domain was deployed during this phase. Current local database/email integration is blocked as recorded in docs/PROGRESS.md. The production application builds without credentials but displays localized unavailable states until configured. Provider keys and the canonical origin must be set consistently for the build/runtime; NEXT_PUBLIC values may be embedded at build time.

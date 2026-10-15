# Deployment

## Current foundation
Node.js 24, npm. Run npm ci, npm run typecheck, npm test, npm run build, then npm start. Configure NEXT_PUBLIC_SITE_URL to the HTTPS canonical domain before build. No Supabase credentials are needed for the public foundation.

## Before a member launch
Provision separate development/staging/production databases; select region after legal review. Apply reviewed migrations, private storage policies and policy tests. Configure verified sender email, auth callback allowlists, staff MFA, rate-limit backing store, document scanner, monitoring without sensitive payloads, encrypted backups and restore drills. Configure TLS/domain and security headers. Review all legal copy and translations. Test at phone, tablet and desktop widths.

## Payments
No payment provider is active. Select an eligible provider for the operating company, verify signed sandbox webhooks, replay protection, reconciliation, refunds and invoice behavior before enabling checkout. Never mark an order paid from a browser redirect.

## Release and rollback
CI must run type checks, tests and production build; subsequent phases add DB/integration tests. Use staged compatible database migrations, deploy immutable application builds, retain previous build for rollback and document recovery. Do not deploy shared demo accounts or seeds. Environment snapshot publication is separate from application deployment.

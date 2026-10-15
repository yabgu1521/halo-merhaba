# Architecture

Next.js App Router, TypeScript, Tailwind 4 and server-rendered public pages. Locale routes `/en`, `/tr`, `/id`, a central brand module and typed public/member dictionaries preserve replaceable branding and copy. Database taxonomies carry localized labels. Human translation review remains necessary.

## Member application
`/[locale]/auth` contains managed-email authentication and PKCE callbacks. `src/proxy.ts` refreshes cookies with Supabase SSR; server handlers validate identity with getUser. Cookies are HttpOnly and SameSite=Lax, with Secure on the configured HTTPS origin. `src/lib/supabase/server.ts` is server-only.

`/[locale]/app` provides onboarding, discovery, matches, profile editing and member views. Protected server queries enforce verification, account activity and completion; SQL independently enforces the same permission boundaries. Client components handle forms, not authority. No fake auth or seeded shared credentials are used.

`src/lib/member` contains validation, completion calculation, bounded request parsing, image normalization and server data access. API routes validate inputs/origins and call identity-bound RPCs. Explicit grants, RLS, safe projections, uniqueness and transaction locks in `supabase/migrations` enforce database boundaries. Raw profiles (including DOB) are owner-only. Member URLs use independent public IDs.

## Storage and privileged access
Processed profile images use a private dedicated bucket. The server-only service client is limited in application use to normalized uploads/cleanup, photo delivery after a member-scoped authorization check, and persistent HMAC auth-rate buckets. It is not used to browse profiles or bypass member RLS. Document storage and service orders are not implemented and must not reuse a public bucket later.

## Deferred modules
Messaging, memberships, payments, marriage journeys/private documents, content-management UI and administration remain future phases. Payment, email, scheduling and scanning providers should remain replaceable adapters as they are introduced. Marriage requirements will be versioned staff-editable content, never permanently embedded legal logic.

## Validation and deployment
This member implementation builds and passes local unit/public/auth-screen browser tests. Database/RLS and delivered-email/member-session integration are authored but blocked by the unavailable local Supabase runtime and missing hosted configuration. See docs/PROGRESS.md. Code existence is not evidence of live authorization correctness. Deployment, legal review, moderation staffing and real-user release remain separate gates.

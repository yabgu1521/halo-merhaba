# Functional member MVP — current delivery and release gates

The approved visual system is retained. Changes add functional controls/routes using the existing components, theme and EN/TR/ID architecture. No payments, voice/video, documents or unrelated services were added.

## What is implemented
- Existing verified-email Auth, adult onboarding, profile editing, processed private photos, discoverability, purpose/language/interest catalogs, likes, mutual matches, blocks and confidential profile reporting are reused.
- `member_preferences` stores country/age/purpose/language/interest search defaults. Explicit query filters override saved defaults; Clear filters temporarily bypasses them. `search_members` filters in SQL, including case-insensitive display-name substring search. All discovery/favorite results use bounded opaque-ID cursor pagination (12 plus one).
- `favorites` is private to its actor, does not notify the target or create interest, and respects visibility/blocking. Blocking removes both members' favorites of each other.
- `conversations` can be opened only for a real mutual match. Participant IDs are derived in the database, not accepted from a client. Concurrent opens deduplicate on the match.
- `messages` contains text only (1–2,000 characters), timestamps and a retry identifier. Matching/blocking/sending share a pair lock. Message retry IDs cannot be reused for changed content or another conversation. Per-account limits apply. No client message edits, deletes, sender forging or attachments.
- Threads return 50 messages per page with bigint IDs serialized as strings. Conversation lists return 20 plus one, with own unread state based on the highest actually viewed message. Read markers cannot advance to a message in another conversation. Visible threads refresh every 15 seconds and offer manual refresh; this is not push/realtime delivery. No notification permission or external tracking.
- Blocking deletes the match (existing behavior), sets the old conversation's match link to null and immediately denies subsequent reads/sends. Message history is retained for potential professional moderation; it is not shown again after unblocking. A fresh reciprocal match opens a new empty conversation. Retention/deletion policy must be defined before launch.
- Account navigation exposes profile/privacy editing, password recovery and logout. Automated account deletion/export is NOT implemented. Operators still need a documented manual request process before launch.

## Database and privilege boundaries
Apply migrations in filename order, using a supported SQL execution method and inspecting existing remote state first:
1. `supabase/migrations/202610150001_members.sql`
2. `supabase/migrations/202610150002_auth_limits.sql`
3. `supabase/migrations/202610160001_member_communication.sql`

The third migration is additive: five new application tables (19 total), safe search/projection changes, explicit function/table privileges, RLS and transaction-bound RPCs. There is no reset, backfill, destructive schema operation or unrelated privilege broadening. The new block trigger removes only that relationship's favorites during an explicitly requested block; it does not execute a data cleanup when migrations are installed. The schema requires the normal Supabase Auth/Storage roles and tables.

All member writes use authenticated RPCs with auth.uid(). Direct table writes are denied. Messages/conversations are readable only through current active-match membership and no block. A service key is never a browser membership authority. Private DOB and photo storage paths do not appear in member pages/thread projections. Reports are visible only to the reporter and trusted operators, not the reported member. Reporting a profile is available from the message thread; dedicated message-evidence moderation UI is deferred.

## Actual remote observations
- Supabase API access with the publishable and service-role bindings succeeded.
- Public Auth settings report email signup enabled, signup not disabled and automatic email confirmation disabled.
- The REST resource inventory is empty; the expected member endpoints are unavailable (profiles HEAD returns HTTP 404). The profile-photo bucket is absent. This is an API observation, not a complete PostgreSQL schema inventory.
- `DATABASE_URL` is present but malformed and cannot be safely parsed. Never print its value/error context or silently guess a password/repair a connection URI. The selected cloud runtime has no raw TCP grant/VPN for PostgreSQL; public database TCP is not provided by its documented private-network forwarding path. API service-role access does not authorize arbitrary SQL.
- No Supabase management API token is available. Remote SQL execution/migrations remain blocked. Use the Supabase SQL Editor for the reviewed files, or configure supported management API access securely with the exact control-plane host allowed. If anyone has applied migrations manually, inspect that state/history before another apply; never reset/replay blindly.
- `NEXT_PUBLIC_SITE_URL` remains unset and no stable public preview origin was discoverable. The live UI origin guard fails closed until an exact origin is configured. Internal browser tests may pass an explicit temporary loopback origin to their own server; that is not a production domain or public preview.

## Test evidence — do not merge these categories
### REMOTE SUPABASE AUTH: 5 tests passed
`RUN_REMOTE_AUTH_TESTS=1 npm run test:remote:auth` used two generated TEST identities in the actual project. It verified rejection before confirmation, signup-token verification, password login/session resumption, recovery/password change, logout and refresh revocation. Admin-issued signup/recovery tokens avoid sending mail. **Inbox delivery, public registration UI, email links/callbacks, cookie persistence and SMTP are not proven by this suite.** Task-created identities were deleted, with no retained demo credentials.

### LOCAL PostgreSQL: 12 tests passed
`npm run test:postgres` starts a disposable loopback-only PostgreSQL instance from the npm-verified development dependency; it creates local Auth/Storage schema contracts and executes all real migration files. It uses non-superuser roles for RLS checks. It covers constraints/age, private data, forged writes, saved filters/favorites, reciprocal/concurrent matching, messages/read state/idempotency, stranger access, photo metadata policies, block/send races, confidential reports, rematching and suspension. These are real PostgreSQL policy tests, **not hosted Supabase Auth/Storage verification**. The local schema contracts do not implement a fake production backend. Random test credentials and the temporary cluster are deleted.

### LOCAL application: 17 tests passed
11 unit tests plus 6 browser/runtime tests, production build and TypeScript passed. These cover input bounds, image normalization, locales, responsive public/auth screens and protected unauthenticated routes. Authenticated member-screen responsive behavior is authored in the hosted journey procedure but remains unverified.

### REMOTE member journey: NOT PASSED
`RUN_REMOTE_MEMBER_TESTS=1 npm run test:remote:members` is an explicit opt-in procedure using exactly two TEST accounts. After migrations are present it exercises the real Next server against hosted Supabase: login/onboarding/edit/photo → discovery/search/preferences/favorite → mutual match → message/read/reply → privacy/report/block and authorization negatives. It cleans up only its own identities and storage paths. It never uses a production seed or shared credentials.

An initial attempt incorrectly relied on the SDK's empty HEAD 404 normalization and entered the test with missing schema; all five flow tests failed due unmet prerequisites. Cleanup succeeded. The guard now checks native HTTP statuses BEFORE starting the server or creating fixtures; a regression test covers this. The rerun stopped at the correct schema preflight (one file failure, zero flow tests executed). A follow-up complete Auth inventory found zero remaining codex-test identities. There is no passing hosted profile, photo, RLS, match or messaging claim.

## Safe two-account verification after migrations
1. Use the approved project and explicit opt-in, and build with the securely injected API variables. Never paste or log credentials.
2. Run the remote Auth suite, then the remote member suite. Each creates new random-password TEST accounts, never real customer data. Do not run concurrently; native Auth rate limits apply.
3. The member suite starts an isolated test server with its explicit internal origin. It does NOT reconfigure the project's public Site URL or send email. Fixture profile names are clearly marked TEST and removed after the run. If cleanup fails, use only the recorded task-created IDs; never delete users merely because they have a similar name.
4. Verify delivered registration/recovery emails separately with a controlled recipient and real confirmed application origin. In Supabase Authentication → URL Configuration, set that origin as Site URL and allow the three locale callback paths plus their `?flow=recovery` variants. See MEMBER_SYSTEM.md for exact paths.
5. Review RLS/storage policies via authorized SQL metadata access before public release, including any unrelated pre-existing bucket policy that might broaden access. Passing API tests alone does not replace that inspection.

## Before real users / before payments
Real-user release needs deployed migrations, hosted full-journey/RLS/storage checks, actual email delivery/callback/cookie tests, an exact HTTPS app origin, moderation staffing/report response, legal/privacy/retention review, account deletion/export procedures, abuse controls and monitoring/backups. The founder/legal placeholders are not approved policies. Demo data is never used as a fallback in discovery.

Payments remain entirely unimplemented. A later authorized billing phase needs provider/company eligibility, currencies/pricing, refund/invoice rules and signature-verified, idempotent webhooks before a paid state is possible. No payment prerequisite blocks the current member engineering work.

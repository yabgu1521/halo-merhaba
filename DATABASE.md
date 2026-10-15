# Database operations

## Implemented migrations
`supabase/migrations/202610150001_members.sql`: account security state; private profiles; country/purpose/language/interest catalogs and joins; processed photo metadata; likes; canonical-pair matches; blocks; confidential reports; RLS; bounded safe-profile functions; transactional mutations; private profile-photo bucket and policies.

`202610150002_auth_limits.sql`: private HMAC-address rate buckets and a service-only consumption function. No application passwords, member messages, payments or marriage documents are stored in this phase.

The standard Supabase `auth.users`, `storage.buckets`, `storage.objects`, `auth.uid()` and database roles must already exist. Do not apply these migrations to an uninitialized plain PostgreSQL database. They target PostgreSQL 15+ with Supabase infrastructure. No manual dashboard table creation is required.

## Apply
Use the official Supabase CLI. Local: `supabase start`, which applies migrations and an empty non-personal seed. Hosted: link the intended staging project, inspect the migration plan, then `supabase db push`. Use normal secure CLI authentication/database-password entry. Do not paste passwords into chat or commit them. Verify the target before applying. Configure email confirmation and callback URLs separately; database migrations do not configure Auth email delivery.

## Local integration
The committed config uses ports 54321 (API), 54322 (PostgreSQL), 54324 (Mailpit). For a smaller stack, `supabase start --exclude studio,imgproxy,realtime,edge-runtime,logflare,vector,supavisor,postgres-meta`. If the default registry is unavailable, `SUPABASE_INTERNAL_IMAGE_REGISTRY=docker.io` is a supported CLI 2.75.0 registry override. Normal overlay-backed Docker storage is recommended; this environment's vfs layer copying exceeded its disk budget. Do not reset a non-disposable database to run tests.

Obtain local API/service keys using `supabase status` and put them only in ignored local environment configuration. Never print or commit them. Set `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000`. Browser integration starts its own server on 3198 and uses the corresponding committed local Auth redirect allowlist. `npm run test:integration` refuses a non-loopback API URL and removes the generated accounts/photos. No fixed demo credentials are created. Local Mailpit is required to test actual confirmation/reset links.

## Status and safeguards
Migrations and adversarial integration tests are implemented but **not executed against a database in this environment**. Do not infer authorization correctness from a TypeScript build. Run the integration suite in local/staging Supabase, inspect all policies, and test migration application on a clean instance before release. Use encrypted backups, defined retention and restore drills. Rollback of data-bearing migrations needs a reviewed forward repair or restore; do not casually drop member tables.

The remaining entities in DATABASE_SCHEMA.md are future design, not existing tables. See docs/MEMBER_SYSTEM.md for the implemented privacy/matching semantics.

## Remote follow-up: current blocker and migration review
The project has reportedly been created, but this running machine receives none of NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or SUPABASE_SERVICE_ROLE_KEY. There is no local env file supplying them. `npm run verify:supabase` prints only variable availability/format statuses and read-only connectivity/table statuses; it never prints values, URL hosts, token fragments, account data or provider error bodies. Exit 2 means access is not confirmed. A structural format check is not key authenticity or authorization proof. Proxy-bound credential shapes require a live check.

No remote tables or policies have been inspected and neither migration has been applied remotely by this task. The reviewed schema contains the 14 application tables listed above, but that list is **not a remote inventory**. Permission statements in the initial, previously unexecuted migration were narrowed to named app functions/tables, preserving unrelated schema permissions/defaults. RLS remains enabled; no resets/drops were introduced. If someone has already applied this migration outside this task, do not replay or reset it: inspect remote history and prepare a targeted forward repair if necessary.

API credentials do not supply SQL execution. For automatic migration application, securely configure `DATABASE_URL` with the TLS PostgreSQL connection URI from **Supabase project → Connect → Session pooler** (or the direct connection if supported by the execution network). Use the database password there, not the service-role API key. Keep it out of chat, command-line arguments, logs and tracked files. A supported CLI alternative uses a securely supplied Supabase management access token plus database password. Inspect remote migration history and pending migrations first. Apply only these existing migrations; never use `db reset` against this project.

The existing integration test suite intentionally refuses hosted URLs and uses local Mailpit for delivered-email tests. It must not be represented as remote coverage. A hosted test run must use an explicitly authorized, scoped fixture workflow and clean up only IDs/objects it created; delivered email requires the actual configured provider and a controlled recipient. No local guard was removed or production data touched during this blocked follow-up.

### Latest runtime recheck
The three API variables are now available. Requests through the environment proxy are denied with tunnel HTTP 403 before reaching Supabase; no credential validity, remote schema inventory or RLS result is established. A draft now adds only the configured API hostname to the restricted network allowlist; review/save and publish that change before retrying. The hostname and variable values were not displayed. Migration credentials remain unavailable. `npm run verify:supabase` now uses Node 24's environment-proxy support, as do application dev/start commands.

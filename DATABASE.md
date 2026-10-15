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

# First functional member phase

## Boundaries
Email/password signup, verification, login, logout and reset use Supabase Auth. No application password table. Adults affirm 18+ at signup; the auth-user trigger rejects missing affirmation. Verified email and an active account are required for profile writes. DOB is checked in TypeScript and a PostgreSQL constraint. This does not verify identity or stop all dishonest DOB claims.

Public marketing remains server rendered and localized. All member and auth routes carry noindex metadata. Private responses are no-store. The deployment must keep member pages behind managed sessions and use TLS. Do not cache authenticated responses at a CDN.

## Profile and completion
`profiles` contains the private DOB and auth FK. Only its owner can directly select it; all direct member writes are revoked. Public profile identifiers are independent random UUIDs. Discovery and member pages use safe RPC projections containing age, city, country, display name, biography, purpose/language/interest codes, photo identifier and a specific email-verification label. They do not return DOB, email, storage keys or authentication IDs. The user's own private edit form receives DOB intentionally.

The completion score is the rounded fraction of seven equally weighted fulfilled groups: valid basic information; at least one purpose; at least one spoken language; at least one interest; biography of 20–1,000 characters; a processed photo; safety acknowledgement. Learning a language is optional. Onboarding completion is separately enforced in PostgreSQL and requires all groups. Deleting the photo resets completion and hides the profile until a new photo and safety completion are saved. Changing visibility does not make a profile incomplete.

Catalogs for countries, purposes, languages and interests are relational rows with EN/TR/ID labels and an active flag. Professional database operators can update these rows now; an administrator content editor is deferred. UI choices come from the database, not an embedded taxonomy. Add a country by inserting a new catalog row, not changing a country enum.

## Visibility and interaction
Only verified, active, completed members can discover others or express interest. Discovery returns at most 13 rows for a 12-card page plus a next-page indicator; all filtering happens in PostgreSQL. Cursor ordering uses immutable public IDs. Matches currently return the 100 most recent; large match-history pagination is deferred.

Disabling discovery removes the member from discovery and new direct visits. Existing matches can still see each other's limited profile and photos. Mutual blocks override this. No anonymous profile or photo access is permitted. Internal photo storage and auth IDs are not embedded in member page URLs.

Interest binds the sender to auth.uid(), rejects self-interest, and deduplicates using the primary key. Reciprocal interest creates a canonical-pair unique match. A per-pair transaction advisory lock serializes interests with blocks.

Blocking hides both profiles, prevents likes, and deletes interests in both directions and the match. Unblocking removes only the actor's block; it restores no interests or matches and cannot remove the other member's block. A report remains possible after blocking if the reporter already has the opaque profile ID. Blocked-account management exposes only the blocked name/public ID. Reports are owner-readable and never readable by the reported user; future authorized moderators need a separately reviewed access path. There is no admin UI or member-facing messaging in this phase.

## Photos
JPEG, PNG and WebP only; original upload maximum 5 MiB, maximum 16 million decoded pixels and 6,000 pixels per dimension. Multipart parsing has a streaming bound independent of Content-Length. Actual signatures and Sharp decoding are checked; SVG, animation, malformed images and decompression bombs are rejected. Re-encode to WebP at maximum 1,200px; strip EXIF/GPS and original filenames. Private profile-photos bucket only. No user may upload directly to storage or register arbitrary photos. A server-only service client uploads normalized bytes after authentication, active-account and own-profile checks.

Photo GET revalidates the caller, safe profile visibility and current photo ID before downloading via server-only storage credentials. Returns no-store bytes, not a reusable signed URL. Blocks and visibility affect subsequent requests immediately; no platform can retract bytes already viewed or prevent screenshots. Owners may access their original *processed* upload; unprocessed originals are never retained. Replacements/delete attempt storage cleanup. Rare concurrent upload/cleanup failures may leave inaccessible orphaned objects; schedule a storage/metadata reconciliation job before scale. Do not reuse this bucket for future marriage documents.

## Authentication and abuse controls
Server validates payloads; origin checks protect cookie-authenticated POST/DELETE routes. Callback destination is fixed to the selected supported locale; arbitrary next/return URLs are ignored. PKCE exchange uses secure HttpOnly SameSite=Lax cookies (Secure with HTTPS origin); refresh validates with getUser, not unverified session contents. Confirmation/reset links must open in the same browser for PKCE. Configure Supabase email confirmation and redirect allowlists before production use. Password minimum 12, maximum 128 characters; provider handles hashing.

Auth login/signup/reset/resend use shared database per-address HMAC rate buckets (12 login attempts/hour, five other attempts/hour). Supabase native auth IP limits also apply; enforce trusted-ingress IP limits/CAPTCHA and provider email limits before public traffic. Application does not trust arbitrary X-Forwarded-For as identity. Rate buckets contain no raw email; rows older than two days are pruned on subsequent attempts. Member writes are database-throttled per account: 60 profile writes, 100 interests, 100 block operations, 10 reports and 20 photo attempts per hour. Counters do not replace operational monitoring. Generic forgot/resend responses avoid address enumeration.

## Verification and privileges
Only an email-confirmation label exists in this phase. It is derived from Auth and does not mean photo/identity verification. Users cannot write account status or any privilege/verification field. User-editable auth metadata is never used for roles. No admin privilege-granting endpoint exists. Moderation UI, photo-verification review and account-deletion/export tooling are later phases; account suspension can be performed by a trusted database operator.

## External prerequisites
A hosted Supabase project requires API URL, publishable key, server-only service-role key, and database migration access. Set an exact NEXT_PUBLIC_SITE_URL, enable email confirmation, configure SMTP/deliverability and password strength, and allow only deployment callback URLs. No payment, private document, calendar or subscription credentials are required. Blank configuration produces a localized unavailable state and disabled auth submits; no mock accounts are substituted.

Local integration tooling uses a disposable local Supabase project and generated fictional accounts with random passwords; test cleanup removes them. Integration commands refuse non-loopback Supabase URLs. No shared demo credentials or real personal data are seeded. Local email verification/reset is exercised using Mailpit, never external recipients.

## Remote verification follow-up and callbacks
Current task: the three API binding names are absent from the running process. Saved configuration is distinct from runtime injection. Apply the existing saved bindings to this task; do not enter duplicates or paste secrets into chat. SQL migrations additionally require secure database/CLI migration access. `npm run verify:supabase` is a redacted, read-only preflight, not a replacement for owner/stranger/blocked-user RLS tests.

No stable public application preview URL was discoverable through available runtime metadata/tools. There is no justified production value for NEXT_PUBLIC_SITE_URL yet. Once deployed, use the exact confirmed HTTPS application origin, without a route/query/fragment (for example, the origin of the deployed site). Do not infer it from the Supabase API URL, use an unconfirmed domain, or trust request headers as an origin fallback. With the origin unset, mutation origin checks fail closed and callback handling returns unavailable; full web Auth cannot be declared working.

In the **Supabase project dashboard → Authentication → URL Configuration**:
1. Set **Site URL** to the same confirmed application origin used in NEXT_PUBLIC_SITE_URL.
2. Add these exact **Redirect URLs**, replacing `<APP_ORIGIN>` with that origin:
   - `<APP_ORIGIN>/en/auth/callback`
   - `<APP_ORIGIN>/tr/auth/callback`
   - `<APP_ORIGIN>/id/auth/callback`
   - `<APP_ORIGIN>/en/auth/callback?flow=recovery`
   - `<APP_ORIGIN>/tr/auth/callback?flow=recovery`
   - `<APP_ORIGIN>/id/auth/callback?flow=recovery`
3. Enable email confirmations for the Email provider in Authentication, configure the permitted sender/SMTP and verify delivery with a controlled recipient. Keep hosted allowlists exact, not wildcarded. Local CLI wildcard settings are not a production configuration.

The application uses PKCE code exchange, so confirmation/reset links should be opened in the originating browser. Confirmation, recovery, expired links, logout and session persistence need live tests after setup. No delivered-email test has passed remotely. Local loopback origins may be used explicitly for internal tests; they are not stable public previews or a production URL.

### Latest availability update
All three API bindings have reached the running task. The remaining connection blocker is a proxy tunnel HTTP 403, not proven invalid keys. A project-host-only allowlist addition is saved for publication. Application startup and redacted diagnostics use Node 24 `--use-env-proxy`; TLS stays verified. No remote member/Auth/storage result is claimed. Migration access and a confirmed public application origin remain separate prerequisites.


### Published network retry
The project-host network rule has been published and verified to match the configured API hostname. Runtime requests still receive proxy tunnel HTTP 403; no real Auth/member/storage flow has been verified. A reconnect/fresh-task check is needed to diagnose runtime policy activation. SQL migration access and the confirmed application origin are still missing.

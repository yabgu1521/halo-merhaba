# Configuration and deployment

## Dedicated project

1. Create/select a Supabase project belonging exclusively to Halo Merhaba. Never automatically copy TurkIndo's variables. Review `supabase/migrations/202610160001_halo_leads.sql`; apply once via Supabase SQL editor or migration CLI targeting that dedicated project. Never reset a database. This implementation has not applied it remotely.
2. Create the real admin in Supabase Authentication using a controlled email/invitation and complete normal email/password setup. Public admin signup is absent. In trusted SQL editor, insert that user's actual UUID into `public.halo_admin_profiles(user_id,is_active)` with true. No public client may grant this role. Revoke with is_active=false. Use a strong unique password and configure provider protections/MFA according to operational needs.
3. Configure a Next.js server host. Keep private values in its secret environment settings. Deploy this complete app, not the static review adapter.
4. Required backend variables: HALO_SUPABASE_URL, HALO_SUPABASE_PUBLISHABLE_KEY, HALO_SUPABASE_SERVICE_ROLE_KEY, HALO_RATE_LIMIT_SALT (32+ random characters). HALO_SITE_URL must exactly match the HTTPS origin; used for CSRF, metadata and cookies. Service role and salt are server-only. No existing SUPABASE_* or DATABASE_URL is read.
5. Public build-time contact variables: NEXT_PUBLIC_HALO_WHATSAPP (real international digits, optional leading +), NEXT_PUBLIC_HALO_EMAIL. Unknown values stay empty. Instagram is centralized in src/lib/config.ts. Rebuild when public values change.
6. HALO_ALLOW_INDEXING defaults false. NEXT_PUBLIC_HALO_GA_ID is reserved; setting it does not inject a tracker. No analytics requests occur by default.

## Verification

Verify HTTPS, secure HttpOnly SameSite cookies, correct reverse-proxy IP headers and origin, Supabase API reachability, exact migration grants and actual admin assignment. Test from a logged-out/incognito browser that lead lists and notes cannot be read. Submit synthetic inquiries for every service; check dashboard, status changes, notes and refresh persistence. Confirm non-admin rejection, inactive-admin revocation, honeypot, validation, request-size limit and 429 behavior. Test actual WhatsApp delivery with the business phone; opening a link does not mean the message was delivered. Never send identity documents through these forms.

Supabase GoTrue local integration test uses a synthetic admin created and confirmed **only inside disposable local containers**. It does not bypass verification for any real user or remote service.

IP rate limiting trusts only headers from the configured hosting reverse proxy. The host must overwrite client-supplied X-Forwarded-For / CF-Connecting-IP; remove unsupported headers at the edge. Intake uses atomic database throttling (8/hour/hash). Admin login additionally has per-process throttling; distributed host abuse protections and Supabase Auth limits remain important. Raw IPs are not saved; salted hashes expire from active throttle records as updated. Define an operational deletion schedule for old leads and throttle entries.

## Search Console

Confirm final domain and canonical origin. Review legal and editorial drafts, then rebuild with HALO_ALLOW_INDEXING=true. Add a Search Console Domain property and use its actual DNS TXT token, or a URL-prefix property with the real supplied verification method. No token is invented here. Submit /sitemap.xml and inspect /id and /tr URLs, language alternatives, canonical and rendered metadata. Admin and API remain excluded. Owner-private review is deliberately not a public SEO launch.

No paid hosting, Supabase plan, domain, external analytics or SaaS subscription has been purchased. Free-tier availability and terms are the business owner's responsibility.

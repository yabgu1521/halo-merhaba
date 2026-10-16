# Security and privacy

The member implementation must not launch to real users until its database/RLS and delivered-email integration tests have run against a working Supabase environment. These tests are currently blocked; passing build/unit/public-screen tests does not establish backend security. See SECURITY_THREAT_MODEL.md, docs/PROGRESS.md and docs/MEMBER_SYSTEM.md.

Implemented controls include managed Auth, verified-session server checks, adult affirmation and DOB validation, origin-protected mutations, input/body limits, identity-bound database functions, explicit privileges/RLS, private DOB, limited member projections, transaction-serialized matching/blocks, confidential reports, private photo storage and bounded decode/re-encode of image uploads. There is no member file exchange, billing or private marriage-document intake. Text messaging is implemented; hosted authorization verification remains blocked.

Never commit secrets. NEXT_PUBLIC variables are browser-visible; the Supabase service key is server-only and is never a browser membership authority. User-editable metadata grants no administrative rights. Do not log passwords, tokens, messages, document contents or signed URLs. Configure a private security contact, incident response process, trusted-ingress abuse limits, provider native Auth controls, email deliverability, backups and a reviewed CSP before public launch. Database constraints do not replace human moderation.

Legal, privacy, terms, cookies and community content remain placeholders requiring qualified review. No legal approval or jurisdictional compliance is implied. Account-deletion/export operations and retention procedures still require a later implementation. Email confirmation is a specific verification label, never proof of identity or intentions.

Never send money to an independently unverified contact or share banking credentials/passwords. Be cautious about urgent money requests, use video communication before major commitments, meet safely and report suspicious behavior.

## Remote integration review result
This follow-up found no active Supabase API bindings in the task process, so it made no remote requests or database changes. Remote authorization, storage and Auth remain unverified. Static migration review corrected schema-wide permission changes to named app objects and removed unrelated default-privilege changes. Regression tests guard this scope; they do not prove live RLS. The service-role API key must never be substituted for a database password. Use secure runtime bindings and verified migration history; no production reset or arbitrary-SQL web endpoint is authorized or implemented.

All `.env*` paths remain ignored except the credential-free `.env.example`. A dedicated diagnostic redacts all values and provider bodies and refuses redirects when sending API credentials. No new product capabilities were added.

### Published runtime update
All three API bindings are now present, but the proxy denies the project destination with tunnel HTTP 403. This does not establish invalid credentials. The saved allowlist draft is limited to the configured API hostname and preserves other rules/presets. Proxy support is enabled in Node startup/diagnostics; no verification or authorization controls were weakened. SQL access, public-origin configuration and all real remote verification remain pending.


### Published network retry
Latest connectivity retry after publication still receives proxy tunnel HTTP 403 for both API access checks. The persisted allowlist matches the configured endpoint. This is a transport denial before provider authentication, not evidence that keys are invalid. No additional access broadening or credential changes were performed.

## Functional messaging / actual verification
Matched-only messaging and private favorites/preferences now have server validation plus database privileges/RLS, bounded queries and per-user limits. Blocking and sending serialize on the same pair lock. Old conversation access is revoked when its match is removed; rematching cannot expose prior history. Retry IDs cannot be reused for different message content/conversations. There are no member attachments, voice/video or payments.

Five hosted Auth checks passed with two temporary TEST identities; signup/recovery tokens were admin-issued and no email delivery was tested. Twelve isolated PostgreSQL tests verified migration behavior, owner/stranger privileges, message privacy, block/send races, idempotency and suspension. These are not hosted RLS/storage results. The full hosted member journey failed on missing schema, and its corrected guard now exits before fixture creation. A regression covers SDK HEAD-404 normalization. Account cleanup was verified; the production UI has no demo-data fallback.

Hosted migrations/RLS/storage, inbox delivery/callbacks, authenticated responsive/cookie tests, moderation response, deletion/export procedures and legal/retention review remain launch gates. Correct secure SQL execution configuration and supply a confirmed application origin first. See docs/FUNCTIONAL_MVP.md.

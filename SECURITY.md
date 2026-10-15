# Security and privacy

The member implementation must not launch to real users until its database/RLS and delivered-email integration tests have run against a working Supabase environment. These tests are currently blocked; passing build/unit/public-screen tests does not establish backend security. See SECURITY_THREAT_MODEL.md, docs/PROGRESS.md and docs/MEMBER_SYSTEM.md.

Implemented controls include managed Auth, verified-session server checks, adult affirmation and DOB validation, origin-protected mutations, input/body limits, identity-bound database functions, explicit privileges/RLS, private DOB, limited member projections, transaction-serialized matching/blocks, confidential reports, private photo storage and bounded decode/re-encode of image uploads. There is no member file exchange, messaging, billing or private marriage-document intake.

Never commit secrets. NEXT_PUBLIC variables are browser-visible; the Supabase service key is server-only and is never a browser membership authority. User-editable metadata grants no administrative rights. Do not log passwords, tokens, messages, document contents or signed URLs. Configure a private security contact, incident response process, trusted-ingress abuse limits, provider native Auth controls, email deliverability, backups and a reviewed CSP before public launch. Database constraints do not replace human moderation.

Legal, privacy, terms, cookies and community content remain placeholders requiring qualified review. No legal approval or jurisdictional compliance is implied. Account-deletion/export operations and retention procedures still require a later implementation. Email confirmation is a specific verification label, never proof of identity or intentions.

Never send money to an independently unverified contact or share banking credentials/passwords. Be cautious about urgent money requests, use video communication before major commitments, meet safely and report suspicious behavior.

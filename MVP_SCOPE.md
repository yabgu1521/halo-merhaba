# MVP scope and delivery gates

## Required release scope
Localized public pages and editable content; verified-email adult onboarding; structured profiles and privacy controls; paginated discovery; mutual likes; matches; authorized text-only conversations; blocks/reports; staff moderation and audit; private Marriage Journeys and versioned professional checklists; configurable services, quote acceptance and booking requests; private scanned service documents; notifications; server-authoritative membership entitlements; protected administration.

## Deliberately postponed
Native apps, calls, AI, biometric verification, government-ID collection, member attachments, social feeds, events, referrals, additional markets, automated legal determinations, live billing without approved provider.

## Acceptance gates
No member or document launch until database policy tests pass against real PostgreSQL/Supabase, verification email and reset flows pass, abuse controls are tested, and legal/operations review is complete. Payments remain unavailable until signed provider events and reconciliation are tested. No seeded shared credentials in production.

## Delivery sequence
1. Planning and runnable localized foundation.
2. Migrations, auth integration and tested authorization boundaries.
3. Complete public marketing and content management.
4. Authentication, age enforcement and guided onboarding.
5. Profiles, search, likes and atomic matches.
6. Messaging, block/report and moderation.
7. Marriage Center and configurable journeys.
8. Translation, private uploads, quotes and booking requests.
9. Membership entitlements and payment-provider interface.
10. Staff/admin tools and audited operations.
11. Full critical-flow, responsive, accessibility and deployment checks.

Run relevant tests, application smoke checks and authorization checks for each executable phase. Record results and commit separately. A schema design is not evidence of implemented authorization.

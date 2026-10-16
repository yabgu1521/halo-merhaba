# TurkIndo product experience — review candidate

This candidate evolves the existing member application. No production push, Vercel/DNS change, hosted migration, payment processing, or Supabase configuration change is part of this delivery.

## Review evidence

Run `node tests/review/render.mjs` from the repository root. It copies the current application into a temporary directory, builds that copy, starts a loopback-only fixture API, renders actual routes in Chromium, captures screenshots and removes its temporary app. It does not create an application demo mode or route. The fixture identities, messages and illustrated portraits never enter hosted discovery. No real credentials are written into the copied app. Screenshot data is visual-only evidence, not authentication, RLS, or hosted Storage proof.

Current review output: `/workspace/review/turkindo-product/REVIEW.md` and 16 PNG files. Includes public desktop/mobile, discovery desktop/mobile, card, filters, compatibility, profile desktop/mobile, messaging, Marriage Center, Premium, signup, onboarding and secondary mobile navigation. Automated checks cover page rendering, zero browser runtime errors, visible real route components, starter-to-draft interaction, discovery tabs, and overflow at 375/390/768/1440 widths as applicable. Fixed navigation in full-page mobile captures appears at the initial viewport boundary; it remains fixed to the viewport during normal scrolling.

## Implemented

- New localized homepage positioning, strong signup/signin links, explicit purpose and compatibility story; no public fake member catalogue.
- Cohesive editorial member shell with desktop rail, four-item mobile bottom navigation and secondary destinations. Mobile filters collapse initially and can be expanded.
- Prominent protected member photos; contextual cards; story-oriented profiles; shared selection explanations. Existing interest, favorites, match, messaging, block and report contracts retained.
- For You ordering counts shared purposes/interests and defensible language signals; New Members orders onboarding completion time. Deterministic keyset cursor, 13 rows maximum per request. No activity model, activity claims, percentages or paid boosts.
- Compatibility explanations use selected purposes, interests, spoken languages and complementary language learning only. An absence of overlap produces neutral copy, never an inferred incompatibility judgment.
- Localized deterministic conversation starters shown only after authorized thread access succeeds. Selecting a starter fills an editable draft and never sends it.
- Optional cultural context: nationality/citizenship, relocation openness, destination countries, future country, education, profession and children preference. Existing current country/city stay in the core profile. Optional form is separate, after onboarding completion or in profile editing; none of these fields gates registration or completeness.
- Dedicated member Marriage Center with educational stages and future service categories. No legal determinations, intake, appointment booking or transaction is implied.
- Dedicated Premium presentation: existing core functionality remains free; proposed benefits are explicitly unavailable. No checkout, fabricated subscription or entitlement is introduced.

## Additive migration (not applied remotely)

`supabase/migrations/202610160002_product_experience.sql` adds `profile_context`, normalized `profile_destinations`, indexes, owner-only RLS and identity-bound mutation RPC; safe shared-context projection; and new discovery RPC. It does not rewrite old migrations or touch existing Auth, message, photo-storage or report policies. Countries remain catalog foreign keys, not enum country pairs.

All optional context is private by default. One explicit sharing choice applies to the optional section. Even when shared, it is available only to a permitted member under existing visibility/block/suspension rules. No raw account ID is projected. These details do not influence the initial compatibility explanations.

When this migration is absent, existing member functionality remains available: discovery uses the existing search RPC and discloses that new ordering awaits setup; optional profile editing is unavailable. Other errors are not silently converted into fabricated members. After design approval, review/apply the additive migration through the established safe SQL workflow, verify it against the hosted project, then approve deployment separately.

## Validation

- Production build and standalone TypeScript: passed.
- Unit suite: 15 passed.
- Actual isolated PostgreSQL/RLS suite: 14 passed, including all previous policy/concurrency tests plus optional context ownership, sharing/revocation, hidden/blocked/anonymous denial and actual discovery ranking/keyset tests. Auth/Storage contracts in this suite are local contracts, not hosted services.
- Public/unauthenticated Chromium suite: 6 passed, including all three languages and mobile/tablet/desktop public checks.
- Hosted Auth suite: 5 passed with temporary TEST accounts; admin-issued signup/recovery tokens, not delivered mail.
- Hosted member suite: 6 passed against real Supabase: profile/photo/onboarding/search/preferences/favorites/mutual matching/messaging/unread-read/private Storage/privacy/report/block and negative authorization. All task-owned TEST identities/profiles/photos were cleaned up; cleanup was verified. New hosted schema features are NOT verified until the new migration is applied.
- Dedicated local-Supabase integration command: attempted, blocked at its two local-only file preflights because no disposable full local Supabase stack is configured. Zero flow tests executed there. Guards retained; no hosted URL was substituted.
- Isolated visual review: 16 rendered captures, no browser runtime errors. Fixtures are not backend proof.

## Remaining limitations and release gates

- New migration pending hosted execution and hosted authorization/filter verification.
- Actual signup/reset inbox delivery, canonical production origin/callback configuration and commercial launch legal/moderation checks remain separate gates.
- No recently-active tab; no activity collection added.
- No automated Marriage Journey/checklist, staff-managed service catalog, quotation, booking, CMS, billing, paid entitlements or subscription lifecycle. The new product areas explain their intended direction honestly.
- Optional details have section-level sharing, not field-by-field sharing or multiple citizenships. New countries/languages can be added to catalogs; adding new UI locales still requires translations.
- Visual approval and a separately authorized production push are required. Existing production stays at the previously deployed commit.

## File map

- Public design: `src/app/[locale]/page.tsx`, `src/app/globals.css`, `src/lib/product-copy.ts`.
- Member shell/screens: `src/app/[locale]/app/{layout,discover,favorites,matches,members,messages,profile,onboarding,more,marriage,premium}` and `member.css`.
- Components: `member-card`, `insights`, `context-form`, `discovery-filters`, `nav-link`, `profile-form`, `thread`, `product-area`.
- Domain/contracts: `src/lib/member/{insights,viewer,validation,own-profile}.ts`, `src/app/api/member/route.ts`.
- Migration and tests: new migration above, `tests/postgres/member.test.ts`, `tests/unit/insights.test.ts`, `tests/remote/member.test.mjs`, `tests/review/render.mjs`.

# Member-first matchmaking candidate — migration-first release

## Release gate

This implementation depends on **`supabase/migrations/202610160003_matchmaking_preferences.sql`**. It has not been applied to hosted Supabase. Do not push the dependent candidate application until the owner has reviewed and manually applied this migration and reported its result. Do not replay or modify the four previously applied migrations. Production GitHub main remains at `485bcd6cd259e5df0e25213875cda8fe23f4be47` until this gate is satisfied.

The migration is additive: four normalized preference tables, catalog foreign keys, indexes, owner-only RLS, bounded identity-bound RPCs, and an `advanced` JSONB column on the existing owner-only saved-search table. No Auth, storage, likes, match, conversation, message, block, report, or cultural-context policy is replaced. Older production code remains compatible while the new schema is installed first.

## Product behavior

- Public positioning explicitly leads with serious relationship/marriage candidates. Existing founder facts are retained; production-facing draft/placeholder language is removed. This does not constitute professional approval of legal policies.
- Discovery displays real database candidates. For You, New Members, Discover and Search are distinct modes. Every mode respects the current user's explicit saved matchmaking preferences. No gender/preference is inferred from a name/photo. No fake members, online indicators, counts, scores, scarcity or testimonials.
- Matchmaking preferences include desired genders, ages, countries, intention, spoken languages, relocation expectation and a looking-for introduction. Preferences are private by default. Optional sharing discloses the summary **and selected preferences** only to permitted viewers. Users can reset preferences explicitly; clearing search filters alone never silently discards matchmaking preferences.
- Blank gender/country/language groups mean no restriction, not inferred choices. Multiple selected countries/languages mean any one matching selection. A saved relocation requirement matches only voluntarily shared candidate relocation data. Candidates whose relocation details are unknown/hidden are not assumed to meet that requirement. There is no reciprocal-preference enforcement or claim that another person has already chosen the current user.
- Search offers essential filters and expandable additional filters: gender, ages, country/city, intention, spoken language, interests, nationality, education, profession, relocation, future country, children preference and photo presence. Existing saved search choices are preserved; new choices are stored owner-only. Strict SQL validation accompanies server Zod validation. Optional-life filters never inspect hidden cultural fields, including through result membership or ranking.
- For You ordering counts shared selected intentions/interests/language signals and explicitly shared relocation openness. New Members uses onboarding completion time, not activity. All modes use bounded keyset pagination (13 rows maximum). Countries and languages remain catalog-backed.
- Cards emphasize photos, identity, intention and actions. A maximum of two short contextual lines precede an expandable “Why this candidate?” explanation. Shared compatibility and preference fit are shown separately, without percentages. Shared future-country/relocation claims require both members to share the underlying actual data.
- Detailed profiles prioritize introduction and optionally shared looking-for summary, languages, interests and cultural context, then compatibility. A Message action appears only when a current mutual match exists. Backend message authorization remains authoritative even if a match changes after rendering.
- Favorites remain private bookmarks. Interest activity shows **only outgoing interests** under current visibility/block/suspension rules. Received interests are not newly exposed. Mutual matches unlock the existing communication flow; saved preferences do not revoke established matches.
- Onboarding retains core age/profile/photo/safety requirements. Its completion screen offers matchmaking preferences before entering discovery. Those preferences can also be edited separately or in profile settings. Core profile completion still measures the seven existing meaningful groups; matchmaking setup has an explicit separate prompt, not a fabricated score or forced sensitive-field requirement.
- Empty states offer search reset, preference editing, profile improvement and manual sharing of the public homepage. No automated referral program or future-member notification is implied.
- Four primary mobile navigation destinations remain; search/preferences/interest activity are accessible through discovery shortcuts and the secondary menu. Marriage Center/Premium remain secondary informational areas. No payment, boost, identity verification or professional order workflow was added.

## Verification and limits

The approved disposable local-Supabase suite is not required for this release candidate. Do not weaken its local-only guard or run it against production. Do not create synthetic production members for this task.

The PostgreSQL suite applies actual migrations in an isolated database with authenticated non-superuser roles, and includes previous connection/messaging/security regressions plus preference ownership/forgery, catalog/enum/age validation, all-mode preference filtering, private-field filter-oracle prevention, summary opt-in/revocation, pagination, outgoing-interest confidentiality and blocking.

The new candidate browser suite builds an isolated copy of actual Next.js source against a loopback-only Supabase SDK contract fixture. It tests actual forms/API-route wiring, saved/reset preference controls, search persistence/empty states, truthful email-only signals, message-action gating and localized phone/tablet/desktop layouts. It creates no review page, screenshots, public demo route or production fixture. It is UI/contract evidence, **not hosted Auth/RLS/Storage proof**. PostgreSQL security evidence is separate.

New hosted preference/search behavior is unverified until the new migration is manually applied. Actual inbox delivery, complete legal policies, a real moderation response process and hosted post-migration checks remain separate launch responsibilities. Existing email verification does not verify identity or intentions. Only one profile photo is supported; no second-photo prompt suggests otherwise. Incoming-like visibility, real subscriptions, professional orders/booking, full staff tooling and CMS remain unimplemented.

## Routes (each prefix supports en/tr/id)

- Registration: `/{locale}/auth/signup`
- Sign-in: `/{locale}/auth/login`
- Onboarding: `/{locale}/app/onboarding`
- Own profile: `/{locale}/app/profile`
- Who I want to meet: `/{locale}/app/preferences`
- Discovery: `/{locale}/app/discover`
- Modes: `/{locale}/app/discover?view=for-you|new|discover|search`
- Search shortcut: `/{locale}/app/search` (redirects to search mode)
- Candidate detail: `/{locale}/app/members/{public_id}`
- Favorites: `/{locale}/app/favorites`
- Outgoing interest: `/{locale}/app/likes`
- Mutual matches: `/{locale}/app/matches`
- Conversations: `/{locale}/app/messages`
- Thread: `/{locale}/app/messages/{conversation_id}`

## Validation results

Production build and TypeScript passed. Unit tests: 20 passed. Actual isolated PostgreSQL/RLS: 19 passed. Public browser tests: 6 passed. Candidate browser tests: 3 passed. No hosted preference test or production deployment is claimed by these local results. See `docs/PROGRESS.md` for the test interaction correction and exact scope.

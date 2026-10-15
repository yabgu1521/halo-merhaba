# Database architecture proposal

Status: design only; executable migrations and RLS are phase 2.

Use UUID primary keys, timestamptz UTC timestamps, foreign keys and explicit deletion behavior. Supabase auth.users owns credentials. Public discovery reads a restricted server projection, never raw account data.

| Domain | Tables and invariants |
| --- | --- |
| Identity | accounts (auth user FK, status), account_roles (privileged writes only), profiles (one/account; private DOB; city only), profile_privacy, profile_photos (private object key, moderation status) |
| Taxonomies | languages, interests, purposes; user_languages (proficiency/learning), user_interests, user_purposes with unique composite keys |
| Connections | likes unique(sender, recipient), reject self; matches unique(canonical user pair); conversations one/match; conversation_members unique(conversation,user) |
| Communication | messages (conversation, sender, body, created_at); conversation_members.last_read_message_id for read state; no member attachments |
| Safety | blocks unique(actor,target), reports with constrained profile/message/user target, verification_requests (state/reviewer, no government ID), admin_actions append-only |
| Membership | plans, plan_prices (currency, interval, amount, active), plan_benefits, subscriptions (provider refs/state), payments, refunds, webhook_events unique(provider,event_id) |
| Services | services (localized descriptions, price type, active), service_orders (customer, assigned staff, state), quotations (versioned amount/currency/expiry), translation_requests, documents (owner/order/storage key/scan state), bookings (resource/time constraints) |
| Marriage | marriage_journeys (owner, destination, citizenship pair), marriage_checklists (published versions), marriage_checklist_items (authority/reference/updated_at/translation/legalization), journey_items (per-journey status/notes referencing versioned item) |
| Publishing | content_pages, content_translations, articles, announcements, success_stories (explicit consent + withdrawal), notifications |
| Privacy | deletion_requests, consent_records, relationship_progress (private by default) |

## Access model
Enable RLS on all application tables; deny by default. Owner-only accounts, orders, journeys, notifications and settings. Messages require active conversation membership and no blocking/suspension. Documents require owner or assigned authorized staff/admin and clean scan state. Public pages expose only published localized versions. Role changes and audit insertion use privileged server transactions. Never trust JWT user-editable metadata for staff roles. Service keys stay server-only.

## Indexes and concurrency
Index every FK used for joins; profiles(country,city), user_purposes(purpose_id,user_id), user_languages(language_id,user_id), messages(conversation_id,created_at,id), reports(status,created_at), orders(customer_id,created_at), notifications(user_id,read_at). Use canonical pair uniqueness and transactions for matches, unique provider events for payment idempotency, resource/time exclusion constraints for confirmed bookings. No broad client reads or unbounded lists.

## Migration policy
Versioned SQL under supabase/migrations, policy tests under tests/database. Migration forward/rollback strategy must be tested before production. Separate development seed; refuse production execution. Do not fabricate a migration completion claim from this design.

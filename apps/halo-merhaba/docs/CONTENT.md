# Content and business handover

## Central sources

src/lib/config.ts: brand, Instagram, contact environment bindings, future business address/team/testimonial structures, disabled analytics.
src/lib/i18n.ts: enabled locales and future English architecture.
src/content/site-copy.ts: localized labels, FAQs, service-process/limits, legal drafts.
src/content/services.ts: service descriptions and categories.
src/content/guides.ts: five editorial guides, internal official-source-review flags and funnel links.
src/content/launch-catalog.json: copied business source-of-truth. The marriage checklist, document/apostille organizer, A1 survival pack, family meeting toolkit, marriage preparation workbook, translation preparation kit, Türkiye Life Starter, Turkish for Couples and Consultation Prep Workbook have content_ready=true and deliverable_available=true based on the owner’s confirmation of two private PDF editions per product. All nine products have completed content; purchases and downloads remain unavailable. All sale/download flags remain false; content/file existence is not an entitlement. Private object identifiers live only in src/lib/server/product-assets.ts, never the public catalog. src/content/catalog.ts maps localized display. Marriage guide planned launch price: Rp149.000 in Indonesian; Turkish pricing is to be announced, without conversion. All nine digital products use explicit IDR planned prices: 149000, 129000, 129000, 119000, 199000, 149000, 149000, 149000, 99000 in catalog order. Turkish digital-product prices are to be announced without conversion; the 250 TRY service pre-check remains provisional. None is a payable offer.

## Required from Halo Merhaba

Real WhatsApp and email; legal/trading identity and jurisdiction; business address if appropriate; real team names, roles, credentials that can be substantiated, photo permissions and photographs; approved service scope, confirmed prices and turnaround policies; actual course teachers, levels, format, dates, capacity and fees; consented genuine testimonials; retention/deletion and data-subject contact policies; official-source review of legal/document guidance. Unknown team/testimonials are omitted or clearly marked as a real-photo placeholder; no invented results, ratings, numbers or affiliations.

## Editorial policy

Marriage/document guides cover preparation questions, not invented current legal requirements. Relevant institution requirements must be checked before relying on any checklist. Draft status is explicit in content records. Add authoritative source links and reviewed date when a qualified editor verifies them. No automatic CMS is introduced for five static guides. Add future articles through the typed content collection and sitemap routes.

Categories cover marriage, documents/apostille, Türkiye life, language and cross-cultural topics. English can be enabled after complete review and translations, not by exposing Indonesian fallback text as English.

## Future additions

Product pages already have stable IDs, descriptions, proposed content and interest forms; future checkout belongs in a separate authorized purchase flow once deliverables exist. Service forms use typed kinds and whitelisted answers; secure upload, booking, customer accounts and payments can be added without replacing the public navigation/content system. None is implemented now.

Analytics emits only local halo:event CustomEvents with non-sensitive category metadata. Connect a consent-aware analytics listener later; no hidden trackers or paid APIs are installed.

## Completed marriage guide presentation

src/content/marriage-product.ts contains owner-supplied bilingual scope (16 pages per edition), four expandable modules covering 16 sections, audience, boundaries and trust copy. src/components/marriage-product.tsx renders the product-specific presentation and shared locale-aware price. Previews are illustrative HTML/CSS shapes, not extracted PDF pages. No PDF was fetched or inspected. Existing interest and consultation flows remain unchanged.

## Nine-product catalog

The launch catalog JSON is the single source for explicit categories, localized titles/descriptions, planned inclusion lists and prices. No product remains unfinished; all nine have content_ready=true and deliverable_available=true. The marriage checklist, document/apostille organizer, A1 survival pack, family meeting toolkit, marriage preparation workbook, translation preparation kit, Türkiye Life Starter, Turkish for Couples and Consultation Prep Workbook are completed; every product has sale_enabled=false and download_enabled=false. DigitalCatalog renders the featured first guide, all nine cards, and five category filters plus All. Product detail routes and sitemap entries derive from the collection. Product art uses category-based motifs/tones rather than array positions. Private server asset metadata contains eighteen owner-confirmed objects for the nine completed products.

## Completed document / apostille guide

src/content/document-product.ts contains the owner-supplied public scope: two editions, 19 pages each (38 total), 14 tools and 16 module summaries. src/components/document-product.tsx uses the existing premium styles and document/map motif, closed access notice and existing interest form. Planned price remains Rp129.000 in Indonesian and pending in Turkish. No PDF was accessed; existence is owner-confirmed, not remotely verified. The marriage guide remains the main featured product and its page/content are unchanged.

## Completed A1 survival pack

src/content/a1-product.ts holds the owner-supplied public scope: two PDF editions, 25 pages each (50 total), 26 topic/tool labels and expandable summaries, bilingual learner/partner practice and explicit CEFR/certificate/instruction boundaries. src/components/a1-product.tsx uses the existing premium design with conversation/map motifs. Planned launch price is Rp129.000; Turkish pricing remains pending. The earlier Rp99.000 A1 plan is obsolete. The first two product pages and main marriage feature are unchanged. No PDF was accessed or remotely verified; the new private entries use owner-confirmed uploads.

## Completed family meeting toolkit

src/content/family-product.ts holds the owner-supplied public scope: two PDF editions, 27 pages each (54 total), 25 tools/modules, bilingual family preparation and explicit protocol/legal/counseling/agreement boundaries. src/components/family-product.tsx uses the existing premium styles and linked-circle country motif. Planned launch price is Rp119.000, replacing the earlier Rp79.000 for this product only; Turkish pricing remains pending. The first three completed product records and dedicated pages remain unchanged. No PDF was accessed or remotely verified; private entries record owner-confirmed uploads.

## Completed marriage preparation workbook

src/content/workbook-product.ts contains the owner-supplied public scope: two PDF editions, 32 pages each / 64 total, 32 themes/modules, bilingual response comparison, planning boundaries and autonomy principles. src/components/workbook-product.tsx presents these with existing editorial styles plus workbook-scoped HTML decision/worksheet illustrations. No responses are collected by previews. The comparison section distinguishes shared-life planning from the marriage checklist’s document/institution workflow and links to its unchanged page. Planned Indonesian price is Rp199.000, replacing Rp179.000 for this product only; Turkish price remains pending. Private v2 filenames live only in the server-only registry; no PDF was accessed. The first four completed records/pages remain unchanged.

## Completed translation / document preparation kit

src/content/translation-product.ts contains the owner-supplied public scope: two PDF editions, 31 pages each / 62 total, 22 included tools and 31 module summaries, bilingual workflow support, operational terminology/handoff illustrations and clear certification/legal/notary/apostille/acceptance boundaries. src/components/translation-product.tsx reuses the existing premium styles; no changes to prior product components or shared CSS are needed. The comparison distinguishes translation QA/handoff/delivery from apostille routes/costs/verification. Turkish title is Çeviri & Belge Hazırlık Kiti. Planned Indonesian price is Rp149.000, replacing Rp99.000 only for this product; Turkish price remains pending. The first five completed records/pages are unchanged. Private filenames remain server-only; no PDF was accessed.

## Completed Türkiye Life Starter

src/content/life-product.ts holds the owner-supplied public scope: first-30-days daily-life setup, two PDF editions of 32 pages (64 total), 26 tools, 32 module summaries, bilingual family support, official/provider-confirmation boundaries and independent access to personal essentials. src/components/life-product.tsx reuses the premium editorial/worksheet styles with a guidance motif and small abstract neighborhood route. The comparison distinguishes settlement routines/organization from the A1 pack’s language practice. Titles now use the first-30-days positioning. Planned Indonesian price is Rp149.000, replacing Rp119.000 only for this product; Turkish price remains pending. First six completed records/pages are unchanged. Private filenames remain server-only; no PDF was accessed. The two unfinished products are turkish-for-couples and consultation-prep-workbook.

## Completed Turkish for Couples

src/content/couples-product.ts holds owner-supplied public scope: two editions, 34 pages each / 68 total, 34 concise module summaries and 31 included themes/tools, bilingual practice and relationship-language positioning. src/components/couples-product.tsx reuses existing premium speech/map and worksheet styling. Its A1 comparison separates general beginner language from affection, requests, boundaries, misunderstandings, difficult conversations and couple planning. Illustrative phrase/flow tables have no inputs and reveal no paid phrases. Boundaries exclude therapy, psychological treatment, professional counseling substitution, official language course, CEFR certification and relationship guarantees. Safety copy rejects threats, violence, coercion, surveillance, isolation and financial control; consent/boundaries and suitable professional/emergency support remain explicit. Price is Rp149.000, replacing Rp129.000 only for this product; Turkish price remains pending. First seven records/pages remain unchanged. No PDF was accessed.

## Completed Consultation Prep Workbook

src/content/consultation-product.ts holds owner-supplied public scope: two editions, 30 pages each / 60 total, 30 module summaries and 27 tools, bilingual case preparation, privacy and professional/official-outcome boundaries. src/components/consultation-product.tsx compares the case-preparation purpose against all eight topic-specific products using live catalog titles and links. It covers facts, timeline, missing context/documents, previous communications, priorities, decisions and follow-up. The value copy makes no promise of shorter/cheaper/successful outcomes. HTML case/timeline/priority illustrations collect no data. Passwords, PINs, full banking credentials and unnecessary secrets should be omitted; sensitive documents should be shared only when necessary. Planned price is Rp99.000, replacing Rp59.000 only for this product; Turkish pricing remains pending. First eight completed records/pages remain unchanged. No PDF was accessed.

# Security boundaries

Only Halo-specific tables/functions are defined. Tables: halo_admin_profiles, halo_leads, halo_lead_notes, halo_product_interest, halo_intake_limits. All enable RLS. No storage bucket, document upload, customer account, order or payment data exists.

Anonymous users cannot read or write tables or call the submit RPC directly. Public inquiry POST runs strict allowlisted validation, consent, honeypot, exact-origin CSRF, 12KB streamed-body bound and server-only service-role RPC. The RPC uses an atomic per-hashed-IP throttle and creates lead/product-interest rows in one transaction. This prevents open anonymous table access and a raw REST bypass of validation. Database functions use explicit search_path and scoped grants.

Authenticated non-admins see no lead/note/product-interest rows. Admin status is explicit, active and checked against auth.uid(). Admins may read scoped data. Status changes and append-only notes use a checked RPC rather than direct UPDATE; note authors are bound to the authenticated caller. Role grants and private fields cannot be changed by browser clients. Admin counts also require the active role. Internal notes never appear in public API responses.

Server sessions use authenticated user verification, HttpOnly SameSite=Lax cookies and Secure on HTTPS. Admin API responses are private/no-store. Role deactivation is checked on requests. Login does not create accounts. Public forms never claim receipt unless a UUID is returned after a successful database transaction. A failed database write produces an honest message handoff instead.

Do not collect passport/ID/residence documents or attach files. Users can still type inappropriate material into free text: operational review and deletion procedures are required. Privacy/terms are drafts awaiting legal identity, contact, lawful processing basis and retention policy. Configure host logging to avoid retaining inquiry payloads or credentials. Service role is a privileged server binding: never expose it to client code, analytics, source control or screenshots.

Local RLS and Auth/PostgREST integration verification are useful evidence, but do not replace testing the final hosted Supabase project, its project-wide roles, proxy configuration and actual administrator setup.

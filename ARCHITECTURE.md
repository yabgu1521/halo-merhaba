# Architecture

Next.js App Router + TypeScript with server-rendered public pages, Tailwind CSS and locale routes (/en, /tr, /id). Central brand configuration and typed translation dictionaries keep components independent of brand copy. English is the initial fallback. Human review of translations precedes launch.

Planned backend: Supabase Auth, PostgreSQL RLS and private Storage. Keep business services separate from route handlers and provider adapters. Providers for payments, email, scheduling and scanning must be replaceable. Validate inputs at server boundaries. No service-role credential reaches the browser.

Current implementation: localized public foundation and smoke tests only. Authentication, database, moderation, payments and uploads are not yet implemented. No fake signed-in state or payment success.

Content will be versioned and editable in the database with a publish/review workflow and locale fallback. Marriage requirements are staff-edited content, never permanently embedded legal logic.

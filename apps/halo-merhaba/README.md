# Halo Merhaba

Standalone Indonesian ↔ Turkish service website. Primary language Indonesian, secondary Turkish; English content architecture reserved but not publicly enabled. This folder is independent of TurkIndo Connect. No existing product database, authentication, migrations or member functionality is reused.

## Run

Node 24, npm. In a fresh checkout: `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`. Defaults: http://localhost:3000/id. Production server: `npm run build` then `npm start`. Set HALO_SITE_URL to the exact public HTTPS origin. Rebuild after changing NEXT_PUBLIC_* values. This execution workspace uses a shared node_modules symlink to avoid modifying the original app's dependency installation; a standalone checkout installs its own dependencies.

`npm run lint` checks custom source/security conventions (not ESLint). `npm run typecheck`, `npm test`, `npm run build`. With a production server at :3300 and Chromium: `npm run test:browser`. Override HALO_TEST_ORIGIN / CHROMIUM_PATH as needed. `python3 scripts/test-rls.py` requires Docker; `node scripts/test-local-stack.mjs` requires Docker and Chromium. Both create and remove only their own temporary local resources. They do not connect to any remote database or reuse DATABASE_URL.

## Deployment distinction

The published Sites review is a **static public-page review**, kept owner-private. It has no API server, database connection or functioning admin login. Forms produce a structured copyable message and explicitly say that no request was saved or sent; with no configured real WhatsApp number, no WhatsApp delivery link exists. Product interest is also unsent until real configuration exists. There are no fake successful submissions.

The full source in this folder includes real Next.js API handlers, Supabase Auth administration and persistent intake. Run on a Next.js server host (for example an eligible free Vercel plan) with a **dedicated Halo Merhaba Supabase project** to activate these. Static hosting alone cannot provide this backend. No remote migration has been applied and no public production-readiness claim is made.

See docs/DEPLOYMENT.md, docs/SECURITY.md, docs/CONTENT.md and docs/FILES.md.

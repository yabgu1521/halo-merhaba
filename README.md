# TurkIndo Connect

A trust-centered Türkiye–Indonesia connection and professional marriage-support platform.

**Status:** phase 1 planning and phase 3 public-page foundation. Member features are planned, not operational. No real member data, document intake or billing is enabled.

## Develop
Requires Node.js 24 and npm. Copy .env.example to .env.local if configuring a canonical URL. Run `npm ci`, `npm run dev`, and open the local server. Locale routes: `/en`, `/tr`, `/id`. Run `npm run typecheck`, `npm test`, and `npm run build` before committing. Use `npm start` for the production build.

Brand configuration lives in src/lib/brand.ts; UI copy lives in src/lib/i18n.ts. No API keys are required for the current public foundation. See PRODUCT_PLAN.md, MVP_SCOPE.md, USER_FLOWS.md, DATABASE_SCHEMA.md, SECURITY_THREAT_MODEL.md, ARCHITECTURE.md, DATABASE.md, SECURITY.md and DEPLOYMENT.md.

## Verified progress
Planning documents and localized responsive landing foundation created. Automated and runtime results are recorded in docs/PROGRESS.md. Follow later release gates before collecting personal data.

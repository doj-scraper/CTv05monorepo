# Project Context

- **Owner:** Copilot
- **Project:** Modern refactor of an ecommerce platform for a wholesale distributor of cellphone repair parts, using Smart SKU and a relational database. The codebase is currently a monorepo and will eventually split into separate frontend and backend repositories.
- **Stack:** Strict TypeScript, Next.js, Tailwind CSS, TanStack Query, Zustand, Prisma, Zod, Clerk or NextAuth 5, Stripe, Neon/PostgreSQL, tRPC, Resend, S3, GitHub Actions, Vercel, Vitest, React Testing Library, Playwright or Jest, PostgreSQL full-text search, Turbopack.
- **Created:** 2026-03-24T13:05:26Z

## Learnings

- Backend work needs stable REST contracts and careful auth/payment boundaries.
- All `.squad/` paths resolve from the team root provided by the Coordinator.
- The shared decision log stays append-only and is merged through Scribe.
- Factory pattern for Express app enables testability and multiple instances.
- Conditional initialization of optional clients (Redis, Stripe) improves local dev experience.
- Neon serverless adapter auto-detection allows seamless environment switching.
- Global error handler with domain mapping keeps business logic clean of HTTP concerns.
- Structured logging with Pino provides queryable production logs while keeping dev readable.
- Environment validation with Zod catches config errors at startup, not runtime.
- Creating route/service stubs early prevents merge conflicts when parallel work streams converge.
- **Phase 1 decision context (from Yen):** Schema uses 4-level hierarchy (Brand → ModelType → Generation → Variant). Specifications normalized into queryable table (not JSONB). Smart SKU preserves nullable variantId for cross-compatible parts. IDs use cuid() for auth models (NextAuth 5 alignment). Composite key redesigned for CompatibilityMap (old `id` auto-increment dropped, replaced with `@@id([skuId, compatibleVariantId])`).
- **Architecture gate (from Danny):** Phase 2 blocked until Phase 1 completes + `prisma generate` runs. Prisma singleton client types depend on final schema. Corrected sequencing: Yen → prisma generate → Linus (core infra) → stubs → Phase 3 endpoints. 9 identified risks including price formatting (must preserve cents→dollars division), API shape preservation (variant names where model names were), NULL→NOT NULL transitions requiring migration backfills.

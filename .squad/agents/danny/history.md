# Project Context

- **Owner:** Copilot
- **Project:** Modern refactor of an ecommerce platform for a wholesale distributor of cellphone repair parts, using Smart SKU and a relational database. The codebase is currently a monorepo and will eventually split into separate frontend and backend repositories.
- **Stack:** Strict TypeScript, Next.js, Tailwind CSS, TanStack Query, Zustand, Prisma, Zod, Clerk or NextAuth 5, Stripe, Neon/PostgreSQL, tRPC, Resend, S3, GitHub Actions, Vercel, Vitest, React Testing Library, Playwright or Jest, PostgreSQL full-text search, Turbopack.
- **Created:** 2026-03-24T13:05:26Z

## Learnings

- The repo split needs careful sequencing so frontend, backend, data, and deploy work can land independently.
- All `.squad/` paths resolve from the team root provided by the Coordinator.
- The shared decision log stays append-only and is merged through Scribe.
- **Backend reset architecture review (2026-03-24):** The approved 6-phase reset had a hidden critical path—Phase 2 (core infra) depends on Phase 1 (schema) because Prisma client generation requires the final schema. "Parallel" phases were actually serial. Key risks: NULL→NOT NULL migrations need backfill strategy, CompatibilityMap composite key migration must drop auto-increment safely, API backwards compatibility requires explicit price formatting and model naming contracts, Redis needs deployment strategy (defer to post-reset or specify Vercel KV), Vercel config must handle ESM build output. Timeline impact: ~5 days serial execution, not 3 days optimistic parallel. Approved with gates: Yen clarifies migration strategy, Linus blocks until Phase 1 completes, Basher handles ESM Vercel config, Saul adds API contract tests.

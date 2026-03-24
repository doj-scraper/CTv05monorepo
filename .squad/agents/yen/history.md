# Project Context

- **Owner:** Copilot
- **Project:** Modern refactor of an ecommerce platform for a wholesale distributor of cellphone repair parts, using Smart SKU and a relational database. The codebase is currently a monorepo and will eventually split into separate frontend and backend repositories.
- **Stack:** Strict TypeScript, Next.js, Tailwind CSS, TanStack Query, Zustand, Prisma, Zod, Clerk or NextAuth 5, Stripe, Neon/PostgreSQL, tRPC, Resend, S3, GitHub Actions, Vercel, Vitest, React Testing Library, Playwright or Jest, PostgreSQL full-text search, Turbopack.
- **Created:** 2026-03-24T13:05:26Z

## Learnings

- PostgreSQL schema design and full-text search are central to the Smart SKU model.
- All `.squad/` paths resolve from the team root provided by the Coordinator.
- The shared decision log stays append-only and is merged through Scribe.
- **2026-03-24:** Completed schema evolution to 4-level device hierarchy (Brand → ModelType → Generation → Variant). Replaced pipe-delimited specifications with normalized `Specification` table for better queryability. Added `driverAdapters` preview feature for Neon serverless support. Expanded `QualityGrade` enum with `U` and `NA` values. Key file paths: `celltech-backend/prisma/schema.prisma`, `celltech-backend/prisma/seed.ts`. Decision: Normalized specs over JSONB for type safety and query flexibility.

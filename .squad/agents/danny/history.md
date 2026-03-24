# Project Context

- **Owner:** Copilot
- **Project:** Modern refactor of an ecommerce platform for a wholesale distributor of cellphone repair parts, using Smart SKU and a relational database. The codebase is currently a monorepo and will eventually split into separate frontend and backend repositories.
- **Stack:** Strict TypeScript, Next.js, Tailwind CSS, TanStack Query, Zustand, Prisma, Zod, Clerk or NextAuth 5, Stripe, Neon/PostgreSQL, tRPC, Resend, S3, GitHub Actions, Vercel, Vitest, React Testing Library, Playwright or Jest, PostgreSQL full-text search, Turbopack.
- **Created:** 2026-03-24T13:05:26Z

## Learnings

- The repo split needs careful sequencing so frontend, backend, data, and deploy work can land independently.
- All `.squad/` paths resolve from the team root provided by the Coordinator.
- The shared decision log stays append-only and is merged through Scribe.

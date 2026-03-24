# Project Context

- **Owner:** Copilot
- **Project:** Modern refactor of an ecommerce platform for a wholesale distributor of cellphone repair parts, using Smart SKU and a relational database. The codebase is currently a monorepo and will eventually split into separate frontend and backend repositories.
- **Stack:** Strict TypeScript, Next.js, Tailwind CSS, TanStack Query, Zustand, Prisma, Zod, Clerk or NextAuth 5, Stripe, Neon/PostgreSQL, tRPC, Resend, S3, GitHub Actions, Vercel, Vitest, React Testing Library, Playwright or Jest, PostgreSQL full-text search, Turbopack.
- **Created:** 2026-03-24T13:05:26Z

## Learnings

- Deployment to Vercel and GitHub Actions needs to stay green during the refactor.
- All `.squad/` paths resolve from the team root provided by the Coordinator.
- The shared decision log stays append-only and is merged through Scribe.
- **2026-03-24:** Backend reset — deleted 9 legacy files (Replit artifacts, old server/schema/seed), rewrote package.json/tsconfig/vercel.json for ES modules + bundler resolution, created .env.example + README, stubbed src/ and prisma/ directories. Key decisions: ES modules (`"type": "module"`), `moduleResolution: "bundler"`, Neon adapter for Vercel edge, Pino for structured logging, Vitest for testing. Config points to src/index.ts, /api/* routing. Dependencies: Prisma 6.2, Express, JWT, bcryptjs, Stripe, Zod, Redis (ioredis + Upstash). Node 18+ required. Team needs to run `npm install` after code merge.
- **Architecture concerns (from Danny):** Phase 2 is blocked until Phase 1 completes + `prisma generate` runs. Prisma singleton client types don't exist until after schema lands. Phase 1 is critical path blocker. 9 risks identified; top priorities: clarify migration strategy (reset vs backfill), pin Stripe API version, confirm Vercel KV for Redis (or defer Redis to post-reset), verify ESM build config (buildCommand + dist/index.js output). Legacy deletion deferred until Phase 3 validation.

# Squad Decisions

## Active Decisions

### 2025-07-14: Backend Reset Plan — Owner Approved

**By:** Copilot (project owner, via Squad Coordinator)

**What:** Full backend reset of celltech-backend/ approved for implementation. 6-phase plan:
1. Schema & Seed — 4-level device hierarchy, nullable fixes, auth/commerce tables
2. Core Infra — Zod env, Prisma+Neon singleton, Redis, Stripe, Pino, Express app factory
3. Catalog & Inventory — Rebuild 6 GET endpoints with service layer (backwards-compatible)
4. Auth — JWT + bcrypt + Redis token blacklist + rate limiting
5. Commerce — Server-side cart, Stripe checkout, order history
6. Cleanup — Delete legacy, update Vercel config, README, build verification

**File verdicts:** KEEP schema.prisma + seed.ts (evolve). REWRITE server.ts, package.json, tsconfig.json, vercel.json. DELETE server.py, .replit, replit.md, index.html, styles.css, package-lock.json.

**Stack:** TypeScript strict, Express.js, Prisma 6+Neon, Redis/Upstash, JWT+bcrypt, Stripe, Zod, Pino, Vercel.

---

### 2026-03-24: Schema Evolution Decisions — Phase 1

**By:** Yen (Database / Data Specialist)  
**Date:** 2026-03-24  
**Context:** Backend reset implementation — schema migration to 4-level device hierarchy

**Key Design Choices:**

1. **Cascade behavior:** Did not explicitly add `onDelete: Cascade` to relations. Default PostgreSQL behavior sufficient for initial implementation; will revisit if referential integrity issues arise during migration testing.

2. **Index strategy:** Relied on Prisma's automatic indexing (@unique, @id). No explicit performance requirements yet; premature optimization avoided. Will monitor query patterns and add composite indexes if needed.

3. **Specification table design:** Used normalized `Specification` table with `label` and `value` columns instead of JSONB. Better queryability for filtering, type safety at application level via Zod, easier to extend with metadata later.

4. **Smart SKU compatibility:** Retained `variantId` as nullable on Inventory for cross-compatible parts. Maintains Smart SKU flexibility — some parts (screens, cases) span multiple variants. Cross-compatible parts set `variantId = null` and use `CompatibilityMap` exclusively.

5. **Auth model alignment:** Used `cuid()` for User/Account/Session IDs (not `autoincrement()`). Aligns with NextAuth 5 conventions and prevents ID enumeration attacks.

**Migration path:** Old `Model.modelNumber` → New `Variant.modelNumber`, Old `Model.marketingName` → New `Variant.marketingName`. All existing inventory data preserved through seed rewrite.

---

### 2026-03-24: Core Infrastructure Decisions — Phase 2

**By:** Linus (Backend Dev)  
**Date:** 2026-03-24  
**Context:** Backend reset core infrastructure

**Key Architectural Decisions:**

1. **Factory pattern for Express app:** Use `createApp()` factory function instead of direct app export. Enables testability, allows multiple instances for different environments, standard pattern for production.

2. **Conditional client initialization:** Redis and Stripe clients conditionally initialized based on environment variables. Development doesn't always need Redis or Stripe; services handle gracefully; fail-fast for required services (DB, JWT) but flexible for optional ones.

3. **Neon serverless adapter pattern:** Auto-detect Neon database URLs and use serverless adapter, fallback to standard PrismaClient. Vercel deployment target uses Neon; serverless adapter required for edge/lambda; local development can use standard Postgres.

4. **Structured error responses:** All errors return consistent `{ success, error, details? }` shape. Frontend can rely on structure; validation errors include field-level details; production hides stack traces; maps domain errors (Prisma, Stripe, JWT) to HTTP codes.

5. **Global error handler with domain mapping:** Single middleware maps domain-specific errors to HTTP codes (Zod→400, Prisma P2002→409, P2025→404, Stripe→402, JWT→401, unknown→500).

6. **Middleware ordering:** CORS → JSON parsing → request logging → routes → 404 handler → error handler. Ensures CORS preflight works, body parsing before handlers, logging after parsing, error handler MUST be last.

7. **Graceful shutdown:** SIGINT/SIGTERM handlers close server → disconnect Prisma → exit (10s timeout). Vercel sends SIGTERM before instance replacement; prevents in-flight request failures; cleans up database connections.

8. **Pino for structured logging:** Pretty printing in dev, JSON in production. Structured logs are queryable in production (CloudWatch, Datadog); Pino is fastest Node.js logger; request/error serializers included.

9. **Environment validation with Zod:** Validate all env vars at startup, fail fast if invalid. Catches config errors before deployment; type-safe env access throughout app; stricter validation in production.

10. **Stub pattern for future routes:** Create route/service files with TODO comments for Phases 3-5. Makes app structure visible immediately, establishes import paths early, prevents merge conflicts, clarifies ownership.

---

### 2026-03-24: Backend Project Scaffold Configuration — Phase 6

**By:** Basher (DevOps)  
**Date:** 2026-03-24  
**Context:** Backend reset scaffolding phase

**What Changed:**
- Deleted 9 legacy files (Replit artifacts, old server/schema/seed, package-lock)
- Created new package.json (v2.0.0) with full stack deps
- Updated tsconfig.json to ES2022 + ESNext modules + bundler resolution
- Updated vercel.json for src/index.ts with /api/* routing
- Created .env.example with DB, auth, Redis, Stripe placeholders
- Created README.md with setup, scripts, API overview, deployment notes
- Stubbed src/{config,lib,middleware,routes,services,types}, prisma/migrations

**Key Decisions:**
1. **ES Modules:** `"type": "module"` — modern Node.js standard, cleaner imports, aligns with frontend
2. **Module resolution:** `"bundler"` — supports modern TypeScript tooling (tsx, Vercel)
3. **Path aliases:** `@/*` → `src/*` for cleaner imports
4. **Neon adapter:** Added @prisma/adapter-neon + @neondatabase/serverless for Vercel edge
5. **Dual Redis:** ioredis + @upstash/redis for flexibility
6. **Structured logging:** Pino (fast, JSON, production-ready)
7. **JWT auth:** bcryptjs + jsonwebtoken (proven, no vendor lock-in)
8. **Testing:** Vitest (fast, ESM-native, Vite ecosystem)

**Team impact:** All must run `npm install` after code merge. Linus uses @/* imports, ESM syntax. Saul uses `npm run test` (Vitest). Vercel builds from src/index.ts → dist/index.js with required env vars.

---

### 2026-03-24T07:41:23Z: Backend Reset Plan — Architecture Review

**By:** Danny (Lead)  
**Status:** APPROVED WITH CONCERNS

**Critical Path Analysis:**

Hidden dependency identified: **Phase 1 (Schema) MUST complete before Phase 2 (Core Infra).** Linus's core infra depends on `prisma generate` which requires the final schema. Prisma singleton client types don't exist until after schema evolution lands.

**Corrected sequencing:**
1. Yen completes schema evolution + migration
2. `prisma generate` runs
3. Linus builds core infra (Express factory, Prisma singleton, env config)
4. Linus scaffolds route/service stubs for Phase 3
5. Linus implements Phase 3 endpoints with backwards-compatible shapes
6. Basher executes Phase 6 cleanup + scaffolding
7. Saul validates all 6 phases

Basher's scaffolding (directory structure, package.json rewrite) can start immediately (independent), but legacy deletion must wait until Phase 3 endpoints are validated.

**Risk Flags (9 identified, summary):**
1. NULL → NOT NULL transitions — HIGH: migration backfill strategy required
2. CompatibilityMap composite key migration — MEDIUM: careful ordering of constraints
3. Model→Variant rename in CompatibilityMap — LOW: atomic Prisma query updates needed
4. API price formatting (cents→dollars) — MEDIUM: explicit test case required
5. API model naming (Variant vs others) — LOW: preserve consumer-facing names
6. Redis without deployment strategy — MEDIUM: defer or confirm Vercel KV setup
7. Stripe API version not pinned — LOW: specify version in Phase 2
8. Vercel ESM deployment config — LOW: vercel.json must set correct build output
9. Prisma migration reset vs backfill — HIGH: blocking decision for production data

**Frontend impact:** Zero if API contracts hold. Phase 3 must preserve 6 existing endpoint response shapes. Risk if hierarchy exposed in responses.

**Verdict:** ✅ PROCEED with gates:
- Phase 1: Approved (clarify migration strategy)
- Phase 2: BLOCKED until Phase 1 + `prisma generate`
- Phase 6: Approved for scaffolding; legacy deletion waits for Phase 3
- Saul: Add price formatting + API shape preservation tests

Timeline: ~5 days actual (serial execution, not parallel).

---

### 2026-03-24: Testing Strategy — Backend Reset

**By:** Saul (Tester)  
**Date:** 2026-03-24  
**Context:** Backend reset with 6 phases

**Key Decisions:**

1. **Anticipatory test planning:** Write test plans before implementation. Test cases document expected behavior for implementers. Stubs use `test.todo()` and are filled in as code becomes available.

2. **Real DB for integration tests (no mocking):** PostgreSQL test database catches schema issues, constraint violations, query bugs. Exception: unit tests for pure functions can skip DB.

3. **Mock external services:** Stripe and Redis mocked (unreliable, slow, costly). Stripe: fixtures + mock webhook signing. Redis: ioredis-mock or in-memory Map.

4. **Coverage goals:** ≥80% statement/function/line, ≥75% branch. Auth and payment code require 100%. Fail CI if coverage drops.

5. **Priority-based test execution:** P0 (critical, blocks deployment), P1 (high), P2 (medium). P0 suite runs first in CI and locally for fast feedback.

6. **Backwards compatibility suite:** Dedicated test suite verifies new backend produces same response shape as old backend for 6 existing endpoints. Snapshot tests for happy path + edge cases.

7. **Minimal test data seeding:** Test-specific utilities (createTestBrand(), createTestInventory()). Each test suite seeds only what it needs.

8. **Test DB reset strategy:** Truncate all tables before each test suite (not before each test). Tests share state within suite but are isolated across suites.

9. **CI/CD test pipeline:** Lint → Type check → Unit tests → Integration tests → E2E tests → Coverage report.

10. **Flaky test policy:** Flaky tests treated as failing. Investigate and fix immediately. Retry logic ONLY for external services. Mark persistently flaky as `.skip` with TODO.

---

### 2026-03-24: Squad roster confirmed

**By:** Copilot (via Squad)

**What:** Confirmed the team roster for CTv05monorepo: Danny (Lead), Rusty (Frontend Dev), Linus (Backend Dev), Saul (Tester), Basher (DevOps), and Yen (Database / Data Specialist); Scribe and Ralph remain built-ins.

**Why:** The refactor spans UI, API, database, testing, and deployment work, so the roster needs clear ownership across those surfaces.

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction

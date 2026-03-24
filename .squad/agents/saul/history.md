# Project Context

- **Owner:** Copilot
- **Project:** Modern refactor of an ecommerce platform for a wholesale distributor of cellphone repair parts, using Smart SKU and a relational database. The codebase is currently a monorepo and will eventually split into separate frontend and backend repositories.
- **Stack:** Strict TypeScript, Next.js, Tailwind CSS, TanStack Query, Zustand, Prisma, Zod, Clerk or NextAuth 5, Stripe, Neon/PostgreSQL, tRPC, Resend, S3, GitHub Actions, Vercel, Vitest, React Testing Library, Playwright or Jest, PostgreSQL full-text search, Turbopack.
- **Created:** 2026-03-24T13:05:26Z

## Learnings

- Test coverage needs to follow the active surface: UI, backend, database, and deploy.
- All `.squad/` paths resolve from the team root provided by the Coordinator.
- The shared decision log stays append-only and is merged through Scribe.
- **Anticipatory test planning:** Writing test plans before implementation is complete helps catch design issues early and documents expected behavior for implementers. Test stubs with `test.todo()` show pending work and can be filled in as code becomes available.
- **Backwards compatibility testing:** When refactoring existing APIs, dedicated test suites verifying response shape preservation are critical. Snapshot tests comparing old vs new schemas prevent production outages.
- **Test data strategy:** Minimal seed data for tests (not full production seed) reduces coupling and speeds up test execution. Each test suite should seed only what it needs using test-specific utilities.
- **Real DB vs mocking:** Integration tests benefit from real PostgreSQL test databases (not mocked Prisma) to catch schema issues, constraint violations, and query bugs. External services (Stripe, Redis) should still be mocked.
- **Priority-based execution:** Categorizing tests as P0/P1/P2 enables fail-fast CI pipelines where critical tests (auth, payments, data integrity) run first and block deployment immediately on failure.
- **Schema migration risks:** The new 4-level hierarchy (Brand → ModelType → Generation → Variant) replacing flat models is a high-risk change. Tests must verify data preservation, correct relationships, and backwards-compatible query results.
- **Price calculation edge cases:** Prices stored in cents but returned in dollars — off-by-100 errors are common. Tests must verify all conversions and order snapshots (unitPriceAtPurchase) to prevent billing issues.
- **Specification parsing:** Migrating pipe-delimited strings to structured Specification table requires thorough edge case testing (empty strings, missing pipes, extra pipes). Parser bugs will surface in production if not caught.
- **Enum expansion awareness:** New enums (QualityGrade + U/NA, Role + BUYER/ADMIN, OrderStatus with all states) must be validated in seed tests. Missing enum values or incorrect casing will cause runtime errors.
- **Phase 1 dependencies (from Yen):** Schema introduces 4-level hierarchy with composite keys. CompatibilityMap switches from `id` auto-increment to composite `@@id([skuId, compatibleVariantId])`. Specification table uses normalized design (label + value columns). Tests must verify CompatibilityMap composite key uniqueness and cross-compatibility preservation across variants.
- **Architecture concerns (from Danny):** Phase 3 endpoints MUST preserve 6 existing API response shapes exactly (price in dollars, modelName field, count/brands/models fields). Backwards compatibility test suite is non-negotiable. Price formatting (cents→dollars) must have explicit test coverage. Missing fields or wrong structure = frontend outage.

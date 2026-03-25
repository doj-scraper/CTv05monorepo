# CellTech Backend — Staged Roadmap (Stages A–G)

> **Version:** 1.0 · **Date:** 2026-03-25 · **Project:** COR (crodapdx.atlassian.net)
> **Stack:** Express.js · TypeScript · Prisma + PostgreSQL (Neon) · Redis (Upstash) · Stripe · Vercel

---

## Preserved Invariants (Do Not Break)

These rules apply to every stage. Any PR that violates them is blocked.

| Invariant | Rule |
|---|---|
| **Prisma schema** | Only additive migrations. No column renames or type changes without a `@map` alias + migration pair. `prisma migrate dev` must pass in CI. |
| **Seed idempotency** | `prisma db seed` uses `upsert` throughout. Re-running must produce the same state with zero errors. |
| **SKU format** | `{BRAND}-{CAT}-{MODEL_NUM}-{GRADE}` (e.g. `APL-BAT-A3293-OEM`). Brand and category slugs are uppercase 3-char. Grade maps to `QualityGrade` enum: OEM · Premium · Aftermarket · U · NA. |
| **Device hierarchy** | Always 4 levels: Brand → ModelType → Generation → Variant. Never flatten. |
| **Price storage** | All monetary values stored in **integer cents**. No floats in DB or wire format. |
| **Role gates** | `BUYER` routes: read catalog, manage own cart/orders. `ADMIN` routes: write inventory, manage all orders, analytics. |
| **Response shape** | Existing frontend consumers must not break. New fields added as optional. Removed fields require a deprecation notice + one stage grace period. |

---

## Stage Map

```
A ──► B ──► C ──► D ──► E ──► F ──► G
Foundation  Catalog  Auth+    Checkout  Accounts  Admin+    Harden+
            APIs     Quote    Orders    Support   Analytics Scale
                     Cart     Payments
```

---

## Stage A — Foundation & Infrastructure

**Objective:** Production-grade runtime baseline. All future stages build on this.

**Status:** ✅ Largely complete (Phases 1–2 of backend reset done)

### Dependencies
- Neon PostgreSQL provisioned
- Upstash Redis provisioned
- Vercel project linked
- `.env` vars documented in `.env.example`

### Deliverables

| # | Deliverable | Notes |
|---|---|---|
| A-1 | Prisma schema v1 migrated to Neon | Brand→ModelType→Generation→Variant, Inventory, Spec, CompatibilityMap, User, Session, Cart, Order, OrderLine |
| A-2 | Seed script idempotent | Apple + Samsung, 4 categories, real SKUs, specs, compatibility maps |
| A-3 | Express app factory | CORS, body parsing, Pino logger, graceful shutdown |
| A-4 | Env validation (Zod) | Startup fails fast on missing vars |
| A-5 | PrismaClient singleton | Neon driver adapter, connection pooling |
| A-6 | Redis singleton | Upstash/ioredis, used for rate-limit store + session cache |
| A-7 | Middleware stack | `auth`, `validate`, `rateLimit`, `errorHandler` |
| A-8 | Health endpoints | `GET /health`, `GET /api/health` — liveness + readiness |
| A-9 | CI pipeline | TypeScript `tsc --noEmit` + Vitest on PR |
| A-10 | Vercel deploy config | `vercel.json` routes all traffic to Express handler |

### Frontend Unlocks
- Health check badge in dashboard
- Environment-aware API base URL (`lib/api.ts`)

---

## Stage B — Catalog & Inventory APIs

**Objective:** Full read surface for the product catalog. Frontend can browse devices and parts without auth.

**Dependencies:** Stage A complete, seed data loaded.

### Deliverables

| # | Deliverable | Endpoint(s) | Notes |
|---|---|---|---|
| B-1 | Brands list | `GET /api/brands` | Sorted A-Z, include modelType count |
| B-2 | ModelTypes by brand | `GET /api/brands/:brandId/model-types` | |
| B-3 | Generations by model type | `GET /api/model-types/:id/generations` | Include `releaseYear` |
| B-4 | Variants by generation | `GET /api/generations/:id/variants` | `modelNumber`, `marketingName`, `colorway`, `storage` |
| B-5 | Inventory list | `GET /api/inventory` | Filter: `categoryId`, `qualityGrade`, `variantId`, `inStock` (boolean). Pagination: `page`, `limit`. |
| B-6 | SKU detail | `GET /api/inventory/:skuId` | Full item + specifications array + compatible variants |
| B-7 | Compatibility query | `GET /api/compatibility?variantId=` | Returns all SKUs compatible with a variant |
| B-8 | Bulk stock check | `POST /api/inventory/bulk-check` | Body: `{ skuIds: string[] }` → `{ skuId, stockLevel, wholesalePrice }[]` |
| B-9 | Category list | `GET /api/categories` | For filter UI |
| B-10 | Search | `GET /api/inventory/search?q=` | Full-text over `partName` + `marketingName`; Postgres `ILIKE` for now |

**SKU Rule Enforcement (B-11):** `catalog.service.ts` validates SKU on create/update against regex `^[A-Z]{3}-[A-Z]{3}-[A-Z0-9]+-[A-Z]+$`. Throws `400` with field-level error if invalid.

### Frontend Unlocks
- `/catalog` page — device explorer with Brand → Model → Generation → Variant drill-down
- `/product/[skuId]` — full part detail page, compatibility matrix, specs table
- `FitmentChecker` component live data
- `CompatibilityMatrix` component live data
- Category filter sidebar

---

## Stage C — Authentication, Quotes & Cart

**Objective:** Authenticated sessions, persistent server-side cart, and B2B quote workflow.

**Dependencies:** Stage B complete.

### Deliverables

| # | Deliverable | Endpoint(s) | Notes |
|---|---|---|---|
| C-1 | Register | `POST /api/auth/register` | Email + password, bcryptjs, returns JWT + refresh token |
| C-2 | Login | `POST /api/auth/login` | Constant-time compare, returns JWT pair |
| C-3 | Refresh | `POST /api/auth/refresh` | Rotates refresh token, invalidates old session row |
| C-4 | Logout | `POST /api/auth/logout` | Deletes Session row, invalidates JWT in Redis blocklist |
| C-5 | Auth middleware | `requireAuth`, `requireAdmin` | Verifies JWT, attaches `req.user`; role guard for ADMIN routes |
| C-6 | Cart — add/update | `POST /api/cart`, `PATCH /api/cart/:skuId` | Upserts `Cart` row `(userId, skuId)` unique; validates stock |
| C-7 | Cart — remove | `DELETE /api/cart/:skuId` | |
| C-8 | Cart — get | `GET /api/cart` | Returns items with live `wholesalePrice` + `stockLevel` joined |
| C-9 | Cart — clear | `DELETE /api/cart` | Full cart wipe (used post-checkout) |
| C-10 | Quote export | `GET /api/cart/quote-pdf` | Returns PDF quote with line items, unit prices, total, 30-day validity stamp |
| C-11 | Rate limiting | Redis-backed | Auth endpoints: 10 req/15 min per IP. Cart: 60 req/min per user. |

**B2B Cart Rules:**
- Cart persists indefinitely (no TTL) — shop managers build orders over multiple days.
- Quantity updates do NOT reserve stock (optimistic). Stock is hard-checked at checkout (Stage D).
- `wholesalePrice` in cart response is live from DB, not snapshotted — price changes are visible before checkout.

### Frontend Unlocks
- `useAuth` hook — real login/logout/register flows
- `authStore` — hydrated from JWT on mount
- `useCart` hook — all mutations wired to real API
- Cart badge in `navigation.tsx` — live count
- Quote page (`/quote`) — download PDF button live
- Protected route guard (`requireAuth` HOC)

---

## Stage D — Checkout, Orders & Payments

**Objective:** End-to-end purchase flow with Stripe, idempotent order creation, and webhook hardening.

**Dependencies:** Stage C complete, Stripe account provisioned.

### Deliverables

| # | Deliverable | Endpoint(s) | Notes |
|---|---|---|---|
| D-1 | Create payment intent | `POST /api/checkout/intent` | Reads cart, hard-checks stock, creates Stripe PaymentIntent, returns `clientSecret` |
| D-2 | Stripe webhook | `POST /api/checkout/webhook` | Raw body parser, signature verification (`STRIPE_WEBHOOK_SECRET`), idempotency via `stripePaymentIntentId @unique` |
| D-3 | Order creation | Triggered by `payment_intent.succeeded` | Snapshots `unitPriceAtPurchase`, decrements `stockLevel`, creates `OrderLine[]`, clears cart |
| D-4 | Order list | `GET /api/orders` | Paginated, BUYER sees own orders, ADMIN sees all. Filters: `status`, `dateFrom`, `dateTo` |
| D-5 | Order detail | `GET /api/orders/:id` | Full order + lines + SKU names |
| D-6 | Order status update | `PATCH /api/orders/:id/status` | ADMIN only. Valid transitions: `PENDING→PAID→SHIPPED→DELIVERED`, `*→CANCELLED`, `PAID→REFUNDED` |
| D-7 | Refund | `POST /api/orders/:id/refund` | ADMIN only. Calls Stripe refund API, sets status `REFUNDED`, restores `stockLevel` |
| D-8 | Stock reservation | Atomic decrement on checkout | Use Prisma `$transaction` to check + decrement; rollback on Stripe failure |

**Price Snapshot Rule:** `unitPriceAtPurchase` in `OrderLine` is written once at order creation and never updated. This is the billing source of truth.

**Webhook Idempotency:** If `stripePaymentIntentId` already exists → return `200` without creating duplicate order.

### Frontend Unlocks
- `checkout-section.tsx` — Stripe Elements integrated, real PaymentIntent
- Order confirmation page
- `/dashboard` — order history list with status badges
- Order detail page with line items and price breakdown

---

## Stage E — Account Management & Support

**Objective:** Self-service account portal and support ticket foundation for B2B buyers.

**Dependencies:** Stage D complete.

### Deliverables

| # | Deliverable | Endpoint(s) | Notes |
|---|---|---|---|
| E-1 | Profile read/update | `GET /api/account`, `PATCH /api/account` | Email, company name, phone — add `companyName`, `phone` fields to `User` model (additive migration) |
| E-2 | Password change | `POST /api/account/change-password` | Requires current password, re-hashes, invalidates all existing sessions |
| E-3 | Address book | `POST/GET/PATCH/DELETE /api/account/addresses` | New `Address` model (additive). Shipping + billing addresses per user |
| E-4 | Support ticket create | `POST /api/support/tickets` | New `SupportTicket` model: `userId`, `orderId?`, `subject`, `body`, `status` (OPEN/IN_PROGRESS/CLOSED) |
| E-5 | Support ticket list | `GET /api/support/tickets` | BUYER: own tickets. ADMIN: all tickets with filter by status |
| E-6 | Support ticket reply | `POST /api/support/tickets/:id/replies` | New `TicketReply` model: `userId`, `body`, `createdAt` |
| E-7 | Order return request | `POST /api/orders/:id/return-request` | Creates support ticket pre-filled with order context |

**Schema Additions (Stage E migration):**
```prisma
model Address { id, userId, label, line1, line2?, city, state, zip, country, isDefault }
model SupportTicket { id, userId, orderId?, subject, body, status, createdAt, updatedAt }
model TicketReply { id, ticketId, userId, body, createdAt }
```

### Frontend Unlocks
- Account settings page — profile, password change, address book
- `/support` page — ticket list, create ticket, reply thread
- Order detail — "Request Return" button live

---

## Stage F — Admin Dashboard & Analytics

**Objective:** Internal tooling for inventory management, order operations, and business analytics.

**Dependencies:** Stage E complete.

### Deliverables

| # | Deliverable | Endpoint(s) | Notes |
|---|---|---|---|
| F-1 | Inventory CRUD | `POST/PATCH/DELETE /api/admin/inventory` | ADMIN only. SKU format validated on write. |
| F-2 | Bulk inventory import | `POST /api/admin/inventory/import` | Accepts JSON array; validates all SKUs before any DB write (all-or-nothing) |
| F-3 | Low stock alerts | `GET /api/admin/inventory/low-stock` | Returns SKUs where `stockLevel < threshold` (default 10, configurable per SKU) |
| F-4 | User management | `GET /api/admin/users`, `PATCH /api/admin/users/:id` | List buyers, change role, deactivate account |
| F-5 | Sales analytics | `GET /api/admin/analytics/sales` | Daily/weekly/monthly revenue (sum of `totalCents`), order count, by status |
| F-6 | Top products | `GET /api/admin/analytics/top-products` | Ranked by units sold (sum `OrderLine.quantity`), with revenue per SKU |
| F-7 | Inventory turnover | `GET /api/admin/analytics/inventory` | Stock-on-hand value, sell-through rate per category |
| F-8 | Support queue | `GET /api/admin/support` | All open tickets, sortable by age, linked orders |
| F-9 | Seed management | `POST /api/admin/seed` | Dev/staging only. Re-runs seed behind `NODE_ENV !== production` guard |

**SKU Write Rules (F-1/F-2):**
- Brand slug derived from `Brand.name` — first 3 chars uppercase.
- Category slug from `Category.name` — first 3 chars uppercase.
- `modelNumber` taken from `Variant.modelNumber`.
- Grade from `QualityGrade` enum.
- Full SKU: `${brandSlug}-${catSlug}-${modelNumber}-${grade}`.
- Duplicate SKU → `409 Conflict`.

### Frontend Unlocks
- Admin-only nav section
- `/admin/inventory` — CRUD table with bulk import
- `/admin/orders` — full order management with status updates
- `/admin/analytics` — revenue charts, top products, inventory health
- `/admin/support` — support queue management

---

## Stage G — Hardening, Performance & Scale

**Objective:** Production confidence. Security audit, load testing, observability, API documentation.

**Dependencies:** Stages A–F functionally complete.

### Deliverables

| # | Deliverable | Notes |
|---|---|---|
| G-1 | OpenAPI spec | Auto-generated from route + Zod schemas. Hosted at `/api/docs`. |
| G-2 | Stripe webhook hardening | `stripe.webhooks.constructEvent` signature check in place. Replay protection via Redis `SET NX` on event ID. |
| G-3 | Refresh token rotation | Single-use tokens. Reuse detection invalidates entire session family. |
| G-4 | Database indexes | Indexes on `Inventory.categoryId`, `Inventory.variantId`, `Order.userId`, `Order.status`, `Cart.userId` |
| G-5 | Query optimization | N+1 audit on catalog + order endpoints. Add `include` depth limits. |
| G-6 | Redis caching | Cache `GET /api/brands`, `/api/categories`, `/api/inventory/:skuId` with 5-min TTL. Invalidate on ADMIN writes. |
| G-7 | Rate limit hardening | Differentiated limits: public catalog (300/min), auth (10/15min), mutations (60/min), admin (120/min) |
| G-8 | Load testing | k6 scripts for catalog browse, cart, checkout flows. Target: p95 < 300ms at 500 concurrent. |
| G-9 | Error tracking | Sentry integration in Express error handler. Source maps uploaded in CI. |
| G-10 | Structured logging | Pino log levels per environment. Request ID propagated through all log lines. |
| G-11 | Dockerfile | Multi-stage build. `node:20-alpine`. Non-root user. |
| G-12 | Secrets rotation runbook | Document rotation procedure for `JWT_SECRET`, `STRIPE_SECRET_KEY`, `DATABASE_URL`. |
| G-13 | Prisma migration CI gate | `prisma migrate diff --exit-code` on every PR to catch unapplied migrations. |
| G-14 | Seed data CI trim | Separate `seed:ci` script with minimal fixture set (2 brands, 1 category, 3 SKUs) for fast test runs. |

### Frontend Unlocks
- `GET /api/docs` — Swagger UI for partner integrations
- Performance improvements visible across all pages (caching)

---

## Cross-Stage Dependency Graph

```
A (infra) ──────────────────────────────────┐
  └── B (catalog) ─────────────────────┐    │
        └── C (auth+cart) ────────┐    │    │
              └── D (checkout) ──►│    │    │
                    └── E (acct) ─┤    │    │
                          └── F (admin)┤    │
                                └── G (harden+scale)
```

| Stage | Blocks | Blocked By |
|---|---|---|
| A | B, C, D, E, F, G | — |
| B | C, F | A |
| C | D, E | B |
| D | E, F | C |
| E | F | D |
| F | G | E |
| G | — | F |

---

## Frontend Unlock Summary

| Stage | Key Frontend Capabilities Unlocked |
|---|---|
| A | Health check, env-aware API client |
| B | Catalog browse, product detail, compatibility, fitment checker |
| C | Auth flows, cart drawer, quote PDF, protected routes |
| D | Stripe checkout, order confirmation, order history |
| E | Account settings, address book, support tickets |
| F | Admin panel, analytics dashboard, inventory management |
| G | Docs portal, performance gains, error visibility |

---

## Jira Mapping Guide

| Field | Value |
|---|---|
| Project | NET |
| Workstream | One per Stage (A–G) |
| Task | One per numbered deliverable (e.g. B-5 Inventory List) |
| Sub-task | Implementation, tests, frontend integration per Task |
| Labels | `backend`, `stage-{a-g}`, `schema`, `breaking-change` |
| Priority | Stage A/B/C = High · D/E = Medium · F/G = Low (initially) |

---

*Roadmap authored 2026-03-25. Maintained by engineering lead. All schema changes require migration review before merge.*

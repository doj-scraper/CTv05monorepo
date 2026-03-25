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
- **Backend Phase 1–5 report compilation (2026-03-24T14:30Z):** Synthesized ARCHITECTURE.md, NEXT_STEPS.md, TEST_PLAN.md, schema.prisma, and squad decisions into single-source-of-truth backend report. Key insight: all 5 phases are tightly coupled; Phase 1 schema blocks Phase 2 Prisma generation which blocks Phase 3+ implementation. Risk inventory from Danny's review (price formatting, API shape preservation, NULL→NOT NULL migrations, concurrent cart updates) all mitigated by Saul's test suite. Critical dependencies: Phase 1→2→3→4→5 sequential; parallel work only within stubs (Phase 2 middleware) before schema locks. Backwards-compatibility is highest risk (6 existing endpoints must return identical shapes); test snapshots key to validation.

---

## Cart Service Analysis — Phase 5 Preparation

**Date:** 2026-03-24T14:00Z  
**Context:** Analyzed cart-service TODO and backend implementation patterns to shape Phase 5 commerce service architecture.

### Current State

**Cart Service Stub** (`src/services/cart.service.ts`):  
- Empty class with placeholder method comments
- No implementation, awaiting Phase 5 kickoff

**Cart Routes Stub** (`src/routes/cart.routes.ts`):  
- Route comments outline 5 endpoints: GET cart, POST/add, PATCH/update quantity, DELETE/remove, DELETE/clear
- No middleware attached, no handler logic

### Schema Foundation

**Cart Model** (from `prisma/schema.prisma` lines 166–177):  
```
model Cart {
  id       String   @id @default(cuid())
  userId   String
  skuId    String
  quantity Int      @default(1)
  addedAt  DateTime @default(now())
  
  user      User      @relation(fields: [userId], references: [id])
  inventory Inventory @relation(fields: [skuId], references: [skuId])
  
  @@unique([userId, skuId])  // ONE entry per SKU per user
}
```
**Key constraint:** `@@unique([userId, skuId])` enforces single-row-per-user-per-sku model. This is a **stock management contract** — if user adds the same SKU twice, quantity updates in-place; no duplicate rows.

### Error Handling & Response Patterns

**Pattern source:** `src/middleware/errorHandler.ts` + `src/lib/auth.ts` (HttpError class)

1. **Consistent response shape:**  
   - Success: `{ success: true, data... }`
   - Error: `{ success: false, error: "message", code?: "ERROR_CODE", details?: [...] }`

2. **HttpError class** (used by services):  
   ```typescript
   class HttpError extends Error {
     constructor(statusCode: number, message: string, code: string)
   }
   ```
   Allows services to throw domain errors; error handler catches and maps to HTTP responses.

3. **Prisma error mapping:**  
   - P2002 (unique constraint) → 409 Conflict (e.g., duplicate cart entry attempts)
   - P2025 (not found) → 404 Not Found
   - Generic DB error → 400 Bad Request

4. **Validation errors:**  
   - Zod validation failures → 400 with field-level details
   - Manual checks (quantity > 0, SKU exists) → throw HttpError or respond 400/422

### Auth Middleware

**Location:** `src/middleware/auth.ts`

- `requireAuth` middleware: Extract Bearer token, verify JWT (from `lib/auth.ts`), check Redis blacklist, attach `req.user` + `req.auth`
- `requireRole(...)` middleware: Check `req.user.role` against allowed roles (BUYER/ADMIN)
- All cart operations require `requireAuth` (user-scoped data)

**User context:** `req.user = { id: string, email, role, createdAt, updatedAt }`

### Service Pattern Reference

**InventoryService** (`src/services/inventory.service.ts` lines 174–293):

- **Methods are async, return DTOs** (not raw Prisma models)
- **Input validation at method boundary** (e.g., `if (quantity <= 0)`)
- **Prisma includes/selects are centralized** (constants at top, reused in multiple methods)
- **Error throwing:** Use `HttpError` for domain logic failures; let Prisma errors bubble (caught by error handler)
- **Stock methods use atomic Prisma updates:** `{ decrement: quantity }`, `{ increment: quantity }`
- **Null checks:** Return `null` if resource not found; caller decides 404 vs default behavior

**AuthService** (`src/services/auth.service.ts` lines 69–158):

- **Static methods** (no instance state)
- **Composed helpers:** `createSession()`, `persistRefreshSession()`, `toAuthenticatedUser()`
- **Constants at top** (TTL, salt rounds, select fields)
- **Type-safe DTOs** (UserRecord input type, AuthenticatedUser output type)
- **Token management delegated to lib** (`createAccessToken`, `generateRefreshToken`, `hashToken` from `lib/auth.ts`)

### Route Pattern Reference

**InventoryRoutes** (`src/routes/inventory.routes.ts` lines 1–87):

```typescript
// Standard try-catch pattern
router.get('/:skuId', async (req, res, next) => {
  try {
    const part = await inventoryService.getInventoryPart(req.params.skuId);
    
    if (!part) {
      res.status(404).json({ success: false, error: 'Part not found' });
      return;
    }
    
    res.json({ success: true, part });
  } catch (err) {
    next(err);  // Pass to error handler
  }
});
```

- **Manual inline validation** (e.g., type-checking array elements)
- **All errors passed to `next(err)` for centralized handling**
- **Consistent success/error shape**
- **No authentication in inventory routes** (public read-only)

### Minimal Adjustments Needed for Cart Routes

1. **Import auth middleware** in cart routes
2. **Attach `requireAuth` to all cart endpoints** (user-scoped operations)
3. **Use standard try-catch + next(err) pattern**
4. **Accept Zod validators in handlers** (optional, if building strict input schema)
5. **No explicit 404 responses needed** for not-found (error handler maps P2025 → 404)

### Recommended Cart Service Implementation Shape

**Method signatures (atomic operations):**

```typescript
// Get user's active cart (all items)
async getCart(userId: string): Promise<CartDto[]>

// Add or update item (leverages @@unique constraint)
async addOrUpdateItem(userId: string, skuId: string, quantity: number): Promise<CartItemDto>

// Update quantity for existing item
async updateItemQuantity(userId: string, skuId: string, quantity: number): Promise<CartItemDto>

// Remove single item
async removeItem(userId: string, skuId: string): Promise<void>

// Clear entire cart
async clearCart(userId: string): Promise<void>

// Get cart totals (price + stock validation)
async getCartTotals(userId: string): Promise<CartSummaryDto>
```

**Key design points:**

1. **Stock validation:** Before add/update, call `InventoryService.checkStock(skuId)`. Throw `HttpError(422, "Out of stock", "OUT_OF_STOCK")` if insufficient.

2. **Unique constraint handling:** Prisma's `@@unique([userId, skuId])` means:
   - First add → INSERT
   - Second add same SKU → Prisma throws P2002 → error handler returns 409
   - **Solution:** Use `prisma.cart.upsert()` to atomically insert-or-update:
   ```typescript
   await prisma.cart.upsert({
     where: { userId_skuId: { userId, skuId } },
     update: { quantity },
     create: { userId, skuId, quantity },
     include: { inventory: true }
   });
   ```

3. **Price calculation:** `CartSummaryDto` should return:
   ```typescript
   {
     items: CartItemDto[],
     subtotalCents: number,     // sum of (qty × wholesalePrice)
     totalCents: number,         // after discounts if applicable
     itemCount: number
   }
   ```
   Note: Prices stored as cents in Inventory; return cents in cart totals.

4. **Error boundaries:**
   - Quantity ≤ 0 → 422 Unprocessable Entity
   - SKU not found → 404 Not Found
   - Out of stock → 422 Unprocessable Entity
   - User not authenticated → 401 (auth middleware)

### Route-to-Service Mapping

| HTTP | Route | Auth | Service Method | Notes |
|------|-------|------|---|---|
| GET | `/api/cart` | `requireAuth` | `getCart(userId)` + `getCartTotals(userId)` | Returns full cart state |
| POST | `/api/cart/items` | `requireAuth` | `addOrUpdateItem(userId, skuId, qty)` | Body: `{ skuId, quantity }` |
| PATCH | `/api/cart/items/:cartId` | `requireAuth` | `updateItemQuantity(userId, skuId, qty)` | Body: `{ quantity }` |
| DELETE | `/api/cart/items/:cartId` | `requireAuth` | `removeItem(userId, skuId)` | No body |
| DELETE | `/api/cart` | `requireAuth` | `clearCart(userId)` | Bulk clear |

**Route param concern:** Routes show `:id` but Cart model uses composite key `[userId, skuId]`. **Recommendation:** Pass `skuId` in route OR body (cleaner than encoding composite key in URL).

### Type Definitions Needed

```typescript
// Input/Output DTOs
export type CartItemDto = {
  skuId: string;
  partName: string;
  quantity: number;
  unitPrice: number;      // in cents (from Inventory.wholesalePrice)
  totalPrice: number;     // quantity × unitPrice
  stockAvailable: number;
  addedAt: Date;
};

export type CartDto = {
  items: CartItemDto[];
  addedAt: Date;
};

export type CartSummaryDto = {
  items: CartItemDto[];
  subtotalCents: number;
  totalCents: number;
  itemCount: number;
  cartValue: number;      // in dollars for display
};
```

### Integration with Checkout/Orders

**Cart → Checkout → Order flow:**

1. **Checkout** (`src/services/checkout.service.ts` stubbed) will read cart via `getCart(userId)`
2. **Reserve inventory** via `InventoryService.reserveInventory(skuId, qty)` before Stripe payment
3. **On payment success:** Move cart items → `OrderLine` table, clear cart
4. **On payment failure:** Call `InventoryService.releaseInventory()` to restore stock

This means **cart.service should NOT manage inventory reservations** — that's checkout's job. Cart is just state; checkout is the transaction.

### Testing Considerations (for Saul)

- **Happy path:** Add item → update qty → remove item → clear cart
- **Constraint test:** Add same SKU twice (expect update-in-place, not duplicate)
- **Stock validation:** Try to add qty > available (expect 422)
- **Auth boundary:** Unauthenticated user trying to add item (expect 401)
- **Price accuracy:** Verify cart totals match sum of line items
- **Idempotency:** Remove non-existent item (should 404 or silently succeed — decide)

# CellTech Distributor — Next Steps

> **Last updated:** 2026-03-24T07:50Z · **Author:** Copilot session (sprint to MVP)

This document captures everything a developer needs to know to continue building the CellTech platform. It covers the approved schema migration, remaining frontend work, and the backend wiring plan.

---

## Current State (2026-03-24)

### What's Done

| Area | Status | Details |
|------|--------|---------|
| Landing page | ✅ Complete | Slimmed from 14 → 5 sections (Hero, Categories, Products, Partners, CTA) |
| Persistent layout | ✅ Complete | Nav + Footer in `app/layout.tsx`, all pages use shared shell |
| `/about` route | ✅ Complete | Quality + Shipping + Testimonials sections moved here |
| Navigation | ✅ Complete | Links: Catalog, Inventory, About, Quote, Support, Account (desktop + mobile) |
| Product detail page | ✅ Complete | `/product/[skuId]` with gallery, fitment checker, specs, compatibility matrix, add-to-cart |
| Product components | ✅ Complete | FitmentChecker, ProductGallery, CompatibilityMatrix, AddToCartButton in `components/product/` |
| Product card links | ✅ Complete | Cards on home + catalog link to `/product/[skuId]` |
| Cart store | ✅ Complete | Zustand store with `{sku, name, price, quantity, moq, image}` |
| API client | ✅ Complete | `lib/api.ts` with 20+ typed functions |
| Backend deployment | ✅ Complete | Express API at `https://celltech-backend.vercel.app` |
| Documentation | ✅ Complete | README.md, ARCHITECTURE.md, AGENTS.md, NEXT_STEPS.md updated |

### What's NOT Done

| Area | Priority | Details |
|------|----------|---------|
| Build verification | 🔴 High | `npm install` requires network. Run `npm run build` to verify no TypeScript/import errors |
| Schema migration | 🔴 High | Nullable fixes, Smart SKU, Specification table, CompatibilityMap composite key |
| NextAuth | 🔴 High | User, Account, Session tables — login/register/logout |
| Server-side cart | 🟡 Medium | B2B multi-day quoting requires DB-persisted cart |
| Device Explorer catalog | 🟡 Medium | Two-panel layout: sidebar filter tree + product grid |
| Checkout flow | 🟡 Medium | Order creation with `unitPriceAtPurchase` snapshot |
| Cart drawer UI | 🟡 Medium | Slide-out cart panel with item management |
| Quote submission | 🟡 Medium | Wire quote form to backend endpoint |
| Dashboard functionality | 🟡 Medium | Order history, account settings |
| Image CDN | 🟢 Low | Replace local placeholders with real product images |
| Testing | 🟢 Low | No test framework configured. Vitest recommended |
| `RootLayout.tsx` cleanup | 🟢 Low | Delete deprecated `components/RootLayout.tsx` |

---

## Approved Schema Migration (2026-03-24)

The following changes have been approved by the project owner. They represent the target state for `CellTech/Test/schema.prisma`.

### 1. Nullable Field Fixes

**Current problem:** Critical fields are optional (`?`), causing frontend bugs and unclear data.

| Field | Current | Target | Notes |
|-------|---------|--------|-------|
| `wholesalePrice` | `Int?` | `Int @default(0)` | If 0, frontend shows "Contact for Price" |
| `qualityGrade` | `QualityGrade?` | `QualityGrade` (required) | Enum expanded with `U` (Unknown) and `NA` (Not Applicable) |
| `partName` | `String?` | `String` (required) | Run migration script: copy `skuId` to `partName` for blanks |
| `marketingName` (on Model) | `String?` | `String` (required) | A device without a name can't be searched |

**Updated QualityGrade enum:**
```prisma
enum QualityGrade {
  OEM
  Premium
  Aftermarket
  U          // Unknown
  NA         // Not Applicable
}
```

### 2. Smart SKU Bucket System

Replace freeform SKU IDs with a structured format: `[Bucket]-[Subcategory]-[Grade]-[Device]`

**The 4 Buckets:**

| Bucket | Name | Description |
|--------|------|-------------|
| 1 | Visual Interface | Screens, displays, digitizers |
| 2 | Chassis & Enclosure | Back glass, frames, housings |
| 3 | Functional Modules | Batteries, cameras, charging ports |
| 4 | Interconnects | Flex cables, connectors, antennas |

**Subcategories (letters A, B, C... within each bucket):**

Example for Bucket 3 (Functional Modules):
- A = Charging Port
- B = Camera
- C = Battery

**Grade indicator:**
- O = OEM
- P = Premium
- A = Aftermarket
- U = Unknown

**Example:** `3-C-O-IP13` = Functional Module / Battery / OEM / iPhone 13

> **Implementation note:** The `skuId` field remains the primary key. Existing SKUs should be migrated via a script. The frontend `ProductGallery` component already maps categories to images — the bucket system aligns with those categories.

### 3. Specification Table

**Current:** `specifications String?` — a comma-separated pipe of `label:value` pairs.

**Target:** A dedicated related table for filterable, structured specs.

```prisma
model Specification {
  id    Int    @id @default(autoincrement())
  skuId String
  label String   // e.g., "Capacity", "Voltage", "Resolution"
  value String   // e.g., "3227 mAh", "3.8V", "2556x1179"

  inventory Inventory @relation(fields: [skuId], references: [skuId])

  @@index([skuId])
}
```

**Migration path:** Parse existing `specifications` strings (split on `,`, then on `:`) into `Specification` rows. The PDP already does this parsing client-side in `app/product/[skuId]/page.tsx` — move that logic to the seed/migration script.

### 4. CompatibilityMap Composite Key

**Current:** Has a redundant auto-incrementing `id` column.

**Target:** Drop `id`, use composite primary key.

```prisma
model CompatibilityMap {
  skuId             String
  variantId         Int      // renamed from compatibleModelId

  inventory         Inventory @relation(fields: [skuId], references: [skuId])
  variant           Variant   @relation(fields: [variantId], references: [id])

  @@id([skuId, variantId])   // Composite PK replaces auto-increment id
}
```

**Conceptual example:** One MagSafe ring (SKU: `MAG-939393`) connects to two device variants:
- Row 1: `MAG-939393` ↔ iPhone 17 E
- Row 2: `MAG-939393` ↔ iPhone 16 E

### 5. 4-Level Device Hierarchy

**Current:** `Brand → Model` (2 levels)

**Target:** `Brand → ModelType → Generation → Variant` (4 levels)

```prisma
model Brand {
  id         Int         @id @default(autoincrement())
  name       String      @unique
  modelTypes ModelType[]
}

model ModelType {
  id          Int          @id @default(autoincrement())
  brandId     Int
  name        String       // e.g., "iPhone", "Galaxy S"
  brand       Brand        @relation(fields: [brandId], references: [id])
  generations Generation[]
  @@unique([brandId, name])
}

model Generation {
  id          Int       @id @default(autoincrement())
  modelTypeId Int
  name        String    // e.g., "iPhone 15", "Galaxy S24"
  releaseYear Int?
  modelType   ModelType @relation(fields: [modelTypeId], references: [id])
  variants    Variant[]
  @@unique([modelTypeId, name])
}

model Variant {
  id             Int                @id @default(autoincrement())
  generationId   Int
  modelNumber    String             @unique  // e.g., "A3089"
  marketingName  String                       // e.g., "iPhone 15 Pro Max"
  generation     Generation         @relation(fields: [generationId], references: [id])
  compatibilities CompatibilityMap[]
}
```

> **Frontend impact:** The `FitmentChecker` component searches `compatibleModels[].modelNumber` and `compatibleModels[].marketingName`. This interface doesn't change — the server just needs to return the same shape from the deeper hierarchy.

### 6. NextAuth Tables

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String
  role          Role      @default(BUYER)
  accounts      Account[]
  sessions      Session[]
  cart          Cart[]
  orders        Order[]
  createdAt     DateTime  @default(now())
}

enum Role {
  BUYER
  ADMIN
}

model Account {
  // Standard NextAuth adapter fields
}

model Session {
  // Standard NextAuth adapter fields
}
```

### 7. Server-Side Cart & Orders

**Cart:** B2B shop managers build orders over multiple days/sessions. Cart must persist to their account.

```prisma
model Cart {
  id        Int      @id @default(autoincrement())
  userId    String
  skuId     String
  quantity  Int      @default(5)  // MOQ
  user      User     @relation(fields: [userId], references: [id])
  inventory Inventory @relation(fields: [skuId], references: [skuId])
  @@unique([userId, skuId])
}
```

**Orders:**

```prisma
model Order {
  id         Int         @id @default(autoincrement())
  userId     String
  status     OrderStatus @default(PENDING)
  total      Int         // cents
  user       User        @relation(fields: [userId], references: [id])
  lines      OrderLine[]
  createdAt  DateTime    @default(now())
}

model OrderLine {
  id                  Int    @id @default(autoincrement())
  orderId             Int
  skuId               String
  quantity            Int
  unitPriceAtPurchase Int    // Snapshot price in cents at time of order
  order               Order  @relation(fields: [orderId], references: [id])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
```

**Frontend strategy:** Keep client-side Zustand cart for instant UI updates. Sync to server-side `Cart` table on add/remove/quantity change. On checkout, convert `Cart` rows → `Order` + `OrderLine` rows.

---

## Frontend Work Remaining

### Priority 1: Build Verification

```bash
cd CellTech/ecomCell/ecomCell
npm install    # Requires network
npm run build  # Verify TypeScript compiles, no import errors
npm run dev    # Visual inspection
```

### Priority 2: Device Explorer Catalog

The `/catalog` page currently just renders the same `ProductsSection` used on the landing page. The approved design is a **two-panel layout**:

```
┌──────────────────┬──────────────────────────────────┐
│  SIDEBAR          │  PRODUCT GRID                    │
│                   │                                  │
│  Brand            │  [Card] [Card] [Card] [Card]    │
│  ├── Apple        │  [Card] [Card] [Card] [Card]    │
│  ├── Samsung      │                                  │
│  └── Google       │  Each card links to              │
│                   │  /product/[skuId]                │
│  Series           │                                  │
│  ├── iPhone 15    │                                  │
│  └── iPhone 16    │                                  │
│                   │                                  │
│  Model            │                                  │
│  ├── A3089        │                                  │
│  └── A3093        │                                  │
└──────────────────┴──────────────────────────────────┘
```

**Data source:** Need new API endpoint `GET /api/hierarchy` that returns the full `Brand → ModelType → Generation → Variant` tree. Or fetch `fetchBrands()` + `fetchModels(brandId)` progressively.

**Reference:** `Celltechupdate_2_extracted/Celltechupdate/deviceExplorer.md`

### Priority 3: Cart Drawer

A slide-out panel triggered by the cart icon in the nav. Should show:
- List of cart items with quantity controls
- Subtotals per item
- Total price
- "Proceed to Checkout" button
- "Clear Cart" option

**Uses:** `useCartStore` from `store/cartStore.ts`. The store already has `items`, `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `getTotalPrice`, `getTotalItems`.

### Priority 4: Checkout Flow

New route: `/checkout`

- Display cart contents (read from `useCartStore`)
- Collect shipping info
- Create order via backend API
- Show confirmation with order number
- Clear cart on success

### Priority 5: Wire Navigation Cart Badge

The nav currently shows a hardcoded `(0)` for cart count. Wire it to `useCartStore.getTotalItems()`. The nav is a client component so this is straightforward.

---

## Backend Work Remaining

### Priority 1: Schema Migration

1. Update `schema.prisma` with all changes above
2. Write migration script to:
   - Copy `skuId` → `partName` where `partName` is null
   - Parse `specifications` string → `Specification` rows
   - Map old `Model` entries into `ModelType → Generation → Variant` hierarchy
3. Run `npx prisma migrate dev`
4. Update `seed.ts` with new structure

### Priority 2: New API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/hierarchy` | GET | Full Brand→ModelType→Generation→Variant tree |
| `/api/variants/:variantId/parts` | GET | Parts for a specific variant |
| `/api/cart` | GET | Get user's server-side cart |
| `/api/cart` | POST | Add/update item in server cart |
| `/api/cart/:skuId` | DELETE | Remove item from server cart |
| `/api/cart/validate` | POST | Check stock + prices before checkout |
| `/api/checkout` | POST | Create order from cart |
| `/api/orders` | GET | User's order history |

### Priority 3: NextAuth Integration

1. Install `next-auth` and Prisma adapter
2. Add User, Account, Session to schema
3. Create `app/api/auth/[...nextauth]/route.ts`
4. Update `authStore.ts` to use NextAuth session instead of local state
5. Add middleware for protected routes (`/dashboard`, `/checkout`)

---

## Archive Reference Files

The extracted archive at `Celltechupdate_2_extracted/Celltechupdate/` contains additional reference material:

| File | Integrated? | Notes |
|------|-------------|-------|
| `page.tsx` (PDP) | ✅ Yes | Adapted into `app/product/[skuId]/page.tsx` |
| `FitmentChecker.tsx` | ✅ Yes | Copied to `components/product/` |
| `ProductGallery.tsx` | ✅ Yes | Copied to `components/product/` |
| `CompatibilityMatrix.tsx` | ✅ Yes | Copied to `components/product/` |
| `AddToCartButton.tsx` | ✅ Yes | Copied to `components/product/` |
| `products-section.tsx` | ✅ Yes | Merged into existing `components/products-section.tsx` |
| `spaChange.md` | ✅ Applied | Layout/routing guidance followed |
| `uIUpdate.md` | ⚠️ Partially | Structural guidance used; color descriptions are WRONG (describes light theme, code is dark) |
| `deviceExplorer.md` | ❌ Not yet | Two-panel catalog spec — next frontend priority |
| `api.ts` (archive) | ❌ Not yet | Has new functions: `getDeviceHierarchy`, `getPartsForVariant`, `fetchCategories`, `cartSync`, `cartValidate`, `checkout` |
| `schema.prisma` (archive) | ❌ Not yet | Has the 4-level hierarchy — reference for migration |
| `server.ts` (archive) | ❌ Not yet | Has expanded endpoints — reference for backend updates |
| `seed.ts` (archive) | ❌ Not yet | Has sample data for new schema |
| `deploy.sql` | ❌ Not yet | Raw SQL seed data |
| `successURL.md` | ❌ Not yet | Checkout success page spec |
| `all_products.xlsx` | ❌ Not yet | Supplier spreadsheet with real product data |

---

## Developer Onboarding Checklist

1. Read `AGENTS.md` — conventions, do's and don'ts
2. Read `ARCHITECTURE.md` — system design, layout pattern, data flow
3. Read this file (`NEXT_STEPS.md`) — what's done, what's next, schema spec
4. Run the frontend:
   ```bash
   cd CellTech/ecomCell/ecomCell
   npm install && npm run dev
   ```
5. Check the backend is responding:
   ```bash
   curl https://celltech-backend.vercel.app/api/health
   ```
6. Open http://localhost:3000 and verify:
   - Landing page has 5 sections (not 14)
   - Nav has 6 links (Catalog, Inventory, About, Quote, Support, Account)
   - `/about` shows quality, shipping, testimonials
   - `/product/[any-sku-id]` shows the PDP (or 404 if SKU doesn't exist in DB)
   - Product cards on home/catalog are clickable links

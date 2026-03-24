# CellTech Distributor — Architecture

> **Last updated:** 2026-03-24 · **Status:** Frontend restructure complete, schema migration pending

This document explains the architectural decisions, how the pieces fit together, and what limitations exist. A developer with no prior context should be able to understand the system and continue building it.

---

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│  FRONTEND — Next.js 15 App Router                          │
│  celltech-frontend/                                        │
│                                                            │
│  app/layout.tsx ← Persistent shell (Nav + Footer)          │
│  app/page.tsx   ← Home (5 sections, slimmed from 14)       │
│  app/about/     ← Quality + Shipping + Testimonials         │
│  app/catalog/   ← Filterable product grid                   │
│  app/inventory/ ← Full inventory table                      │
│  app/product/[skuId]/ ← PDP (gallery, fitment, specs, cart)│
│  app/quote/     ← Quote request form                        │
│  app/support/   ← Support & FAQ                             │
│  app/dashboard/ ← Account dashboard                         │
│                                                            │
│  Zustand stores: cartStore, appStore, authStore             │
│  API client: lib/api.ts (typed fetch wrappers)              │
└──────────────────────┬─────────────────────────────────────┘
                       │ HTTPS (fetch)
                       ▼
┌────────────────────────────────────────────────────────────┐
│  BACKEND — Express.js on Vercel                            │
│  celltech-backend/                                         │
│                                                            │
│  server.ts       ← 16 API endpoints                        │
│  schema.prisma   ← Prisma schema (PostgreSQL)              │
│  seed.ts         ← Sample data seeder                       │
│                                                            │
│  Deployed: https://celltech-backend.vercel.app              │
│  Database: Neon PostgreSQL (serverless)                     │
└────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Layout System (Persistent Shell)

As of 2026-03-24, the app uses a **single persistent layout** defined in `app/layout.tsx`. This was migrated from a pattern where each page manually imported `<Navigation />` and `<FooterSection />`.

```
app/layout.tsx
├── <html> with font CSS variables (Sora, Inter, IBM Plex Mono)
├── <body>
│   ├── <div className="flex flex-col min-h-screen bg-ct-bg">
│   │   ├── <Navigation />        ← Fixed sticky, scroll-aware, mobile responsive
│   │   ├── <main className="flex-1">
│   │   │   └── {children}        ← Page content renders here
│   │   └── <FooterSection />     ← Always visible at bottom
```

**Impact:** Individual pages (`app/*/page.tsx`) render ONLY their content. They do NOT import Navigation or FooterSection. The `components/RootLayout.tsx` wrapper component is now deprecated.

### 2.2 Route Structure

| Route | Type | Description |
|-------|------|-------------|
| `/` | Server Component | 5-section landing (was 14 sections, slimmed 2026-03-24) |
| `/about` | Server Component | Trust page: quality, shipping, testimonials |
| `/catalog` | Server Component | Product grid with category filters |
| `/inventory` | Client Component | Full inventory table with brand/model dropdowns |
| `/product/[skuId]` | Server Component | Product detail: gallery, fitment checker, specs, compatibility matrix, add-to-cart |
| `/quote` | Server Component | Quote request form |
| `/support` | Server Component | Support content |
| `/dashboard` | Server Component | Account dashboard |
| `/not-found` | Client Component | Animated 404 page |

### 2.3 State Management (Zustand)

Three stores, all client-side:

| Store | File | Purpose |
|-------|------|---------|
| `cartStore` | `store/cartStore.ts` | Shopping cart: `{sku, name, price, quantity, moq, image}` |
| `appStore` | `store/appStore.ts` | Notifications array, isDarkMode (default: true) |
| `authStore` | `store/authStore.ts` | User object, isLoggedIn, login/logout/register |

**Cart shape matters:** The `AddToCartButton` component in `components/product/` calls `useCartStore((s) => s.addItem)` with exactly the `CartItem` interface. Any schema changes to cart items must update both the store and the component.

### 2.4 API Client (`lib/api.ts`)

All backend communication goes through typed functions:

| Function | Endpoint | Used By |
|----------|----------|---------|
| `searchParts(device)` | `GET /api/parts?device=` | ProductsSection (home + catalog) |
| `getPartDetails(skuId)` | `GET /api/inventory/:skuId` | Product detail page (RSC) |
| `getCompatibility(skuId)` | `GET /api/compatibility/:skuId` | Available but not directly used (PDP builds from part data) |
| `fetchInventory()` | `GET /api/inventory` | Inventory page |
| `fetchBrands()` | `GET /api/brands` | Inventory page filters |
| `fetchModels(brandId?)` | `GET /api/models` | Inventory page filters |
| `fetchPartBySku(skuId)` | `GET /api/inventory/:skuId` | Alternate part lookup |
| `checkBackendHealth()` | `GET /api/health` | Health check |

Base URL: `process.env.NEXT_PUBLIC_API_URL || 'https://celltech-backend.vercel.app'`

---

## 3. Styling Architecture

### Three Layers

1. **CSS Variables** (`globals.css`) — HSL theme variables for shadcn/ui compatibility
2. **Tailwind Config** (`tailwind.config.js`) — `ct-*` hex color tokens, font families, custom shadows, animations
3. **Utility Classes** (`globals.css`) — Component-level CSS classes (`.heading-display`, `.btn-primary`, `.card-dark`, `.section-pinned`, `.product-card`, overlays)

### Design Token System

| Token | Hex | CSS Variable | Tailwind |
|-------|-----|-------------|----------|
| Background | `#070A12` | `--ct-bg` | `bg-ct-bg` |
| Card/Section BG | `#111725` | `--ct-bg-secondary` | `bg-ct-bg-secondary` |
| Accent (cyan) | `#00E5C0` | `--ct-accent` | `text-ct-accent` |
| Primary text | `#F2F5FA` | `--ct-text` | `text-ct-text` |
| Muted text | `#A7B1C6` | `--ct-text-secondary` | `text-ct-text-secondary` |

### Visual Effects

- **Grid overlay:** repeating 60px lines at 3% white opacity
- **Vignette:** radial gradient from transparent to dark edges
- **Noise:** SVG fractal noise at 4% opacity
- **Shadows:** `card` (heavy dark), `glow` (cyan #00E5C0 at 20%)
- **Borders:** `border-white/10` is the standard subtle separator

---

## 4. Backend Architecture (celltech-backend/)

### Current Schema (Prisma)

```
Brand (id, name)
  └── Model (id, brandId, modelNumber, marketingName, releaseYear)
        ├── Inventory (skuId, modelId?, categoryId, partName?, specifications?, qualityGrade?, wholesalePrice?, stockLevel)
        └── CompatibilityMap (id, skuId, compatibleModelId)
              └── Links Inventory ↔ Model (many-to-many)

Category (id, name)
  └── Inventory
```

### API Endpoints (server.ts)

The Express server exposes 16 endpoints. Key ones consumed by frontend:

- `GET /api/health` — Health check
- `GET /api/brands` — All brands
- `GET /api/models?brandId=` — Models, optionally filtered
- `GET /api/inventory` — All inventory items with relations
- `GET /api/inventory/:skuId` — Single part detail (includes compatibleModels)
- `GET /api/parts?device=` — Search parts by device name
- `GET /api/compatibility/:skuId` — Compatibility list for a SKU

### Pending Schema Migration (approved 2026-03-24)

Major changes are planned — see `NEXT_STEPS.md` for full details:

1. **Nullable fields fixed:** `wholesalePrice` → required (default 0), `qualityGrade` → required (enum adds `U`, `NA`), `partName` → required, `marketingName` → required
2. **Smart SKU buckets:** `[Bucket]-[Subcategory]-[Grade]-[Device]` (e.g., `3-C-O-IP13` = Functional Module / Battery / OEM / iPhone 13)
3. **Specification table:** Replaces pipe-delimited string with `(skuId, label, value)` rows
4. **CompatibilityMap fix:** Drop auto-increment `id`, use composite `@@id([skuId, variantId])`
5. **4-level device hierarchy:** Brand → ModelType → Generation → Variant
6. **NextAuth tables:** User, Account, Session
7. **Server-side Cart + Order tables:** For B2B multi-day quoting

---

## 5. Component Architecture

### Product Detail Components (`components/product/`)

Added 2026-03-24. These are client components used by the server-rendered `/product/[skuId]` page:

| Component | Props | Description |
|-----------|-------|-------------|
| `ProductGallery` | `partName, category, skuId` | Category-based image mapping, dark container with cyan glow, thumbnail strip, hover zoom |
| `FitmentChecker` | `compatibleModels[]` | Search input for model numbers, real-time match/no-match feedback with green/red states |
| `CompatibilityMatrix` | `models[]` | Accordion that expands to show all compatible device model numbers |
| `AddToCartButton` | `skuId, partName, price, stock, category` | Quantity selector (MOQ=5), subtotal display, "Added to Bench" confirmation animation |

### Section Components (Landing + About)

| Component | Used On | Type |
|-----------|---------|------|
| `hero-section` | `/` | Pinned 100vh |
| `categories-section` | `/` | Pinned 100vh |
| `products-section` | `/`, `/catalog` | Flowing, API-connected |
| `partners-section` | `/` | Flowing |
| `cta-section` | `/` | Pinned 100vh |
| `quality-section` | `/about` | Pinned 100vh |
| `shipping-section` | `/about` | Pinned 100vh |
| `testimonials-section` | `/about` | Flowing |
| `checkout-section` | Legacy (not on landing) | — |

---

## 6. Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| Pre-2026 | Migrated Vite SPA → Next.js 15 App Router | SEO, RSC, better routing |
| Pre-2026 | Dark industrial theme with ct-* tokens | B2B wholesale identity |
| 2026-03-24 | Moved Nav + Footer into `app/layout.tsx` | Single persistent shell, DRY |
| 2026-03-24 | Slimmed landing from 14 → 5 sections | Reduce infinite scroll |
| 2026-03-24 | Created `/about` route | Moved trust content off landing |
| 2026-03-24 | Added `/product/[skuId]` with 4 components | Full PDP from archive integration |
| 2026-03-24 | Product cards link to PDP | Previously static "Add to Quote" buttons |
| 2026-03-24 | Chose Option 3 integration | Archive components use same ct-* tokens — safe to drop in |

---

## 7. Known Limitations

1. **No build verification:** `npm install` requires network. The restructure has not been build-tested. Run `npm run build` when network is available.
2. **No authentication:** Login/Register UI exists in nav but is not functional. NextAuth integration is planned.
3. **Client-side cart only:** Cart state lives in Zustand (browser memory). Server-side persistence is planned for B2B multi-day quoting.
4. **No image CDN:** Product images use local placeholders. `ProductGallery` maps categories to static files in `public/images/`.
5. **Quote form is visual only:** Does not submit to backend.
6. **`RootLayout.tsx` is deprecated:** Still exists in `components/` but is unused. Safe to delete.
7. **Catalog page is basic:** Uses same `ProductsSection` component. Device Explorer two-panel layout is planned.
8. **Schema needs migration:** Current Prisma schema has nullable fields that should be required, uses auto-increment IDs where composites are better. See `NEXT_STEPS.md`.

# CellTech Distributor — Agent Guidelines

> **Last updated:** 2026-03-24 · **Revision:** 3 (post-frontend-restructure)

Read this before making changes. Every rule exists for a reason.

---

## 1. Project Identity

**What this is:** A B2B wholesale mobile repair parts platform. CellTech Distributor sells OEM-grade phone components (screens, batteries, boards, cameras) to repair shops at wholesale prices. The aesthetic is dense, industrial, and catalog-first.

**What this is NOT:**
- Not a consumer retail site — no pastel colors, no playful UX
- Not a static SPA — it's a **Next.js 15 App Router** project with server components
- Not a light theme — dark mode is the default and only theme

**Monorepo structure:**
```
CellTech/
├── Test/                     ← Backend (Express + Prisma + Neon PostgreSQL)
└── ecomCell/ecomCell/        ← Frontend (this project, Next.js)
```

---

## 2. Repository Layout (as of 2026-03-24) NOTE: THE BELOW IS OUTDATED AS OF 1:00 AM 3-25-2026 WHY? I (THE DEVELOPER) HAVE MOVED ALL DOCUMENTATION TO PARENT DIRECTORY FOLDER NAMED DOCUMENTS

```
ecomCell/ecomCell/               ← Project root (package.json lives here)
├── app/                         ← Next.js App Router
│   ├── layout.tsx               ← ROOT LAYOUT — persistent Nav + Footer shell
│   ├── page.tsx                 ← Home (Hero, Categories, Products, Partners, CTA)
│   ├── about/page.tsx           ← About (Quality, Shipping, Testimonials)
│   ├── catalog/page.tsx         ← Parts catalog grid
│   ├── inventory/page.tsx       ← Inventory table (client component)
│   ├── product/[skuId]/page.tsx ← Product detail page (server component)
│   ├── quote/page.tsx           ← Quote request form
│   ├── support/page.tsx         ← Support & FAQ
│   ├── dashboard/page.tsx       ← Account dashboard
│   ├── not-found.tsx            ← 404 page
│   └── globals.css              ← Theme variables, utility classes, overlays
├── components/
│   ├── navigation.tsx           ← Persistent sticky nav
│   ├── footer-section.tsx       ← Multi-column footer
│   ├── products-section.tsx     ← Product cards (links to /product/[skuId])
│   ├── product/                 ← Product detail sub-components
│   │   ├── FitmentChecker.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── CompatibilityMatrix.tsx
│   │   └── AddToCartButton.tsx
│   ├── hero-section.tsx
│   ├── categories-section.tsx
│   ├── partners-section.tsx
│   ├── cta-section.tsx
│   ├── quality-section.tsx      ← Used on /about
│   ├── shipping-section.tsx     ← Used on /about
│   ├── testimonials-section.tsx ← Used on /about
│   ├── quote-section.tsx        ← Used on /quote
│   ├── support-section.tsx      ← Used on /support
│   ├── dashboard-section.tsx    ← Used on /dashboard
│   ├── checkout-section.tsx     ← Legacy (not currently routed)
│   ├── RootLayout.tsx           ← ⚠️ DEPRECATED — do not use
│   ├── ErrorBoundary.tsx
│   ├── Skeleton.tsx
│   ├── forms/                   ← Form components
│   └── ui/                      ← shadcn/ui primitives
├── store/
│   ├── cartStore.ts             ← Cart: {sku, name, price, quantity, moq, image}
│   ├── appStore.ts              ← Notifications, dark mode flag
│   └── authStore.ts             ← User, login/logout/register
├── lib/
│   ├── api.ts                   ← Typed API client (20+ functions)
│   └── utils.ts                 ← cn() class merging helper
├── hooks/                       ← Custom React hooks
├── public/images/               ← Static product images & placeholders
├── tailwind.config.js           ← Design system (ct-* tokens)
├── package.json
├── tsconfig.json
├── next.config.ts
├── AGENTS.md                    ← THIS FILE
├── ARCHITECTURE.md              ← Full architecture doc
├── README.md                    ← Project overview
└── NEXT_STEPS.md                ← Schema migration & remaining work
```

**Path alias:** `@/*` resolves to `./*`. All imports use `@/components/...`, `@/store/...`, `@/lib/...`.

---

## 3. Critical Conventions

### Layout

**Navigation and Footer are in `app/layout.tsx` — they render ONCE and persist across all routes.**

Pages render ONLY their content. Do NOT add `<Navigation />` or `<FooterSection />` to any page component. The root layout wraps every page automatically.

```tsx
// ✅ CORRECT — page renders only its content
export default function SomePage() {
  return <div className="pt-16">My content</div>;
}

// ❌ WRONG — do not import Nav/Footer in pages
export default function SomePage() {
  return (
    <div>
      <Navigation />    {/* NO — already in layout.tsx */}
      <main>Content</main>
      <FooterSection /> {/* NO — already in layout.tsx */}
    </div>
  );
}
```

### Design System Tokens

```css
/* Dark theme — all colors are hex, not HSL */
ct-bg:             #070A12     /* Page background */
ct-bg-secondary:   #111725     /* Section/card backgrounds */
ct-accent:         #00E5C0     /* Primary accent (cyan-green) */
ct-text:           #F2F5FA     /* Primary text */
ct-text-secondary: #A7B1C6     /* Muted text */
```

### Fonts

```
font-display  → Sora       (headings, uppercase, tight tracking)
font-body     → Inter      (body copy)
font-mono     → IBM Plex Mono  (SKUs, labels, micro text, uppercase tracking)
```

### Borders, Shadows, Effects

- Standard subtle border: `border-white/10`
- Accent glow: `shadow-[0_0_12px_rgba(0,229,192,0.2)]`
- Cards: `bg-ct-bg-secondary border border-white/10 rounded-2xl`
- Status dots: `bg-green-400 animate-pulse` (in stock), `bg-red-400` (out)

---

## 4. Styling Rules

1. **Use `ct-*` Tailwind colors** — never hardcode hex values in JSX
2. **Custom CSS classes live in `globals.css`** — not in component files
3. **Use `cn()` from `@/lib/utils`** for conditional class merging
4. **Fonts via Tailwind** — `font-display`, `font-body`, `font-mono`
5. **Responsive** — mobile-first: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`
6. **Z-index layers** — grid:1, vignette:2, noise:3, nav:50, sections:10-130

---

## 5. Component Patterns

### Section Components

```tsx
"use client";

import { useEffect, useRef, useState } from 'react';

export function SectionName() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section-flowing py-20 lg:py-32">
      {/* Content with isVisible-gated animations */}
    </section>
  );
}
```

### Product Components (`components/product/`)

These are **client components** rendered inside the **server component** PDP (`app/product/[skuId]/page.tsx`). The server component fetches data via `getPartDetails(skuId)` and passes props down.

Data flow: `getPartDetails(skuId)` → server component parses → client components receive typed props.

### Cart Integration

`AddToCartButton` calls `useCartStore((s) => s.addItem)` with:
```ts
{ sku: string, name: string, price: number, quantity: number, moq: number, image: string }
```

---

## 6. API Client (`lib/api.ts`)

All backend calls use typed wrappers. Base URL defaults to `https://celltech-backend.vercel.app`.

Key functions:
- `searchParts(device)` — Product grid (home + catalog)
- `getPartDetails(skuId)` — PDP server component
- `fetchInventory()` — Inventory table
- `fetchBrands()` / `fetchModels()` — Inventory filters

**Do NOT make raw `fetch()` calls from components.** Always use or extend `lib/api.ts`.

---

## 7. Rules for Agents

### Do

- ✅ Add new routes as `app/routename/page.tsx` — they automatically get Nav + Footer
- ✅ Use `ct-*` Tailwind colors for consistency
- ✅ Use Framer Motion for animations (already a dependency)
- ✅ Use the typed API client in `lib/api.ts` for all backend calls
- ✅ Keep the dark theme
- ✅ Add product sub-components to `components/product/`
- ✅ Use `pt-16` on page content to clear the fixed nav

### Don't

- ❌ Don't add `<Navigation />` or `<FooterSection />` to page components
- ❌ Don't use `components/RootLayout.tsx` — it's deprecated
- ❌ Don't rename or remove `ct-*` color tokens in `tailwind.config.js`
- ❌ Don't hardcode hex colors in JSX — use Tailwind classes
- ❌ Don't break the z-index layer system
- ❌ Don't add backend code (API routes, database) in the frontend repo
- ❌ Don't remove animation patterns from existing sections
- ❌ Don't use mock/placeholder data where API functions exist
- ❌ Don't use shadcn/ui components without a reason — custom CSS classes preferred

---

## 8. Context Files for Future Sessions

**Always include:**
- `AGENTS.md` (this file)
- `ARCHITECTURE.md`
- `NEXT_STEPS.md`
- `app/layout.tsx` (persistent shell)
- `app/page.tsx` (home page)
- `lib/api.ts` (API client)

**For styling work:**
- `tailwind.config.js`
- `app/globals.css`

**For product detail work:**
- `app/product/[skuId]/page.tsx`
- `components/product/*.tsx`
- `store/cartStore.ts`

**For backend/schema work:**
- `CellTech/Test/schema.prisma`
- `CellTech/Test/server.ts`
- `NEXT_STEPS.md` (has the full schema migration spec)

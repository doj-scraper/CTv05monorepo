# CellTech UI System Guide

> **Purpose:** This document is the working source of truth for the CellTech frontend UI kit, design tokens, component layering model, page flow, and phased build order. It is intentionally practical: a developer should be able to read this file, find the right component family, and continue building without re-learning the entire frontend.

---

## 1. Current UI Architecture Snapshot

**Frontend root:** `celltech-frontend/`

### Main buckets
- `app/` — Next.js App Router pages and layout shell
- `components/ui/` — low-level primitives (largely shadcn/Radix based)
- `components/forms/` — branded form abstractions and validation-oriented fields
- `components/product/` — commerce-specific product detail UI
- `components/` — page sections, navigation, footer, and shared presentation blocks
- `store/` — Zustand stores for cart, auth, and app-level state
- `lib/` — API client, utils, validation

### Current component counts
- `components/ui/`: **53** primitive components
- `components/forms/`: **9** form-oriented components
- `components/product/`: **5** product-domain components
- `components/` root: **17** route/section/shared components

### Architectural reality
The frontend currently has **two UI systems coexisting**:
1. **Primitive system** — shadcn/Radix-style components in `components/ui/`
2. **Branded section system** — custom CSS utility classes in `app/globals.css` such as `.btn-primary`, `.product-card`, `.filter-chip`, `.dashboard-card`, and `.input-dark`

That is not inherently bad, but it means the UI kit should standardize **which layer owns what**.

---

## 2. Design Foundations

### 2.1 Brand positioning
The current visual direction reads as:
- professional B2B wholesale ecommerce
- dark lab-tech interface
- high-contrast accent cues for actionable states
- clean, slightly futuristic presentation
- serious tone rather than playful consumer retail

This aligns well with the product goal: a polished wholesale alternative to less refined competitors.

### 2.2 Core color tokens
These tokens are already present in Tailwind and CSS.

| Token | Value | Use |
|---|---:|---|
| `ct-bg` | `#070A12` | global page background / primary dark canvas |
| `ct-bg-secondary` | `#111725` | cards, input backgrounds, elevated panels |
| `ct-accent` | `#00E5C0` | CTA, highlight, active state, focus emphasis |
| `ct-text` | `#F2F5FA` | primary foreground text |
| `ct-text-secondary` | `#A7B1C6` | secondary copy, labels, nav links |

### 2.3 Semantic HSL variables
Defined in `celltech-frontend/app/globals.css`.

```css
:root {
  --background: 220 35% 4%;
  --foreground: 220 20% 97%;
  --card: 220 30% 8%;
  --card-foreground: 220 20% 97%;
  --popover: 220 30% 8%;
  --popover-foreground: 220 20% 97%;
  --primary: 168 100% 45%;
  --primary-foreground: 220 35% 4%;
  --secondary: 220 25% 12%;
  --secondary-foreground: 220 20% 97%;
  --muted: 220 25% 12%;
  --muted-foreground: 220 15% 70%;
  --accent: 168 100% 45%;
  --accent-foreground: 220 35% 4%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 220 15% 18%;
  --input: 220 15% 18%;
  --ring: 168 100% 45%;
  --radius: 0.625rem;
}
```

### 2.4 Typography tokens
Defined via `next/font/google` in `celltech-frontend/app/layout.tsx`.

| Role | Font | Variable | Use |
|---|---|---|---|
| Display | `Sora` | `--font-sora` | hero headings, page headings, section headings |
| Body | `Inter` | `--font-inter` | paragraphs, labels, buttons, nav |
| Mono | `IBM Plex Mono` | `--font-ibm-plex-mono` | SKU, technical metadata, counters, micro labels |

### 2.5 Typography conventions
Current CSS conventions:

```css
.heading-display {
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 0.95;
}

.text-micro {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 500;
  letter-spacing: 0.12em;
  font-size: 12px;
  text-transform: uppercase;
}
```

**Recommended usage:**
- `Sora`: only for page/section emphasis and branded titles
- `Inter`: default for readable content and controls
- `IBM Plex Mono`: only for SKU, metadata, order counts, technical references, and instrumentation-like labels

### 2.6 Radius, shadow, and surface tokens
From Tailwind and global CSS:

- Base radius token: `--radius: 0.625rem`
- Large surfaces generally use `rounded-xl` or `rounded-2xl`
- Accent glow: `0 0 20px rgba(0, 229, 192, 0.2)`
- Dashboard shadow: `0 18px 50px rgba(0, 0, 0, 0.45)`

### 2.7 Motion patterns
Existing motion patterns should be kept subtle and purposeful.

| Motion | Existing implementation | Intended effect |
|---|---|---|
| `border-pulse` | keyframe | low-level alive/active emphasis |
| `float` | keyframe | soft lift for promo cards and panels |
| `drift` | keyframe | ambient image motion |
| hover translate | buttons/cards | tactile responsiveness |
| fade/slide-in | Framer Motion / CSS transitions | section reveal |

**Rule:** motion should support clarity, not showmanship.

---

## 3. Existing Design-System Layers

This project should be grouped into the following reusable layers.

### 3.1 Layer A — Foundations / Tokens
**Source files:**
- `celltech-frontend/app/globals.css`
- `celltech-frontend/tailwind.config.js`
- `celltech-frontend/app/layout.tsx`

**Owns:**
- colors
- typography
- radius
- spacing rhythm
- shadows
- base animation language
- shell behavior

### 3.2 Layer B — Primitives (Atoms)
**Primary location:** `celltech-frontend/components/ui/`

Examples:
- `button.tsx`
- `input.tsx`
- `textarea.tsx`
- `label.tsx`
- `checkbox.tsx`
- `badge.tsx`
- `spinner.tsx`
- `skeleton.tsx`
- `separator.tsx`
- `tooltip.tsx`
- `progress.tsx`
- `avatar.tsx`
- `kbd.tsx`

**Guideline:** these should remain generic and brand-light where possible.

### 3.3 Layer C — Branded Atoms / Form Controls
**Primary location:** `celltech-frontend/components/forms/`

Examples:
- `FormInput.tsx`
- `FormSelect.tsx`
- `FormCheckbox.tsx`
- `FormTextarea.tsx`
- `FormRadio.tsx`
- `PhoneInput.tsx`
- `PasswordStrength.tsx`

**Guideline:** use this layer when you need CellTech-specific labels, validation, hint text, success/error display, and form ergonomics.

### 3.4 Layer D — Molecules
**Current / likely molecules:**
- `AddToCartButton.tsx`
- `input-group.tsx`
- `button-group.tsx`
- `breadcrumb.tsx`
- `pagination.tsx`
- `command.tsx`
- future `StatusBadge`, `EmptyState`, `ErrorState`, `CartBadge`, `ProductCard`

**Guideline:** molecules combine 2–5 atoms into a reusable interaction block.

### 3.5 Layer E — Organisms
**Current examples:**
- `ProductGallery.tsx`
- `FitmentChecker.tsx`
- `CompatibilityMatrix.tsx`
- `AddressForm.tsx`
- `navigation.tsx`
- `footer-section.tsx`
- future `CartDrawer`, `InventoryTable`, `QuoteRequestForm`, `SupportResourceList`

**Guideline:** organisms can own state, layout, and local interaction complexity.

### 3.6 Layer F — Sections / Templates
**Primary location:** `celltech-frontend/components/`

Examples:
- `hero-section.tsx`
- `categories-section.tsx`
- `products-section.tsx`
- `partners-section.tsx`
- `cta-section.tsx`
- `quality-section.tsx`
- `shipping-section.tsx`
- `testimonials-section.tsx`
- `quote-section.tsx`
- `support-section.tsx`
- `dashboard-section.tsx`
- `checkout-section.tsx`

**Guideline:** these are page-composition units, not low-level reusable primitives.

### 3.7 Layer G — Pages / Routes
**Primary location:** `celltech-frontend/app/`

Routes currently include:
- `/`
- `/about`
- `/catalog`
- `/inventory`
- `/product/[skuId]`
- `/quote`
- `/support`
- `/dashboard`

**Guideline:** pages should compose sections and organisms, not inline large chunks of bespoke UI unless absolutely necessary.

---

## 4. Current Component Grouping by Folder

### 4.1 `components/ui/` — base primitives (53 files)
Treat this folder as the **system substrate**. It already contains enough primitives to support a mature UI kit.

Recommended mental grouping:

**Inputs & form primitives**
- `input.tsx`, `textarea.tsx`, `checkbox.tsx`, `select.tsx`, `radio-group.tsx`, `switch.tsx`, `calendar.tsx`, `input-otp.tsx`, `field.tsx`, `form.tsx`

**Actions & navigation**
- `button.tsx`, `button-group.tsx`, `pagination.tsx`, `breadcrumb.tsx`, `navigation-menu.tsx`, `menubar.tsx`, `dropdown-menu.tsx`, `context-menu.tsx`, `tabs.tsx`, `toggle.tsx`, `toggle-group.tsx`

**Layout & surfaces**
- `card.tsx`, `accordion.tsx`, `collapsible.tsx`, `resizable.tsx`, `scroll-area.tsx`, `sidebar.tsx`, `separator.tsx`, `sheet.tsx`, `drawer.tsx`, `dialog.tsx`, `popover.tsx`, `hover-card.tsx`

**Feedback & state**
- `alert.tsx`, `alert-dialog.tsx`, `progress.tsx`, `spinner.tsx`, `skeleton.tsx`, `sonner.tsx`, `empty.tsx`

**Data display**
- `table.tsx`, `chart.tsx`, `carousel.tsx`, `avatar.tsx`, `badge.tsx`, `item.tsx`, `label.tsx`, `kbd.tsx`

### 4.2 `components/forms/` — branded form abstractions
Use these where business forms matter more than raw UI primitives.

- `FormInput.tsx`
- `FormSelect.tsx`
- `FormCheckbox.tsx`
- `FormTextarea.tsx`
- `FormRadio.tsx`
- `PhoneInput.tsx`
- `AddressForm.tsx`
- `PasswordStrength.tsx`
- `index.ts`

### 4.3 `components/product/` — commerce-specific blocks
These belong to the product domain layer rather than the generic design system.

- `ProductGallery.tsx`
- `FitmentChecker.tsx`
- `CompatibilityMatrix.tsx`
- `AddToCartButton.tsx`
- `product-search-example.tsx` *(reference/example; likely not production UI)*

### 4.4 `components/` root — sections and shell pieces
These are route-level or landing-page composition blocks.

**Shell & error handling**
- `navigation.tsx`
- `footer-section.tsx`
- `ErrorBoundary.tsx`
- `Skeleton.tsx`
- `RootLayout.tsx` *(deprecated according to repo notes; app router layout is canonical)*

**Marketing / storytelling sections**
- `hero-section.tsx`
- `categories-section.tsx`
- `products-section.tsx`
- `partners-section.tsx`
- `cta-section.tsx`
- `quality-section.tsx`
- `shipping-section.tsx`
- `testimonials-section.tsx`

**Product workflow sections**
- `quote-section.tsx`
- `support-section.tsx`
- `dashboard-section.tsx`
- `checkout-section.tsx`

---

## 5. Where Components Are Deployed Today

This section exists for the exact reason you mentioned: someone drops the project for a while, comes back, and cannot remember what is mounted where.

### 5.1 App shell
- `app/layout.tsx`
  - mounts `Navigation`
  - renders page `children`
  - mounts `FooterSection`

### 5.2 Home / Landing (`app/page.tsx`)
Mounted sections:
- `HeroSection`
- `CategoriesSection`
- `ProductsSection`
- `PartnersSection`
- `CTASection`

### 5.3 About (`app/about/page.tsx`)
Primarily uses:
- `QualitySection`
- `ShippingSection`
- `TestimonialsSection`

### 5.4 Catalog (`app/catalog/page.tsx`)
Currently mounts:
- `ProductsSection`

### 5.5 Inventory (`app/inventory/page.tsx`)
Currently uses **inline page UI** rather than extracted table/filter organisms.

This page is a strong candidate for future extraction into:
- `PageHero`
- `InventoryFilters`
- `InventoryTable`
- `InventoryEmptyState`
- `InventoryErrorState`

### 5.6 Product Detail (`app/product/[skuId]/page.tsx`)
Uses or is expected to use:
- `ProductGallery`
- `FitmentChecker`
- `CompatibilityMatrix`
- `AddToCartButton`

This is currently the strongest example of a page composed from domain-specific organisms.

### 5.7 Quote (`app/quote/page.tsx`)
Currently mounts:
- `QuoteSection`

This should eventually break into:
- `PageHero`
- `QuoteRequestForm`
- `QuoteSummaryCard`
- `ResponseTimeBadge`

### 5.8 Support (`app/support/page.tsx`)
Currently mounts:
- `SupportSection`

This should eventually break into:
- `SupportResourceList`
- `ResourceCard`
- `SupportCTA`

### 5.9 Dashboard (`app/dashboard/page.tsx`)
Currently mounts:
- `DashboardSection`

This is still a presentation shell, not a real account application surface.

---

## 6. Current Page Flows

### 6.1 Primary commerce flow
```text
HOME / LANDING
  -> Catalog teaser / search intent
  -> /catalog
  -> /product/[skuId]
  -> Add to Cart / Add to Bench
  -> Cart Drawer (planned)
  -> Checkout (planned)
  -> Order confirmation / account tracking (planned)
```

### 6.2 B2B quote flow
```text
HOME or PRODUCT
  -> /quote
  -> Quote request form
  -> Submitted request state
  -> Sales / support follow-up
```

### 6.3 Support flow
```text
HOME or PRODUCT or ORDER STATE
  -> /support
  -> resource links / guides / troubleshooting
  -> support contact / ticket workflow (future)
```

### 6.4 Account flow
```text
Navigation Account entry
  -> /dashboard
  -> auth shell / account overview
  -> orders / saved lists / team management (future)
```

### 6.5 Device / inventory exploration flow
```text
Navigation Inventory
  -> /inventory
  -> brand filter
  -> model filter
  -> inventory results table
  -> select SKU / navigate to product page (future enhancement)
```

---

## 7. Backend Touch Points That Matter to UI

This is the minimum backend context that frontend/UI developers should keep in mind.

### 7.1 Existing frontend API usage
`celltech-frontend/lib/api.ts` currently targets endpoints like:
- `/api/inventory`
- `/api/inventory/model/:id`
- `/api/inventory/:skuId`
- `/api/brands`
- `/api/models`
- `/api/parts?device=...`
- `/api/compatibility/:skuId`
- `/api/health`

### 7.2 UI areas that are backend-sensitive
These should be designed as shells first, wired second:
- checkout flow
- account dashboard
- auth modal/pages
- quote submission confirmation state
- advanced catalog/device explorer
- support ticket creation

### 7.3 UI areas that are safe to build now
These are low-risk because they do not depend on final backend contracts:
- `PageHero`
- `StatusBadge`
- `EmptyState`
- `ErrorState`
- `ProductCard`
- `CartBadge`
- `CartDrawer` *(using Zustand first)*
- `QuoteRequestForm` UI shell
- `Support Resource Card`
- `InventoryTable` shell
- `FilterBar` shell

### 7.4 Domain rules the UI must respect
From existing code and docs, the frontend should be built assuming:
- SKU is a first-class identifier
- MOQ matters in cart/order interactions
- compatibility is central to purchase confidence
- brand -> model navigation is a core discovery path
- future account flows will likely include team/role behavior

---

## 8. Current Strengths and Current Friction

### 8.1 Strengths
- strong visual identity already exists
- serious B2B tone is consistent
- route structure is understandable
- product detail UI already points toward a real commerce app
- primitive library depth is excellent
- form foundation is better than the current quote page makes use of

### 8.2 Friction points
- two competing button/input systems exist (`components/ui` vs branded CSS classes)
- some pages still use inline ad hoc UI instead of extracted organisms
- route sections and reusable components are mixed together in `components/`
- cart and auth are visually represented but not fully productized
- some presentation pages are still demo-like shells rather than full app surfaces

### 8.3 Most obvious standardization targets
1. Buttons
2. Inputs
3. Card variants
4. Empty/error/loading states
5. Page hero/header pattern
6. Filter bar pattern

---

## 9. Proposed UI Kit Structure (Recommended)

If you continue building a formal UI kit, this is the structure I would target conceptually.

```text
Foundations
  Tokens
  Typography
  Motion
  Elevation
  Spacing

Atoms
  Button
  Input
  Textarea
  Label
  Badge
  IconButton
  Spinner
  Skeleton

Molecules
  FormField
  SearchField
  StatusBadge
  CartBadge
  FilterChip
  ProductMetaRow
  ResourceLinkCard
  EmptyState
  ErrorState

Organisms
  Navigation
  Footer
  ProductCard
  ProductGallery
  AddToCartPanel
  FitmentChecker
  CompatibilityMatrix
  QuoteRequestForm
  CartDrawer
  InventoryTable
  SupportResourceList

Templates
  MarketingSection
  DetailPageLayout
  DashboardShell
  CatalogShell

Pages
  Home
  Catalog
  Inventory
  Product
  Quote
  Support
  Dashboard
```

---

## 10. Recommended Build Order / Phased UI Plan

### Phase 0 — Stabilize the system surface
**Goal:** reduce fragmentation before adding too many new patterns.

Build or standardize:
- `PageHero`
- `StatusBadge`
- `EmptyState`
- `ErrorState`
- `LoadingSkeleton` family
- `SectionWrapper` or a documented section convention

### Phase 1 — Commerce basics
**Goal:** make the storefront feel real before full backend completion.

Build:
- `ProductCard`
- `CartBadge`
- `CartDrawer`
- `InventoryTable`
- `FilterBar` / `CatalogFilters`

### Phase 2 — Forms and request workflows
**Goal:** professionalize buyer interactions.

Build:
- `QuoteRequestForm` using shared form components
- `QuoteSummaryCard`
- `FormSectionHeader`
- `InlineFieldMessage`

### Phase 3 — Support and trust surfaces
**Goal:** reinforce B2B confidence and post-purchase support.

Build:
- `ResourceLinkCard`
- `SupportResourceList`
- `InstallGuideCard`
- `PolicySummaryCard`

### Phase 4 — Account and checkout shells
**Goal:** prepare for auth and Stripe without overcommitting to backend details.

Build shells for:
- `LoginDialog`
- `RegisterDialog`
- `DashboardSummaryCards`
- `CheckoutSummary`
- `AddressStep`
- `PaymentStepShell`

### Phase 5 — Final integration pass
**Goal:** replace mock shell behavior with real service wiring.

Wire to backend:
- cart persistence
- auth/session state
- quote submission
- checkout session creation
- order history
- support workflows

---

## 11. Concrete Frontend UI Backlog

### High-value, safe-now backlog
- [ ] Extract `ProductCard` from `products-section.tsx`
- [ ] Add `CartBadge` to `navigation.tsx`
- [ ] Build `CartDrawer` using `store/cartStore.ts`
- [ ] Create `EmptyState` and use it in inventory/catalog states
- [ ] Create `ErrorState` and use it in inventory/data-fetch routes
- [ ] Create `PageHero` and refactor quote/support/dashboard/inventory headers
- [ ] Rebuild `QuoteSection` around shared form components
- [ ] Extract `InventoryFilters` from `app/inventory/page.tsx`
- [ ] Extract `InventoryTable` from `app/inventory/page.tsx`

### Medium-priority cleanup backlog
- [ ] Standardize button usage (`Button` component vs `.btn-primary`)
- [ ] Standardize input usage (`FormInput` / `Input` / `.input-dark`)
- [ ] Consolidate card styles into named variants
- [ ] Audit deprecated `RootLayout.tsx` usage and remove if unused
- [ ] Decide whether `product-search-example.tsx` is example-only or should be promoted into real UI

### Later, backend-aware backlog
- [ ] Checkout flow UI wired to Stripe
- [ ] Auth UI wired to NextAuth or Clerk
- [ ] Dashboard data views
- [ ] Saved lists / reorder flows
- [ ] Support ticket creation flow

---

## 12. Suggested Naming Rules Going Forward

### Use these suffixes consistently
- `*Button` — atomic or compact actions
- `*Badge` — status/meta labels
- `*Field` — a single interactive form field
- `*Card` — self-contained surfaced content block
- `*List` — repeated list wrapper
- `*Table` — structured tabular display
- `*Drawer` / `*Sheet` — slide-over surfaces
- `*Section` — route composition / narrative block
- `*Shell` — application layout wrapper
- `*Panel` — dense surfaced region inside a page

### Folder intent
- `components/ui/` = generic reusable primitives
- `components/forms/` = branded form building blocks
- `components/product/` = ecommerce/product domain UI
- `components/` = route-level compositions and shell pieces

---

## 13. HTML / React Examples for the UI Kit

### 13.1 Example: primary CTA button
**Current visual target:** accent-filled, dark text, rounded pill

```html
<button class="btn-primary">Request Pricing</button>
```

**Preferred future React abstraction:**

```tsx
<Button className="rounded-full bg-ct-accent text-ct-bg hover:shadow-glow">
  Request Pricing
</Button>
```

### 13.2 Example: branded input field
```tsx
<FormInput
  id="company"
  label="Company"
  placeholder="Your company name"
  hint="Used on invoices and quote responses"
/>
```

### 13.3 Example: product card shell
```tsx
<article className="product-card">
  <div className="aspect-square bg-ct-bg-secondary/50" />
  <div className="p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-micro text-ct-text-secondary font-mono">SKU-123</span>
      <span className="badge">In Stock</span>
    </div>
    <h3 className="text-ct-text font-medium text-sm mb-1">Premium Display Assembly</h3>
    <div className="flex items-center justify-between">
      <span className="text-ct-accent font-semibold">$49.99</span>
      <span className="text-micro text-ct-text-secondary">MOQ: 5</span>
    </div>
  </div>
</article>
```

### 13.4 Example: page hero
```tsx
<section className="pt-16 pb-8 px-6 lg:px-12">
  <p className="text-micro text-ct-text-secondary mb-3">Wholesale Operations</p>
  <h1 className="heading-display text-3xl sm:text-4xl lg:text-5xl text-ct-text mb-2">
    PARTS <span className="text-ct-accent">INVENTORY</span>
  </h1>
  <p className="text-ct-text-secondary text-sm lg:text-base max-w-2xl">
    Browse our complete database of wholesale cell phone parts and components.
  </p>
</section>
```

### 13.5 Example: error state card
```tsx
<div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
  <p className="font-semibold">Error Loading Inventory</p>
  <p className="mt-1 text-sm">The inventory service is currently unavailable.</p>
</div>
```

---

## 14. Practical Rules for Anyone Building the UI Kit

1. **Do not build route sections before stabilizing primitives.**
2. **Prefer extraction over duplication.** If the same header or card appears twice, it should probably become a component.
3. **Separate domain UI from universal UI.** `ProductGallery` is product-domain, `Button` is universal.
4. **Keep backend-aware components shell-first.** Design them so wiring can happen later.
5. **Respect the typography contract.** Display for emphasis, Inter for reading, mono for technical context.
6. **Use accent sparingly.** The cyan accent works because it is selective.
7. **Preserve B2B seriousness.** Avoid over-ornamentation and flashy consumer-store tropes.

---

## 15. Immediate Recommendation

If you personally begin building a formal UI kit while the rest of the team keeps shipping product work, start here in this order:

1. `PageHero`
2. `StatusBadge`
3. `EmptyState`
4. `ErrorState`
5. `ProductCard`
6. `CartBadge`
7. `CartDrawer`
8. `QuoteRequestForm`

That order gives you the highest leverage with the least backend risk.

---

## 16. Related Files to Read Next

- `DOCS/ARCHITECTURE.md`
- `DOCS/NEXT_STEPS.md`
- `celltech-frontend/app/globals.css`
- `celltech-frontend/tailwind.config.js`
- `celltech-frontend/components/navigation.tsx`
- `celltech-frontend/components/products-section.tsx`
- `celltech-frontend/components/forms/FormInput.tsx`
- `celltech-frontend/components/product/AddToCartButton.tsx`

---

**Status of this document:** useful now, expected to evolve as the backend reset and storefront hardening continue.

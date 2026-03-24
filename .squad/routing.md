# Work Routing

How to decide who handles what.

## Routing Table

| Work Type | Route To | Examples |
|-----------|----------|----------|
| UI, components, styling, app router pages | Rusty | Next.js pages, Tailwind, client state, responsive storefront work |
| API routes, backend services, auth, checkout, Stripe, Prisma | Linus | REST endpoints, auth flows, payments, service integration |
| Database schema, migrations, full-text search, Smart SKU modeling | Yen | Prisma schema, PostgreSQL design, query tuning, search |
| Code review | Danny | Review PRs, check quality, suggest improvements |
| Testing, QA, regression coverage, browser checks | Saul | Vitest, React Testing Library, Playwright, flaky test fixes |
| CI/CD, deployment, repo split, infra | Basher | GitHub Actions, Vercel, environment setup, build/deploy pipelines |
| Scope, sequencing, architecture, priorities | Danny | Trade-offs, dependency order, reviewer gates, team coordination |
| Session logging | Scribe | Automatic — never needs routing |

## Issue Routing

| Label | Action | Who |
|-------|--------|-----|
| `squad` | Triage: analyze issue, assign `squad:{member}` label | Danny |
| `squad:{name}` | Pick up issue and complete the work | Named member |

### How Issue Assignment Works

1. When a GitHub issue gets the `squad` label, Danny triages it — analyzing content, assigning the right `squad:{member}` label, and commenting with triage notes.
2. When a `squad:{member}` label is applied, that member picks up the issue in their next session.
3. Members can reassign by removing their label and adding another member's label.
4. The `squad` label is the inbox — untriaged issues waiting for Lead review.

## Rules

1. Eager by default — spawn all agents who could usefully start work, including anticipatory downstream work.
2. Scribe always runs after substantial work, always as `mode: "background"`. Never blocks.
3. Quick facts go to the coordinator directly. Don't spawn an agent for a trivial status check.
4. When two agents could handle it, pick the one whose domain is the primary concern.
5. "Team, ..." means fan-out: spawn all relevant agents in parallel as `mode: "background"`.
6. Anticipate downstream work. If a feature is being built, spawn the tester to write test cases from requirements simultaneously.
7. Issue-labeled work — when a `squad:{member}` label is applied to an issue, route to that member. The Lead handles all `squad` (base label) triage.

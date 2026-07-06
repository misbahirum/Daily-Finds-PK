# Daily Finds PK

A mobile-first affiliate landing page for the Pakistani audience — curated home, kitchen, and lifestyle deals with a built-in admin panel and localStorage persistence.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

- **Homepage** (`/`): Hero, category filter bar, real-time search, product grid with badges (Best Seller / Hot Deal / New Arrival), WhatsApp share, copy-link, dark mode toggle, scroll-to-top
- **Admin Panel** (`/admin`): Add, edit, delete products (name, price PKR, affiliate link, image URL, category, badge, description) — no login required
- **Persistence**: All products stored in `localStorage` under `daily-finds-pk-products`; 9 seed products pre-loaded on first visit

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

---
name: Database setup — PostgreSQL via Drizzle
description: How the DB is configured, schema columns, and what's been pushed
---

## Rule
Use `DATABASE_URL` + `@workspace/db` + Drizzle ORM for all DB work. The Supabase JS client is NOT used — `SUPABASE_URL`/`SUPABASE_ANON_KEY` are not set.

**Why:** User mentioned Supabase but only `DATABASE_URL` (pointing to Replit's internal PostgreSQL on host `helium`) is configured. The existing `@workspace/db` lib uses Drizzle + pg and is the established pattern.

## Schema — `products` table (pushed as of 2026-07-07)

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK, defaultRandom() |
| name | text | notNull |
| price | numeric(12,2) | notNull |
| description | text | notNull |
| category | text | notNull |
| badge | text | nullable — values: Featured / Top Pick / New Arrival / Sale |
| affiliate_link | text | notNull (camelCase: affiliateLink) |
| image_url | text | notNull (camelCase: imageUrl) |
| click_count | integer | notNull, default 0 (camelCase: clickCount) — added 2026-07-07 |
| created_at | timestamp | defaultNow() |

## After schema changes
Always run `cd lib/db && npx drizzle-kit push` and then `cd lib/db && npx tsc --build` to refresh declaration files for the api-server package.

## How to apply
- Run `drizzle-kit push` from `lib/db/` for any schema change.
- Run `npx tsc --build` in `lib/db/` after schema changes to update dist declarations before TypeScript checks.
- The `@workspace/db` package exports source TS directly via `exports` map (no compile needed for Vite dev), but `dist/` declarations must be rebuilt for the api-server tsc check.

## API routes added (2026-07-07)
- `GET /api/products` — list all, ordered by created_at desc
- `POST /api/products` — create
- `PUT /api/products/:id` — update
- `DELETE /api/products/:id` — delete
- `POST /api/products/:id/click` — increment click_count (fire-and-forget from frontend)
- `GET /api/stats` — { totalProducts, totalClicks, featuredCount, categoriesCount, mostClicked, latestProduct }
- `GET /api` — healthcheck 200

## Security note
Write endpoints (POST/PUT/DELETE products) are currently unauthenticated. Admin panel is hidden (no nav link) but /admin URL is accessible to anyone. Adding auth is a future task.

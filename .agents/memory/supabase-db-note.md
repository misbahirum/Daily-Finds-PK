---
name: Database setup — PostgreSQL via Drizzle, not Supabase JS client
description: The project uses Replit's managed PostgreSQL (DATABASE_URL) with Drizzle ORM, not the Supabase JS client. SUPABASE_URL and SUPABASE_ANON_KEY are not configured.
---

The user asked for "Supabase" but the project uses Replit's managed PostgreSQL (DATABASE_URL points to `helium`, a Replit-internal host). `SUPABASE_URL` and `SUPABASE_ANON_KEY` are NOT set.

**What is configured:**
- `DATABASE_URL` — Replit managed PostgreSQL
- `@workspace/db` lib with Drizzle ORM + pg pool
- `lib/db/src/schema/products.ts` — Drizzle schema, pushed via `pnpm --filter @workspace/db run push`

**Why:** When the user added Supabase secrets, only `sb_publishable_smfiB1niT0paXnpFkkpfrg_GjjDIZFt` was set as the secret NAME (not value). The correct env var names were never configured.

**How to apply:** For any future DB work, use `@workspace/db` and Drizzle. To run DDL, use `pnpm --filter @workspace/db run push`. Production builds need `PORT=19001 BASE_PATH=/ pnpm --filter @workspace/daily-finds-pk run build`.

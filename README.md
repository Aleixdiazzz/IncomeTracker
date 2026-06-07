# Income Tracker

Personal finance tracker. Log income + expenses, categorize them, see a month-to-date dashboard. Multi-user, self-hosted.

Built on **Next.js 16** (App Router) + **React 19** + **Tailwind v4** + **shadcn/ui** + **Drizzle ORM** + **Postgres** + **Better Auth** + **Vitest**.

## Quick start

```bash
# 1. Start local Postgres
docker compose up -d

# 2. Copy env template and set BETTER_AUTH_SECRET
cp .env.example .env.local
# Generate a secret: openssl rand -base64 32

# 3. Install + migrate
npm install
npm run db:migrate

# 4. Run
npm run dev
# open http://localhost:3000
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Next dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Run Vitest once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run db:up` / `db:down` | Start / stop the Postgres container |
| `npm run db:generate` | Diff schema → write a new migration SQL file |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio (https://local.drizzle.studio) |

## Layout

```
app/                      # Next.js App Router
  (auth)/                 # /login, /signup  — public, redirects if signed in
  (app)/                  # protected — every page goes through the auth guard
  api/auth/[...all]/      # Better Auth catch-all
components/
  ui/                     # shadcn-generated; you own these files
  auth/  categories/  transactions/  dashboard/  layout/
db/
  schema/                 # Drizzle table definitions
  migrations/             # generated SQL, checked in
lib/
  auth/                   # Better Auth instance, client, requireSession()
  dal/                    # repos — the ONLY place that imports `db`
  services/               # combine repos into use cases
  validation/             # Zod schemas mirroring DB constraints
docs/decisions/           # ADRs — start here when reading the codebase
```

## Architecture in one paragraph

Pages render. Server Actions handle forms (validate with Zod, call DAL, `revalidatePath`). The DAL is the single chokepoint for `db` — every repo function starts with `requireSession()` and every WHERE clause filters by `userId`. DTOs strip internal columns before crossing to UI. Dashboard aggregation runs in SQL. See `docs/decisions/` for the reasoning behind every locked-in choice.

## Next 16 gotchas to remember

- `params` and `searchParams` are `Promise<...>` — always `await` them.
- `cookies()` and `headers()` are async.
- `fetch()` is **not** cached by default.
- `error.tsx` MUST be a Client Component.
- Tailwind 4 has no `tailwind.config.js` — theming lives in `app/globals.css`.

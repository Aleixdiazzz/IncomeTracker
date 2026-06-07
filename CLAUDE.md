@AGENTS.md

## Session Boot Rule
Before any task:
1. Read ~/KnowledgeVault/CLAUDE_GLOBAL.md
2. Read local CLAUDE.md
3. Load project note from KnowledgeVault/Projects/Income Tracker.md
4. Search related Standards, Patterns, Bugs, Decisions
5. Build context before coding

## Global Operating Instructions
Before doing anything:
1. Read ~/KnowledgeVault/CLAUDE_GLOBAL.md
2. Follow all system-wide vault management rules
3. Load project note from:
   ~/KnowledgeVault/Projects/PROJECT_NAME.md
4. If project note does not exist:
    - Use ~/KnowledgeVault/Templates/newProjectTemplate.md
    - Create it
5. Keep project note updated throughout work
6. At command "ARCHIVE THIS SESSION":
    - Update project CLAUDE.md
    - Update project vault note
    - Update shared/reusable knowledge if applicable

## Vault Integration
Vault Path: ~/KnowledgeVault
Project Note: ~/KnowledgeVault/Projects/Income Tracker.md

## Project Lessons (append-only, newest last)

### 2026-06-07 — Session 1 (MVP build + recurring-model refactor)

**Stack locked:** Next.js 16.2.7, React 19.2.4, Tailwind 4 + `@tailwindcss/postcss`, shadcn/ui (`radix-nova` style), Drizzle ORM + drizzle-kit, Better Auth (Drizzle adapter), Postgres 16 in Docker, Vitest, Zod, Recharts, next-themes, date-fns. Locale `es-ES`, currency EUR.

**Architecture:** pages → server actions → service → DAL → drizzle. DAL is the only place that imports `db`; every repo function calls `requireSession()` first and filters by `userId`. DTOs strip internal columns at the layer boundary.

**Data model (current):**
- `user`, `session`, `account`, `verification` — Better Auth tables (column names verbatim from `@better-auth/core/dist/db/get-tables.mjs`)
- `categories(id, userId, name, kind, createdAt)` with `kind ∈ {income, expense, savings}`
- `recurring_entries(id, userId, categoryId, label, kind, amountCents, cadence, notes, createdAt, updatedAt)` with `cadence ∈ {monthly, yearly}`
- Money stored as integer cents always. Yearly entries amortized in SQL via `CASE WHEN cadence = 'yearly' THEN amountCents / 12 ELSE amountCents END`.

**Dashboard KPIs:** Make (income) · Spend (expense) · Save (savings) · Left to spend (income − expense − savings). Plus expense-by-category pie chart.

**Critical gotchas burned in:**
- Next 16: `params`, `searchParams`, `cookies()`, `headers()` all return Promises — always `await`. `fetch()` is NOT cached by default. `error.tsx` MUST be `'use client'`. Tailwind 4 has no `tailwind.config.js`; theming lives in `app/globals.css` `@theme inline`. `useFormState` → `useActionState`.
- Better Auth 1.6.14 transitively imports `@better-auth/kysely-adapter` which requires kysely 0.28.x; kysely 0.29.x dropped the relevant runtime exports. Fix: `package.json` `overrides: { "kysely": "0.28.7" }`. Even projects using the Drizzle adapter need this. Saw symptom: dev server crashes with `Export DEFAULT_MIGRATION_LOCK_TABLE doesn't exist in target module`.
- shadcn rewrote `app/globals.css` and changed the font CSS variable from `--font-geist-sans` to `--font-sans`; update `app/layout.tsx` to match or fonts don't load.
- drizzle-kit `generate` requires a TTY for rename-vs-create conflicts. From a non-TTY shell, preload a script that sets `process.stdin.isTTY = true`, `process.stdout.isTTY = true`, and stubs `process.stdin.setRawMode = () => process.stdin` and `process.stdout.cursorTo/clearLine/moveCursor`. Then run via `node --require <shim> ./node_modules/drizzle-kit/bin.cjs generate --name X`. Pipe `\r\r\r` to accept defaults. Strongly prefer running in a real terminal.
- Drizzle dev HMR leaks pg connections without `globalThis` singleton (see `db/index.ts`).

**Decision pivots during session:**
1. Started with a one-off `transactions` table (occurredOn date, kind discriminator). User pivoted to "monthly budget" model — replaced with `recurring_entries` + cadence enum; dashboard switched from MTD aggregation to amortized budget summary.
2. Dropped `categories.isDefault` after user found the badge visually noisy. ADR-style reasoning in conversation, not yet promoted to a vault Decision.
3. Currency originally USD/en-US. Flipped to EUR/es-ES.
4. Action buttons originally text labels. Flipped to lucide icons (`Pencil`, `Trash2`, `Check`, `X`) with `aria-label`.
5. No mobile nav initially — added shadcn `Sheet` + hamburger.

**Open follow-ups:**
- Deploy to VPS (user has one). Plan sketch: Docker Compose (app + Postgres) + nginx + certbot, `.env.production` with rotated `BETTER_AUTH_SECRET`. Awaiting VPS recon output.
- ADRs only cover initial stack picks. Pivots above (recurring model, currency, isDefault drop) deserve their own ADRs next session.
- Existing seeded users from before migration 0002 lack the Savings default categories. Easiest fix: re-signup with a fresh email or add manually.

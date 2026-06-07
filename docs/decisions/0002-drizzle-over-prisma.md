# 0002 — Drizzle ORM over Prisma
Date: 2026-06-06
Status: Accepted

## Context
We need a typed query layer over Postgres with migrations.

## Decision
Use Drizzle ORM + drizzle-kit. Schema lives in `db/schema/*.ts`; migrations are generated SQL files in `db/migrations/`, reviewed and committed.

## Alternatives considered
- **Prisma.** Excellent DX, but ships a query engine (extra runtime, extra startup cost on serverless) and generates a separate client that must be regenerated on schema changes.
- **Plain pg + Kysely.** Maximum control, more boilerplate, steeper learning curve for a first Next.js project.

## Consequences
- **Good:** `typeof table.$inferSelect` gives a row type without a codegen step. Single source of truth.
- **Good:** Migration SQL is human-readable and code-reviewable — there is no "magic schema" sitting in a binary file.
- **Good:** No runtime engine — colder start, smaller bundles.
- **Bad:** Smaller ecosystem than Prisma. Some adapters (e.g. for niche providers) don't exist yet.
- **Bad:** No GUI Studio as polished as Prisma's, though `drizzle-kit studio` is good enough for MVP work.

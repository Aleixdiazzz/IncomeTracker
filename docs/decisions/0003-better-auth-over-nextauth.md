# 0003 — Better Auth over NextAuth/Auth.js
Date: 2026-06-06
Status: Accepted

## Context
We need multi-user authentication with sessions persisted in our Postgres.

## Decision
Use Better Auth, configured with the Drizzle adapter. Tables `user`, `session`, `account`, `verification` are defined in `db/schema/auth.ts` and queried by Better Auth directly. Sign-in / sign-up / sign-out run through Server Actions that call `auth.api.*`, with the `nextCookies()` plugin handling Set-Cookie propagation across the action boundary.

## Alternatives considered
- **Auth.js v5 (NextAuth).** Most popular option, but the v5 API is still settling and the database tables are owned by adapters that change between releases. We prefer table ownership to live in our repo.
- **Clerk.** Fastest path to ship, but moves auth out of the monolith — violates the "all logic lives in this project" constraint.
- **Custom (Jose + bcrypt).** Most learning, slowest path. Not justified for an MVP.

## Consequences
- **Good:** Auth tables live in our schema and migrations. No external coupling.
- **Good:** Session lookup is a single DB query; cookieCache caches it for 5 minutes in-memory.
- **Good:** Defense in depth — `(app)/layout.tsx` checks the session at the route, and every DAL function re-checks via `requireSession()`.
- **Bad:** Better Auth is younger than Auth.js — breaking changes more likely in minor versions. Pin and read release notes.
- **Bad:** Column names in `db/schema/auth.ts` are prescriptive (camelCase) — see the comment in that file.

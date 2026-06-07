# 0001 — Single Next.js 16 monolith
Date: 2026-06-06
Status: Accepted

## Context
We need a beautiful, multi-user finance tracker. The MVP scope is small (CRUD + a dashboard) and there is a single developer. We want one deployable, one type model, and minimal infra.

## Decision
Build the app as a single Next.js 16 (App Router) project. All logic — UI, data access, auth, database schema — lives in this repo.

## Alternatives considered
- **Separate API (NestJS / Hono) + Next frontend.** Two deployables, two type systems (or a shared package), two CI pipelines. Rejected — over-engineering for the current scope.
- **Backend-as-a-service (Supabase/Firebase).** Faster start, but business logic ends up split between SQL policies and TS code, which is harder to reason about. Rejected — the user explicitly wants the logic in this project for learning.

## Consequences
- **Good:** End-to-end type inference. Server Components fetch directly from the DAL. Single deploy.
- **Good:** Server Actions remove the need to hand-write API routes for forms.
- **Bad:** Vendor-coupled to Next's runtime model — porting away later means rewriting Server Components.
- **Bad:** Server Actions are public POST endpoints by default; every action must enforce auth itself (DAL handles this for us — see [[0003-better-auth-over-nextauth]]).

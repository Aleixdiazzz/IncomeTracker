# 0005 — Store amounts as integer cents
Date: 2026-06-06
Status: Accepted

## Context
We sum and compare money values. Floats lose precision on values like 0.1 + 0.2.

## Decision
`transactions.amountCents` is `integer`, never `numeric` or `real`. Forms accept `"19.99"` (string), Zod transforms it via `Math.round(parseFloat(v) * 100)` → `1999`. The UI formats with `lib/format.ts#formatCents`.

## Alternatives considered
- **Postgres `numeric(12,2)`.** Loss-free but returns a JS string in the driver, requiring conversion everywhere. Easy to accidentally compare strings.
- **Float / double precision.** Cannot be trusted for sums.

## Consequences
- **Good:** All math (sums, comparisons) is integer math — fast and exact.
- **Good:** Single conversion point — Zod schema in / `formatCents` out.
- **Bad:** Multi-currency support would need a second column (`currency`) and per-currency minor units (JPY has zero decimals). Document if/when we add currencies.

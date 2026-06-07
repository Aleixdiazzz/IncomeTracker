# 0004 — Single `transactions` table with a `kind` discriminator
Date: 2026-06-06
Status: Accepted

## Context
Income and expense entries share ~95% of their columns (amount, date, category, notes, ownership). We need to model both.

## Decision
One `transactions` table with a `kind` enum column (`income` | `expense`). Same enum reused on `categories.kind` so the FK between them lines up semantically.

## Alternatives considered
- **Two tables (`incomes`, `expenses`).** Doubles every read/write surface area: two repos, two Server Actions, two seed paths. Dashboard sum requires a UNION.
- **One `entries` table with a sign on the amount.** Saves the `kind` column but loses information (a `kind=expense` with a positive amount has different semantics than `kind=income`). Filtering by kind becomes "amount > 0" — implicit and easy to get wrong.

## Consequences
- **Good:** Dashboard sums income and expense in two scoped queries on the same table.
- **Good:** Adding a future kind (`transfer`, `refund`) is a new enum value, no schema migration of the table shape.
- **Good:** `transactionsRepo` is one file; categories repo is one file. SRP holds at the layer.
- **Bad:** Reports that only ever touch one kind still scan the wider table. Index `(userId, kind)` mitigates this.

// db/seed-defaults.ts
// Owner: DB layer
// Purpose: Seed the default category set for a freshly-created user. Called
// from the Better Auth `user.create` hook (see lib/auth/auth.ts).
import { db } from "./index";
import { categories, type CategoryKind } from "./schema/categories";

type DefaultCategory = { name: string; kind: CategoryKind };

const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Income
  { name: "Salary", kind: "income" },
  { name: "Other", kind: "income" },
  // Expense
  { name: "Rent", kind: "expense" },
  { name: "Groceries", kind: "expense" },
  { name: "Utilities", kind: "expense" },
  { name: "Transport", kind: "expense" },
  { name: "Subscriptions", kind: "expense" },
  { name: "Entertainment", kind: "expense" },
  { name: "Health", kind: "expense" },
  { name: "Other", kind: "expense" },
  // Savings
  { name: "Savings", kind: "savings" },
  { name: "Emergency Fund", kind: "savings" },
];

/**
 * Insert the default category set for `userId`. Idempotent — the unique index
 * on (userId, name, kind) makes re-runs a no-op via `onConflictDoNothing`.
 */
export async function seedDefaultCategoriesForUser(userId: string) {
  await db
    .insert(categories)
    .values(
      DEFAULT_CATEGORIES.map((c) => ({
        userId,
        name: c.name,
        kind: c.kind,
      })),
    )
    .onConflictDoNothing();
}

// db/schema/categories.ts
// Owner: DB layer
// Purpose: User-owned categories. A category belongs to one user and is one
// of three kinds: income, expense or savings. "Savings" is modeled as a
// distinct kind so the dashboard can report it as its own KPI even though
// it behaves like an outflow from cash-flow perspective.
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

/** What a category (and the recurring entries tagged with it) represents. */
export const categoryKindEnum = pgEnum("category_kind", [
  "income",
  "expense",
  "savings",
]);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: categoryKindEnum("kind").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("categories_user_name_kind_unique").on(t.userId, t.name, t.kind)],
);

export type CategoryRow = typeof categories.$inferSelect;
export type CategoryInsert = typeof categories.$inferInsert;
export type CategoryKind = (typeof categoryKindEnum.enumValues)[number];

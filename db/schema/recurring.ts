// db/schema/recurring.ts
// Owner: DB layer
// Purpose: Recurring income / expense / savings entries that drive the monthly
// budget. `cadence` controls how the amount is amortized for the dashboard:
//   - monthly: full amountCents
//   - yearly:  amountCents / 12
// Stored as integer cents (see ADR 0005). `kind` mirrors the category kind so
// the entry stays classifiable even if its category is later deleted.
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { categories, categoryKindEnum } from "./categories";

export const cadenceEnum = pgEnum("entry_cadence", ["monthly", "yearly"]);

export const recurringEntries = pgTable(
  "recurring_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: uuid("categoryId").references(() => categories.id, {
      onDelete: "set null",
    }),
    label: text("label").notNull(),
    kind: categoryKindEnum("kind").notNull(),
    amountCents: integer("amountCents").notNull(),
    cadence: cadenceEnum("cadence").notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("recurring_user_kind_idx").on(t.userId, t.kind)],
);

export type RecurringEntryRow = typeof recurringEntries.$inferSelect;
export type RecurringEntryInsert = typeof recurringEntries.$inferInsert;
export type Cadence = (typeof cadenceEnum.enumValues)[number];

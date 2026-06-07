// lib/services/dashboard.service.ts
// Owner: Service layer
// Purpose: Build the monthly budget summary from the user's recurring entries.
// Yearly entries are amortized to monthly by dividing by 12 (see
// lib/dal/dto.ts#monthlyCost). The four KPIs the dashboard ships:
//   - income      : sum of recurring income entries
//   - expense     : sum of recurring expense entries
//   - savings     : sum of recurring savings entries
//   - leftToSpend : income - expense - savings  (negative = over budget)
import { and, eq, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema/categories";
import { recurringEntries } from "@/db/schema/recurring";
import { requireSession } from "@/lib/auth/require-session";

export type CategoryBreakdown = {
  categoryId: string | null;
  categoryName: string;
  monthlyCostCents: number;
};

export type MonthlyBudget = {
  incomeCents: number;
  expenseCents: number;
  savingsCents: number;
  leftToSpendCents: number;
  /** Per-category breakdown of expense entries (powers the pie chart). */
  expenseByCategory: CategoryBreakdown[];
};

export async function getMonthlyBudget(): Promise<MonthlyBudget> {
  const { userId } = await requireSession();

  const [income, expense, savings] = await Promise.all([
    sumKind(userId, "income"),
    sumKind(userId, "expense"),
    sumKind(userId, "savings"),
  ]);

  // Per-category expense breakdown. SUM both branches of the CASE so monthly
  // and yearly cadences end up on the same scale.
  const breakdownRows = await db
    .select({
      categoryId: recurringEntries.categoryId,
      categoryName: categories.name,
      monthlyAmount: sumMonthlyAmount(),
    })
    .from(recurringEntries)
    .leftJoin(categories, eq(recurringEntries.categoryId, categories.id))
    .where(
      and(
        eq(recurringEntries.userId, userId),
        eq(recurringEntries.kind, "expense"),
      ),
    )
    .groupBy(recurringEntries.categoryId, categories.name);

  return {
    incomeCents: income,
    expenseCents: expense,
    savingsCents: savings,
    leftToSpendCents: income - expense - savings,
    expenseByCategory: breakdownRows
      .map((r) => ({
        categoryId: r.categoryId,
        categoryName: r.categoryName ?? "Uncategorized",
        monthlyCostCents: toInt(r.monthlyAmount),
      }))
      .filter((b) => b.monthlyCostCents > 0)
      .sort((a, b) => b.monthlyCostCents - a.monthlyCostCents),
  };
}

async function sumKind(userId: string, kind: "income" | "expense" | "savings") {
  const [row] = await db
    .select({ total: sumMonthlyAmount() })
    .from(recurringEntries)
    .where(
      and(eq(recurringEntries.userId, userId), eq(recurringEntries.kind, kind)),
    );
  return toInt(row?.total);
}

/**
 * SQL expression that returns the monthly-amortized amount for each row:
 * monthly → amountCents, yearly → amountCents / 12 (integer division).
 * Postgres SUM(integer) returns numeric — coerced in toInt().
 */
function sumMonthlyAmount() {
  return sum(sql<number>`CASE
    WHEN ${recurringEntries.cadence} = 'yearly'
      THEN ${recurringEntries.amountCents} / 12
    ELSE ${recurringEntries.amountCents}
  END`);
}

function toInt(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : parseInt(value, 10);
}

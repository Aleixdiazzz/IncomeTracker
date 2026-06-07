// app/(app)/dashboard/page.tsx
// Owner: UI / dashboard
// Purpose: Monthly budget snapshot. One call to the dashboard service returns
// the four KPIs (make / spend / save / left) and the expense-by-category
// breakdown. Everything below is rendering only.
import { StatCard } from "@/components/dashboard/stat-card";
import { SpendByCategoryChart } from "@/components/dashboard/spend-by-category-chart";
import { getMonthlyBudget } from "@/lib/services/dashboard.service";
import { formatCents } from "@/lib/format";

export default async function DashboardPage() {
  const budget = await getMonthlyBudget();

  const leftTone =
    budget.leftToSpendCents > 0
      ? "positive"
      : budget.leftToSpendCents < 0
        ? "negative"
        : "neutral";

  const chartSlices = budget.expenseByCategory.map((c) => ({
    name: c.categoryName,
    value: c.monthlyCostCents,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your monthly budget. Yearly entries are amortized to a monthly cost.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Income"
          value={formatCents(budget.incomeCents)}
          tone="positive"
        />
        <StatCard
          label="Expenses"
          value={formatCents(budget.expenseCents)}
          tone="negative"
          hint="Recurring expenses"
        />
        <StatCard
          label="Saving"
          value={formatCents(budget.savingsCents)}
          hint="Set-aside each month"
        />
        <StatCard
          label="Left to spend"
          value={formatCents(budget.leftToSpendCents)}
          tone={leftTone}
          hint={
            budget.leftToSpendCents >= 0
              ? "After expenses + savings"
              : "Budget exceeds income"
          }
        />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Expenses by category
        </h2>
        <SpendByCategoryChart data={chartSlices} />
      </div>
    </div>
  );
}

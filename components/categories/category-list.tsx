// components/categories/category-list.tsx
// Owner: UI / categories
// Purpose: Server Component that renders the grouped category list. No
// client JS — the per-row interactivity lives in CategoryRow.
import type { CategoryDTO } from "@/lib/dal/dto";
import { CategoryRow } from "./category-row";

export function CategoryList({ categories }: { categories: CategoryDTO[] }) {
  if (categories.length === 0) {
    return (
      <p className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        No categories yet. Add one above to get started.
      </p>
    );
  }

  const income = categories.filter((c) => c.kind === "income");
  const expense = categories.filter((c) => c.kind === "expense");
  const savings = categories.filter((c) => c.kind === "savings");

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Section title="Income" items={income} />
      <Section title="Expense" items={expense} />
      <Section title="Savings" items={savings} />
    </div>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: CategoryDTO[];
}) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="rounded-lg border bg-card px-3">
        {items.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">
            No {title.toLowerCase()} categories yet.
          </p>
        ) : (
          items.map((c) => <CategoryRow key={c.id} category={c} />)
        )}
      </div>
    </div>
  );
}

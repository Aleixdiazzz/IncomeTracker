// app/(app)/recurring/page.tsx
// Owner: UI / recurring
// Purpose: List page for recurring entries. `searchParams` is a Promise in
// Next 16 — must `await` before reading.
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecurringList } from "@/components/recurring/recurring-list";
import { listRecurringForCurrentUser } from "@/lib/dal/recurring.repo";
import type { CategoryKind } from "@/lib/types";

type SearchParams = Promise<{ kind?: string }>;

const KIND_TABS: Array<{ value?: CategoryKind; label: string; href: string }> =
  [
    { label: "All", href: "/recurring" },
    { value: "income", label: "Income", href: "/recurring?kind=income" },
    { value: "expense", label: "Expense", href: "/recurring?kind=expense" },
    { value: "savings", label: "Savings", href: "/recurring?kind=savings" },
  ];

export default async function RecurringPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { kind: kindParam } = await searchParams;
  const kind: CategoryKind | undefined =
    kindParam === "income" || kindParam === "expense" || kindParam === "savings"
      ? kindParam
      : undefined;

  const items = await listRecurringForCurrentUser(kind);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recurring</h1>
          <p className="text-sm text-muted-foreground">
            Income, expenses and savings that repeat every month or year.
          </p>
        </div>
        <Button asChild>
          <Link href={`/recurring/new${kind ? `?kind=${kind}` : ""}`}>
            New entry
          </Link>
        </Button>
      </div>

      <nav className="flex gap-2 border-b">
        {KIND_TABS.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors whitespace-nowrap ${
              t.value === kind
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <RecurringList items={items} />
    </div>
  );
}

// components/recurring/recurring-list.tsx
// Owner: UI / recurring
// Purpose: Read-only list of recurring entries. Shows the raw amount + cadence
// on the left and the monthly-amortized cost on the right so users see both
// "I pay X yearly" and "that's Y per month".
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteRecurringAction } from "@/app/(app)/recurring/actions";
import { formatCents } from "@/lib/format";
import type { RecurringEntryDTO } from "@/lib/dal/dto";

export function RecurringList({ items }: { items: RecurringEntryDTO[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        No recurring entries yet. Add one to see your monthly budget.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Label</th>
            <th className="px-4 py-3 hidden sm:table-cell">Category</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right">Per month</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.id} className="border-b last:border-b-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.label}</span>
                  <KindBadge kind={t.kind} />
                </div>
                {t.notes && (
                  <p className="text-xs text-muted-foreground">{t.notes}</p>
                )}
                <p className="text-xs text-muted-foreground sm:hidden">
                  {t.categoryName ?? "Uncategorized"}
                </p>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                {t.categoryName ?? "Uncategorized"}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatCents(t.amountCents)}
                <span className="block text-xs text-muted-foreground">
                  {t.cadence === "yearly" ? "per year" : "per month"}
                </span>
              </td>
              <td
                className={`px-4 py-3 text-right font-medium tabular-nums ${
                  t.kind === "income" ? "text-emerald-600" : "text-foreground"
                }`}
              >
                {formatCents(t.monthlyCostCents)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1">
                  <Button asChild size="icon" variant="ghost">
                    <Link href={`/recurring/${t.id}/edit`} aria-label="Edit">
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <form action={deleteRecurringAction}>
                    <input type="hidden" name="id" value={t.id} />
                    <Button
                      type="submit"
                      size="icon"
                      variant="ghost"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KindBadge({ kind }: { kind: RecurringEntryDTO["kind"] }) {
  if (kind === "income") return <Badge>income</Badge>;
  if (kind === "savings") return <Badge variant="outline">savings</Badge>;
  return <Badge variant="secondary">expense</Badge>;
}

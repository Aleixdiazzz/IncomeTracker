// app/(app)/recurring/[id]/edit/page.tsx
// Owner: UI / recurring
// Purpose: Edit page. `params` is a Promise in Next 16 — must `await` before
// reading `id`.
import { notFound } from "next/navigation";
import { RecurringForm } from "@/components/recurring/recurring-form";
import { listCategoriesForCurrentUser } from "@/lib/dal/categories.repo";
import { getRecurringById } from "@/lib/dal/recurring.repo";

type Params = Promise<{ id: string }>;

export default async function EditRecurringPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const [entry, categories] = await Promise.all([
    getRecurringById(id),
    listCategoriesForCurrentUser(),
  ]);
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Edit entry</h1>
      <RecurringForm categories={categories} defaultValues={entry} />
    </div>
  );
}

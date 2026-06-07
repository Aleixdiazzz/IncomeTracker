// app/(app)/recurring/new/page.tsx
// Owner: UI / recurring
// Purpose: New entry page. Loads all categories — the form filters them by
// kind on the client.
import { RecurringForm } from "@/components/recurring/recurring-form";
import { listCategoriesForCurrentUser } from "@/lib/dal/categories.repo";

export default async function NewRecurringPage() {
  const categories = await listCategoriesForCurrentUser();
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">New entry</h1>
      <RecurringForm categories={categories} />
    </div>
  );
}

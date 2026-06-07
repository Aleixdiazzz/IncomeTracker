// app/(app)/categories/page.tsx
// Owner: UI / categories
// Purpose: List + add categories. Pure Server Component — the form and rows
// are Client Components so the page itself ships zero JS for first paint.
import { listCategoriesForCurrentUser } from "@/lib/dal/categories.repo";
import { CategoryList } from "@/components/categories/category-list";
import { NewCategoryForm } from "@/components/categories/new-category-form";

export default async function CategoriesPage() {
  const categories = await listCategoriesForCurrentUser();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Buckets you can tag income and expenses with.
        </p>
      </div>
      <NewCategoryForm />
      <CategoryList categories={categories} />
    </div>
  );
}

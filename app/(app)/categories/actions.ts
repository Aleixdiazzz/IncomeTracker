// app/(app)/categories/actions.ts
// Owner: UI / categories
// Purpose: Server Actions for the categories page. Pattern:
//   1. Pull raw FormData.
//   2. Validate with Zod — never trust the client.
//   3. Call the repo (which calls requireSession() itself = defense in depth).
//   4. Revalidate the affected paths so cached Server Components re-fetch.
//
// Every action runs through requireSession via the repo even though
// app/(app)/layout.tsx already guards the URL — Server Actions are public
// POST endpoints and must guard themselves.
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/dal/categories.repo";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
} from "@/lib/validation/category.schema";

export type CategoryFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "kind", string>>;
};

const empty: CategoryFormState = {};

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const parsed = CreateCategorySchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
  });
  if (!parsed.success) return toFormState(parsed.error);

  try {
    await createCategory(parsed.data);
  } catch (err) {
    return { error: friendlyDbError(err, "A category with that name already exists.") };
  }
  revalidatePath("/categories");
  return empty;
}

export async function updateCategoryAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const parsed = UpdateCategorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });
  if (!parsed.success) return toFormState(parsed.error);

  try {
    const updated = await updateCategory(parsed.data.id, {
      name: parsed.data.name,
    });
    if (!updated) return { error: "Category not found." };
  } catch (err) {
    return { error: friendlyDbError(err, "A category with that name already exists.") };
  }
  revalidatePath("/categories");
  return empty;
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteCategory(id);
  revalidatePath("/categories");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

function toFormState(error: z.ZodError): CategoryFormState {
  const fieldErrors: CategoryFormState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key === "name" || key === "kind") {
      fieldErrors[key] = issue.message;
    }
  }
  return { error: "Please fix the highlighted fields.", fieldErrors };
}

function friendlyDbError(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "code" in err && err.code === "23505") {
    return fallback;
  }
  return "Something went wrong. Please try again.";
}

// app/(app)/recurring/actions.ts
// Owner: UI / recurring
// Purpose: Server Actions behind the recurring-entry forms. Same pattern as
// every other action: Zod parse → owner check → repo call → revalidate.
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createRecurring,
  deleteRecurring,
  isCategoryOwnedByCurrentUser,
  updateRecurring,
} from "@/lib/dal/recurring.repo";
import {
  CreateRecurringSchema,
  UpdateRecurringSchema,
} from "@/lib/validation/recurring.schema";

export type RecurringFormState = {
  error?: string;
  fieldErrors?: Partial<
    Record<
      "label" | "kind" | "cadence" | "amountCents" | "categoryId" | "notes",
      string
    >
  >;
};

const empty: RecurringFormState = {};

export async function createRecurringAction(
  _prev: RecurringFormState,
  formData: FormData,
): Promise<RecurringFormState> {
  const parsed = CreateRecurringSchema.safeParse({
    label: formData.get("label"),
    kind: formData.get("kind"),
    cadence: formData.get("cadence"),
    amountCents: formData.get("amount"),
    categoryId: formData.get("categoryId"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return toFormState(parsed.error);

  if (parsed.data.categoryId) {
    const owns = await isCategoryOwnedByCurrentUser(parsed.data.categoryId);
    if (!owns) return { error: "Selected category is invalid." };
  }

  await createRecurring(parsed.data);
  revalidatePath("/recurring");
  revalidatePath("/dashboard");
  redirect(`/recurring?kind=${parsed.data.kind}`);
}

export async function updateRecurringAction(
  _prev: RecurringFormState,
  formData: FormData,
): Promise<RecurringFormState> {
  const parsed = UpdateRecurringSchema.safeParse({
    id: formData.get("id"),
    label: formData.get("label"),
    kind: formData.get("kind"),
    cadence: formData.get("cadence"),
    amountCents: formData.get("amount"),
    categoryId: formData.get("categoryId"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return toFormState(parsed.error);

  if (parsed.data.categoryId) {
    const owns = await isCategoryOwnedByCurrentUser(parsed.data.categoryId);
    if (!owns) return { error: "Selected category is invalid." };
  }

  const updated = await updateRecurring(parsed.data.id, {
    label: parsed.data.label,
    kind: parsed.data.kind,
    cadence: parsed.data.cadence,
    amountCents: parsed.data.amountCents,
    categoryId: parsed.data.categoryId,
    notes: parsed.data.notes,
  });
  if (!updated) return { error: "Entry not found." };

  revalidatePath("/recurring");
  revalidatePath("/dashboard");
  redirect(`/recurring?kind=${parsed.data.kind}`);
}

export async function deleteRecurringAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteRecurring(id);
  revalidatePath("/recurring");
  revalidatePath("/dashboard");
}

function toFormState(error: z.ZodError): RecurringFormState {
  const fieldErrors: RecurringFormState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (
      key === "label" ||
      key === "kind" ||
      key === "cadence" ||
      key === "amountCents" ||
      key === "categoryId" ||
      key === "notes"
    ) {
      fieldErrors[key] = issue.message;
    }
  }
  return { error: "Please fix the highlighted fields.", fieldErrors };
}

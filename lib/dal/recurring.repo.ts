// lib/dal/recurring.repo.ts
// Owner: DAL
// Purpose: All recurring-entry reads/writes, scoped to the current session
// user. Same invariants as the categories repo — every export calls
// requireSession() first and every WHERE clause filters by userId.
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, type CategoryKind } from "@/db/schema/categories";
import { recurringEntries } from "@/db/schema/recurring";
import { requireSession } from "@/lib/auth/require-session";
import { toRecurringEntryDTO, type RecurringEntryDTO } from "./dto";

/** Lists every recurring entry owned by the current user (with category name). */
export async function listRecurringForCurrentUser(
  kind?: CategoryKind,
): Promise<RecurringEntryDTO[]> {
  const { userId } = await requireSession();
  const where = kind
    ? and(eq(recurringEntries.userId, userId), eq(recurringEntries.kind, kind))
    : eq(recurringEntries.userId, userId);

  const rows = await db
    .select({
      entry: recurringEntries,
      categoryName: categories.name,
    })
    .from(recurringEntries)
    .leftJoin(categories, eq(recurringEntries.categoryId, categories.id))
    .where(where)
    .orderBy(asc(recurringEntries.kind), desc(recurringEntries.createdAt));

  return rows.map((r) => toRecurringEntryDTO(r.entry, r.categoryName));
}

export async function getRecurringById(
  id: string,
): Promise<RecurringEntryDTO | null> {
  const { userId } = await requireSession();
  const rows = await db
    .select({ entry: recurringEntries, categoryName: categories.name })
    .from(recurringEntries)
    .leftJoin(categories, eq(recurringEntries.categoryId, categories.id))
    .where(
      and(eq(recurringEntries.id, id), eq(recurringEntries.userId, userId)),
    )
    .limit(1);
  if (rows.length === 0) return null;
  return toRecurringEntryDTO(rows[0].entry, rows[0].categoryName);
}

type WritableEntry = {
  label: string;
  kind: CategoryKind;
  cadence: "monthly" | "yearly";
  amountCents: number;
  categoryId?: string;
  notes?: string;
};

export async function createRecurring(
  input: WritableEntry,
): Promise<RecurringEntryDTO> {
  const { userId } = await requireSession();
  const [row] = await db
    .insert(recurringEntries)
    .values({
      userId,
      label: input.label,
      kind: input.kind,
      cadence: input.cadence,
      amountCents: input.amountCents,
      categoryId: input.categoryId ?? null,
      notes: input.notes ?? null,
    })
    .returning();
  return toRecurringEntryDTO(row);
}

export async function updateRecurring(
  id: string,
  patch: WritableEntry,
): Promise<RecurringEntryDTO | null> {
  const { userId } = await requireSession();
  const [row] = await db
    .update(recurringEntries)
    .set({
      label: patch.label,
      kind: patch.kind,
      cadence: patch.cadence,
      amountCents: patch.amountCents,
      categoryId: patch.categoryId ?? null,
      notes: patch.notes ?? null,
      updatedAt: new Date(),
    })
    .where(
      and(eq(recurringEntries.id, id), eq(recurringEntries.userId, userId)),
    )
    .returning();
  return row ? toRecurringEntryDTO(row) : null;
}

export async function deleteRecurring(id: string): Promise<boolean> {
  const { userId } = await requireSession();
  const result = await db
    .delete(recurringEntries)
    .where(
      and(eq(recurringEntries.id, id), eq(recurringEntries.userId, userId)),
    )
    .returning({ id: recurringEntries.id });
  return result.length > 0;
}

/** Same shape as in categories.repo — used by Server Actions to validate IDs. */
export async function isCategoryOwnedByCurrentUser(
  categoryId: string,
): Promise<boolean> {
  const { userId } = await requireSession();
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);
  return rows.length > 0;
}

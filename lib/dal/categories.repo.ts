// lib/dal/categories.repo.ts
// Owner: DAL
// Purpose: All category reads/writes, scoped to the current session user.
// Invariants:
//   - Every export calls requireSession() before touching the DB.
//   - Every WHERE clause includes the current userId.
//   - Returns CategoryDTO (never raw rows).
// Do NOT import `db` outside of lib/dal/.
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, type CategoryKind } from "@/db/schema/categories";
import { requireSession } from "@/lib/auth/require-session";
import { toCategoryDTO, type CategoryDTO } from "./dto";

/** Lists all categories owned by the current user, ordered by kind then name. */
export async function listCategoriesForCurrentUser(): Promise<CategoryDTO[]> {
  const { userId } = await requireSession();
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.kind), asc(categories.name));
  return rows.map(toCategoryDTO);
}

/** Lists categories filtered by `kind` (used by the new-transaction form). */
export async function listCategoriesByKind(
  kind: CategoryKind,
): Promise<CategoryDTO[]> {
  const { userId } = await requireSession();
  const rows = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.kind, kind)))
    .orderBy(asc(categories.name));
  return rows.map(toCategoryDTO);
}

/**
 * Creates a category for the current user. The unique index on
 * (userId, name, kind) is what enforces no-duplicates.
 */
export async function createCategory(input: {
  name: string;
  kind: CategoryKind;
}): Promise<CategoryDTO> {
  const { userId } = await requireSession();
  const [row] = await db
    .insert(categories)
    .values({ userId, name: input.name, kind: input.kind })
    .returning();
  return toCategoryDTO(row);
}

/** Renames a category owned by the current user. */
export async function updateCategory(
  id: string,
  patch: { name: string },
): Promise<CategoryDTO | null> {
  const { userId } = await requireSession();
  const [row] = await db
    .update(categories)
    .set({ name: patch.name })
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning();
  return row ? toCategoryDTO(row) : null;
}

/** Deletes a category owned by the current user. Transactions referencing it
 * keep their row but have `categoryId` set to null (ON DELETE SET NULL). */
export async function deleteCategory(id: string): Promise<boolean> {
  const { userId } = await requireSession();
  const result = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning({ id: categories.id });
  return result.length > 0;
}

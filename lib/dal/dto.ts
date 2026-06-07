// lib/dal/dto.ts
// Owner: DAL
// Purpose: Convert DB rows into DTOs safe to pass to UI / serialize to JSON.
// DTOs intentionally OMIT internal columns (userId, updatedAt) so:
//   - JSON.stringify on a DTO never leaks ownership information
//   - schema changes don't break the UI contract
//   - the API surface is small and obvious
import type { CategoryRow } from "@/db/schema/categories";
import type { RecurringEntryRow } from "@/db/schema/recurring";

export type CategoryDTO = {
  id: string;
  name: string;
  kind: CategoryRow["kind"];
};

export type RecurringEntryDTO = {
  id: string;
  label: string;
  kind: RecurringEntryRow["kind"];
  amountCents: number;
  cadence: RecurringEntryRow["cadence"];
  /** Monthly-amortized cost: amountCents for monthly, amountCents/12 for yearly. */
  monthlyCostCents: number;
  notes: string | null;
  categoryId: string | null;
  categoryName: string | null;
};

export function toCategoryDTO(row: CategoryRow): CategoryDTO {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
  };
}

export function toRecurringEntryDTO(
  row: RecurringEntryRow,
  categoryName: string | null = null,
): RecurringEntryDTO {
  return {
    id: row.id,
    label: row.label,
    kind: row.kind,
    amountCents: row.amountCents,
    cadence: row.cadence,
    monthlyCostCents: monthlyCost(row.amountCents, row.cadence),
    notes: row.notes,
    categoryId: row.categoryId,
    categoryName,
  };
}

/**
 * Monthly-amortized cost. Yearly entries divide by 12 (rounded to the nearest
 * cent) so a €600/year subscription shows up as ~€50/month.
 */
export function monthlyCost(
  amountCents: number,
  cadence: RecurringEntryRow["cadence"],
): number {
  return cadence === "yearly" ? Math.round(amountCents / 12) : amountCents;
}

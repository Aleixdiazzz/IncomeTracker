// lib/types.ts
// Owner: Shared types
// Purpose: One-stop re-export of the DTO + inferred DB types so feature code
// doesn't reach into db/schema/* directly.
export type {
  CategoryRow,
  CategoryInsert,
  CategoryKind,
} from "@/db/schema/categories";
export type {
  RecurringEntryRow,
  RecurringEntryInsert,
  Cadence,
} from "@/db/schema/recurring";
export type {
  CategoryDTO,
  RecurringEntryDTO,
} from "@/lib/dal/dto";
export type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/validation/category.schema";
export type {
  CreateRecurringInput,
  UpdateRecurringInput,
} from "@/lib/validation/recurring.schema";

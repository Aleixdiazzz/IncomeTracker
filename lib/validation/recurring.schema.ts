// lib/validation/recurring.schema.ts
// Owner: Validation
// Purpose: Zod schemas for the recurring-entry form. Amount is accepted as a
// decimal string ("19.99") and converted to integer cents — the storage unit.
// Cadence is "monthly" or "yearly"; yearly amounts are amortized at read time
// (see lib/dal/dto.ts#monthlyCost), so we still store the raw amount.
import { z } from "zod";
import { CategoryKindSchema } from "./category.schema";

// Accept either `.` or `,` as decimal separator — iOS numeric keypad only
// shows the locale separator (comma in es-ES), so refusing one locks mobile
// users out.
const AmountInCentsSchema = z
  .string()
  .trim()
  .refine((v) => v.length > 0, "Amount is required")
  .refine((v) => /^\d+([.,]\d{1,2})?$/.test(v), "Use a number like 19,99")
  .transform((v) => Math.round(parseFloat(v.replace(",", ".")) * 100))
  .refine((cents) => cents > 0, "Amount must be greater than zero");

const NotesSchema = z
  .string()
  .trim()
  .max(500, "Notes are too long")
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const CategoryIdSchema = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .pipe(z.uuid().optional());

export const CadenceSchema = z.enum(["monthly", "yearly"]);

const LabelSchema = z
  .string()
  .trim()
  .min(1, "Label is required")
  .max(80, "Label is too long");

export const CreateRecurringSchema = z.object({
  label: LabelSchema,
  kind: CategoryKindSchema,
  cadence: CadenceSchema,
  amountCents: AmountInCentsSchema,
  categoryId: CategoryIdSchema,
  notes: NotesSchema,
});

export const UpdateRecurringSchema = CreateRecurringSchema.extend({
  id: z.uuid(),
});

export type CreateRecurringInput = z.infer<typeof CreateRecurringSchema>;
export type UpdateRecurringInput = z.infer<typeof UpdateRecurringSchema>;

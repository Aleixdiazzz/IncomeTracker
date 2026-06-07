// lib/validation/category.schema.ts
// Owner: Validation
// Purpose: Zod schemas for category form input. Mirror the DB constraints in
// db/schema/categories.ts. Use these in every Server Action that mutates a
// category — never trust raw FormData.
import { z } from "zod";

export const CategoryKindSchema = z.enum(["income", "expense", "savings"]);

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name is too long"),
  kind: CategoryKindSchema,
});

export const UpdateCategorySchema = z.object({
  id: z.uuid(),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name is too long"),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

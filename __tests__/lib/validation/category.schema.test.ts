// __tests__/lib/validation/category.schema.test.ts
// Owner: Tests
// Purpose: Guard the category form input contract.
import { describe, expect, it } from "vitest";
import {
  CreateCategorySchema,
  UpdateCategorySchema,
} from "@/lib/validation/category.schema";

describe("CreateCategorySchema", () => {
  it("trims and accepts a valid name", () => {
    const parsed = CreateCategorySchema.parse({
      name: "  Groceries ",
      kind: "expense",
    });
    expect(parsed).toEqual({ name: "Groceries", kind: "expense" });
  });

  it("rejects empty names", () => {
    expect(() =>
      CreateCategorySchema.parse({ name: "  ", kind: "expense" }),
    ).toThrow();
  });

  it("rejects unknown kinds", () => {
    expect(() =>
      CreateCategorySchema.parse({ name: "Food", kind: "transfer" }),
    ).toThrow();
  });

  it("accepts the three valid kinds", () => {
    for (const kind of ["income", "expense", "savings"] as const) {
      expect(() => CreateCategorySchema.parse({ name: "X", kind })).not.toThrow();
    }
  });
});

describe("UpdateCategorySchema", () => {
  it("requires a uuid id", () => {
    expect(() =>
      UpdateCategorySchema.parse({ id: "not-a-uuid", name: "Food" }),
    ).toThrow();
  });
});

// __tests__/lib/validation/recurring.schema.test.ts
// Owner: Tests
// Purpose: Lock the form-input → DB-storage contract for recurring entries:
// amount in cents, cadence whitelist, optional category / notes coercion.
import { describe, expect, it } from "vitest";
import { CreateRecurringSchema } from "@/lib/validation/recurring.schema";

const okBase = {
  label: "Netflix",
  kind: "expense" as const,
  cadence: "monthly" as const,
  amountCents: "9.99",
  categoryId: "",
  notes: "",
};

describe("CreateRecurringSchema", () => {
  it("converts a decimal amount to integer cents", () => {
    const parsed = CreateRecurringSchema.parse(okBase);
    expect(parsed.amountCents).toBe(999);
  });

  it("accepts whole-dollar amounts", () => {
    const parsed = CreateRecurringSchema.parse({
      ...okBase,
      amountCents: "20",
    });
    expect(parsed.amountCents).toBe(2000);
  });

  it("rejects non-numeric amounts", () => {
    expect(() =>
      CreateRecurringSchema.parse({ ...okBase, amountCents: "abc" }),
    ).toThrow();
  });

  it("rejects negative amounts (regex blocks the sign)", () => {
    expect(() =>
      CreateRecurringSchema.parse({ ...okBase, amountCents: "-5" }),
    ).toThrow();
  });

  it("rejects zero", () => {
    expect(() =>
      CreateRecurringSchema.parse({ ...okBase, amountCents: "0" }),
    ).toThrow();
  });

  it("accepts the three valid kinds", () => {
    for (const kind of ["income", "expense", "savings"] as const) {
      expect(() => CreateRecurringSchema.parse({ ...okBase, kind })).not.toThrow();
    }
  });

  it("rejects unknown kinds", () => {
    expect(() =>
      CreateRecurringSchema.parse({ ...okBase, kind: "transfer" }),
    ).toThrow();
  });

  it("accepts monthly and yearly cadences", () => {
    for (const cadence of ["monthly", "yearly"] as const) {
      expect(() =>
        CreateRecurringSchema.parse({ ...okBase, cadence }),
      ).not.toThrow();
    }
  });

  it("normalises empty categoryId to undefined", () => {
    const parsed = CreateRecurringSchema.parse(okBase);
    expect(parsed.categoryId).toBeUndefined();
  });

  it("rejects empty labels", () => {
    expect(() => CreateRecurringSchema.parse({ ...okBase, label: "  " })).toThrow();
  });
});

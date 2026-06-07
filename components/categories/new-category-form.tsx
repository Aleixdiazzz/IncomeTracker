// components/categories/new-category-form.tsx
// Owner: UI / categories
// Purpose: Inline form for adding a category. useActionState surfaces both
// per-field validation errors and a top-level error string.
"use client";

import { useActionState, useId, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCategoryAction,
  type CategoryFormState,
} from "@/app/(app)/categories/actions";

const initial: CategoryFormState = {};

export function NewCategoryForm() {
  const [state, action, pending] = useActionState(
    createCategoryAction,
    initial,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const nameId = useId();
  const kindId = useId();

  // After a successful submit, the server returns the empty state. Reset
  // the form so the inputs clear and the next entry starts fresh.
  useEffect(() => {
    if (!pending && !state.error && !state.fieldErrors) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-end"
      noValidate
    >
      <div className="flex-1 space-y-1.5">
        <Label htmlFor={nameId}>Name</Label>
        <Input
          id={nameId}
          name="name"
          type="text"
          placeholder="e.g. Groceries"
          required
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>
      <div className="space-y-1.5 sm:w-40">
        <Label htmlFor={kindId}>Kind</Label>
        <Select name="kind" defaultValue="expense">
          <SelectTrigger id={kindId}>
            <SelectValue placeholder="Kind" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="savings">Savings</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending} className="sm:w-32">
        {pending ? "Adding…" : "Add"}
      </Button>
      {state.error && (
        <p
          className="text-xs text-destructive sm:basis-full"
          role="alert"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}

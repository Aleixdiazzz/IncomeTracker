// components/recurring/recurring-form.tsx
// Owner: UI / recurring
// Purpose: One form, two modes — create / edit. `kind` controls which category
// list to show; `cadence` toggles between monthly and yearly amounts.
"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
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
  createRecurringAction,
  updateRecurringAction,
  type RecurringFormState,
} from "@/app/(app)/recurring/actions";
import type { CategoryDTO, RecurringEntryDTO } from "@/lib/dal/dto";
import type { Cadence, CategoryKind } from "@/lib/types";

type RecurringFormProps = {
  categories: CategoryDTO[];
  defaultValues?: RecurringEntryDTO;
};

const initial: RecurringFormState = {};

export function RecurringForm({
  categories,
  defaultValues,
}: RecurringFormProps) {
  const isEdit = Boolean(defaultValues);
  const [state, action, pending] = useActionState(
    isEdit ? updateRecurringAction : createRecurringAction,
    initial,
  );
  const [kind, setKind] = useState<CategoryKind>(
    defaultValues?.kind ?? "expense",
  );
  const [cadence, setCadence] = useState<Cadence>(
    defaultValues?.cadence ?? "monthly",
  );

  const filteredCategories = categories.filter((c) => c.kind === kind);

  return (
    <form
      action={action}
      className="grid gap-4 rounded-lg border bg-card p-6"
      noValidate
    >
      {defaultValues && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <Field
        label="Label"
        htmlFor="entry-label"
        error={state.fieldErrors?.label}
      >
        <Input
          id="entry-label"
          name="label"
          type="text"
          placeholder="e.g. Netflix, Rent, Salary"
          defaultValue={defaultValues?.label ?? ""}
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kind" htmlFor="entry-kind" error={state.fieldErrors?.kind}>
          <Select
            name="kind"
            value={kind}
            onValueChange={(v) => setKind(v as CategoryKind)}
          >
            <SelectTrigger id="entry-kind">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field
          label="Cadence"
          htmlFor="entry-cadence"
          error={state.fieldErrors?.cadence}
        >
          <Select
            name="cadence"
            value={cadence}
            onValueChange={(v) => setCadence(v as Cadence)}
          >
            <SelectTrigger id="entry-cadence">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field
        label={cadence === "yearly" ? "Yearly amount" : "Monthly amount"}
        htmlFor="entry-amount"
        error={state.fieldErrors?.amountCents}
        hint={
          cadence === "yearly"
            ? "Will be divided by 12 to compute the monthly cost."
            : undefined
        }
      >
        <Input
          id="entry-amount"
          name="amount"
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          defaultValue={
            defaultValues
              ? (defaultValues.amountCents / 100).toFixed(2).replace(".", ",")
              : ""
          }
          required
        />
      </Field>

      <Field
        label="Category"
        htmlFor="entry-category"
        error={state.fieldErrors?.categoryId}
      >
        <Select
          name="categoryId"
          defaultValue={defaultValues?.categoryId ?? undefined}
        >
          <SelectTrigger id="entry-category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.length === 0 ? (
              <SelectItem value="__none" disabled>
                No {kind} categories yet
              </SelectItem>
            ) : (
              filteredCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </Field>

      <Field
        label="Notes"
        htmlFor="entry-notes"
        error={state.fieldErrors?.notes}
        optional
      >
        <Input
          id="entry-notes"
          name="notes"
          type="text"
          defaultValue={defaultValues?.notes ?? ""}
          placeholder="Optional context"
        />
      </Field>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="ghost" type="button">
          <Link href={`/recurring?kind=${kind}`}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Add entry"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  optional,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  optional?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="flex items-center gap-2">
        {label}
        {optional && (
          <span className="text-xs text-muted-foreground">optional</span>
        )}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

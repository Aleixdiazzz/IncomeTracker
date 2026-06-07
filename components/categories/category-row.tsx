// components/categories/category-row.tsx
// Owner: UI / categories
// Purpose: Single category row with inline rename and delete. Switches between
// "display" and "edit" modes via useState — pure client-side, no extra render
// trip.
"use client";

import { useActionState, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryFormState,
} from "@/app/(app)/categories/actions";
import type { CategoryDTO } from "@/lib/dal/dto";

const initial: CategoryFormState = {};

export function CategoryRow({ category }: { category: CategoryDTO }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(
    updateCategoryAction,
    initial,
  );

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await action(formData);
          setEditing(false);
        }}
        className="flex items-center gap-2 border-b py-2 last:border-b-0"
      >
        <input type="hidden" name="id" value={category.id} />
        <Input
          name="name"
          defaultValue={category.name}
          required
          autoFocus
          className="flex-1"
        />
        <KindBadge kind={category.kind} />
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          disabled={pending}
          aria-label="Save"
        >
          <Check className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setEditing(false)}
          aria-label="Cancel"
        >
          <X className="size-4" />
        </Button>
        {state.error && (
          <span className="text-xs text-destructive">{state.error}</span>
        )}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 border-b py-2 last:border-b-0">
      <span className="flex-1 font-medium">{category.name}</span>
      <KindBadge kind={category.kind} />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => setEditing(true)}
        aria-label="Rename"
      >
        <Pencil className="size-4" />
      </Button>
      <form action={deleteCategoryAction}>
        <input type="hidden" name="id" value={category.id} />
        <Button type="submit" size="icon" variant="ghost" aria-label="Delete">
          <Trash2 className="size-4" />
        </Button>
      </form>
    </div>
  );
}

function KindBadge({ kind }: { kind: CategoryDTO["kind"] }) {
  if (kind === "income") return <Badge>income</Badge>;
  if (kind === "savings") return <Badge variant="outline">savings</Badge>;
  return <Badge variant="secondary">expense</Badge>;
}

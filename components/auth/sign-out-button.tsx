// components/auth/sign-out-button.tsx
// Owner: UI / auth
// Purpose: Tiny client form that invokes the server `logoutAction`. Using a
// real <form> means sign-out still works without JS — clicking the button
// always issues a real POST.
"use client";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/(auth)/actions";

export function SignOutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost" size="sm">
        Sign out
      </Button>
    </form>
  );
}

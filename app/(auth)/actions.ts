// app/(auth)/actions.ts
// Owner: UI / auth
// Purpose: Server Actions for the auth forms. Calling auth.api directly (vs
// hitting /api/auth/* via fetch) lets us redirect synchronously after success
// and surface validation errors through useActionState.
//
// The nextCookies() plugin in lib/auth/auth.ts ensures Set-Cookie headers
// emitted by Better Auth land on the response of this Server Action.
"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export type AuthFormState = {
  error?: string;
  fields?: { email?: string; name?: string };
};

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required.", fields: { email } };
  }

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.body?.message ?? "Sign-in failed.", fields: { email } };
    }
    throw err;
  }

  redirect("/dashboard");
}

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return {
      error: "Name, email and password are required.",
      fields: { name, email },
    };
  }
  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
      fields: { name, email },
    };
  }

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: await headers(),
    });
  } catch (err) {
    if (err instanceof APIError) {
      return {
        error: err.body?.message ?? "Sign-up failed.",
        fields: { name, email },
      };
    }
    throw err;
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}

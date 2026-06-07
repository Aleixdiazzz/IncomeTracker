// lib/auth/client.ts
// Owner: Auth layer
// Purpose: Browser-side Better Auth client. Exposes `signIn`, `signUp`,
// `signOut`, `useSession`. Safe to import from Client Components.
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;

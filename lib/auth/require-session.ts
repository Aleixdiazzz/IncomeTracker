// lib/auth/require-session.ts
// Owner: Auth layer
// Purpose: Per-request session guard used by every DAL function and Server
// Action. Wrapping in `cache()` (React) means multiple repo calls in one
// request share a single Better Auth lookup — free deduplication.
//
// Throws `UnauthorizedError` on missing/invalid session so the call site can
// distinguish "no user" from "wrong shape of data". The protected layout at
// app/(app)/layout.tsx catches the unauthenticated case earlier; this is a
// defense-in-depth check at the data boundary.
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "UnauthorizedError";
  }
}

export type SessionContext = {
  userId: string;
  email: string;
};

/**
 * Returns `{ userId, email }` for the current request or throws
 * `UnauthorizedError` if no valid session is present.
 */
export const requireSession = cache(async (): Promise<SessionContext> => {
  const sessionData = await auth.api.getSession({ headers: await headers() });
  if (!sessionData?.user) throw new UnauthorizedError();
  return {
    userId: sessionData.user.id,
    email: sessionData.user.email,
  };
});

/**
 * Same as `requireSession` but returns `null` instead of throwing. Useful in
 * pages/layouts that branch on auth (e.g. the root redirect).
 */
export const getOptionalSession = cache(
  async (): Promise<SessionContext | null> => {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData?.user) return null;
    return {
      userId: sessionData.user.id,
      email: sessionData.user.email,
    };
  },
);

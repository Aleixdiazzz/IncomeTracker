// app/api/auth/[...all]/route.ts
// Owner: Auth layer
// Purpose: Catch-all route that exposes every Better Auth endpoint
// (/api/auth/sign-in/email, /api/auth/sign-out, /api/auth/get-session, ...).
// The client in lib/auth/client.ts calls these under the hood.
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";

export const { GET, POST } = toNextJsHandler(auth);

// app/page.tsx
// Owner: UI / root
// Purpose: Root redirect. Signed-in → /dashboard, otherwise → /login.
// Lives outside both (auth) and (app) groups so it can decide which branch
// to send the user to without triggering either group's layout side-effects.
import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth/require-session";

export default async function Home() {
  const session = await getOptionalSession();
  redirect(session ? "/dashboard" : "/login");
}

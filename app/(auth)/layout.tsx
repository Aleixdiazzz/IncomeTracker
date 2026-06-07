// app/(auth)/layout.tsx
// Owner: UI / route groups
// Purpose: Centered card shell shared by /login and /signup. The (auth) folder
// is a route group — the parens hide it from the URL — so we get a shared
// layout without nesting the path.
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOptionalSession } from "@/lib/auth/require-session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Already signed in? Skip the auth pages.
  const session = await getOptionalSession();
  if (session) redirect("/dashboard");

  return (
    <div className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 block text-center text-2xl font-semibold tracking-tight"
        >
          Income Tracker
        </Link>
        {children}
      </div>
    </div>
  );
}

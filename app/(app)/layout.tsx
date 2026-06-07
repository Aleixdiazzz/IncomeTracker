// app/(app)/layout.tsx
// Owner: UI / route groups
// Purpose: Protected layout. Any page under (app) goes through this guard, so
// individual pages don't repeat the session check. A central choke point also
// makes it impossible to forget protection when adding new routes.
//
// `headers()` is async in Next 16 — always `await` it before passing to
// auth.api.getSession or the type will be `Promise<Headers>`.
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { AppNav } from "@/components/layout/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppNav email={session.user.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}

// app/(app)/not-found.tsx
// Owner: UI / route groups
// Purpose: Renders when calling notFound() from any (app) page (e.g. an
// invalid transaction id). Also catches unknown URLs under /transactions etc.
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border bg-card p-6 text-center">
      <h1 className="text-xl font-semibold">Not found</h1>
      <p className="text-sm text-muted-foreground">
        The page or record you’re looking for doesn’t exist.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}

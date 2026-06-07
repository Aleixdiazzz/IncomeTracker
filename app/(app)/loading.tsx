// app/(app)/loading.tsx
// Owner: UI / route groups
// Purpose: Next 16 wraps the matching page.tsx in <Suspense fallback={...}>
// using this file. Renders a generic skeleton during server-component data
// fetching — nothing in here needs to know which page is loading.
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-40" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

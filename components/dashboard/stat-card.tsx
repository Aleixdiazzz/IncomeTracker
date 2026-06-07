// components/dashboard/stat-card.tsx
// Owner: UI / dashboard
// Purpose: KPI tile used three times on the dashboard. Pure server component
// — no interactivity needed.
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Tone = "neutral" | "positive" | "negative";

export function StatCard({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  tone?: Tone;
  hint?: string;
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
        ? "text-rose-600"
        : "text-foreground";
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className={`text-2xl font-semibold tabular-nums ${toneClass}`}>
          {value}
        </p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

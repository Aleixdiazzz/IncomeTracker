// components/dashboard/spend-by-category-chart.tsx
// Owner: UI / dashboard
// Purpose: Renders the spend-by-category pie chart. MUST be a Client Component
// because Recharts uses `window`. The data is fetched in the parent Server
// Component and passed in as plain JSON — the canonical RSC pattern.
"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCents } from "@/lib/format";

type Slice = { name: string; value: number };

// Neutral chart palette pulled from globals.css (--chart-1..5).
const COLORS = [
  "oklch(0.87 0 0)",
  "oklch(0.708 0 0)",
  "oklch(0.556 0 0)",
  "oklch(0.439 0 0)",
  "oklch(0.269 0 0)",
];

export function SpendByCategoryChart({ data }: { data: Slice[] }) {
  if (data.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground">
        No expenses this month yet.
      </p>
    );
  }
  return (
    <div className="h-64 rounded-lg border bg-card p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
              typeof value === "number" ? formatCents(value) : String(value)
            }
            contentStyle={{
              borderRadius: "0.5rem",
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--foreground)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

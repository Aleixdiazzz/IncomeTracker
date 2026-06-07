// components/dashboard/spend-by-category-chart.tsx
// Owner: UI / dashboard
// Purpose: Renders the spend-by-category pie chart. MUST be a Client Component
// because Recharts uses `window`. The data is fetched in the parent Server
// Component and passed in as plain JSON — the canonical RSC pattern.
//
// We render our own legend below the pie (custom flex grid) instead of using
// Recharts' built-in Legend. Recharts' legend grows vertically with the number
// of categories and pushes the pie out of its fixed-height container, which
// clips the pie on mobile when many categories exist.
"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCents } from "@/lib/format";

type Slice = { name: string; value: number };

// Distinct hues. OKLCH lets us match perceptual brightness across the rainbow
// — every wedge reads at the same intensity on light and dark backgrounds.
const COLORS = [
  "oklch(0.72 0.18 245)", // blue
  "oklch(0.74 0.18 25)",  // red
  "oklch(0.77 0.16 145)", // green
  "oklch(0.78 0.16 80)",  // amber
  "oklch(0.72 0.18 305)", // magenta
  "oklch(0.78 0.16 195)", // cyan
  "oklch(0.74 0.18 55)",  // orange
  "oklch(0.66 0.18 270)", // purple
  "oklch(0.74 0.16 110)", // lime
  "oklch(0.70 0.16 350)", // pink
  "oklch(0.78 0.13 175)", // teal
  "oklch(0.68 0.18 15)",  // crimson
];

export function SpendByCategoryChart({ data }: { data: Slice[] }) {
  if (data.length === 0) {
    return (
      <p className="flex h-64 items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground">
        No expenses this month yet.
      </p>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              isAnimationActive={false}
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
                fontSize: "0.75rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
        {data.map((slice, i) => {
          const pct = total > 0 ? Math.round((slice.value / total) * 100) : 0;
          return (
            <li key={slice.name + i} className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-sm"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="flex-1 truncate text-foreground">
                {slice.name}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {formatCents(slice.value)}
              </span>
              <span className="w-8 text-right tabular-nums text-muted-foreground">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

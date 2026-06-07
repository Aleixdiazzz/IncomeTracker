// lib/format.ts
// Owner: Shared utilities
// Purpose: Currency + date formatting used by every UI surface. Keep all
// number-to-string conversions here so a future i18n change is one file.
const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

/** 1999 → "19,99 €". UI-edge formatting only — never store the result. */
export function formatCents(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "2026-06-06" → "Jun 6, 2026". Accepts both Date and ISO string. */
export function formatDate(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return dateFormatter.format(d);
}

// components/layout/theme-provider.tsx
// Owner: UI / layout
// Purpose: Thin wrapper around next-themes so dark mode persists across reloads
// and respects the user's system preference until they override it. Used by
// the root layout; the toggle UI lives in <ThemeToggle />.
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

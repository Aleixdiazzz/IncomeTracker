// components/layout/app-nav.tsx
// Owner: UI / layout
// Purpose: Top header for the protected app. Desktop shows links inline;
// mobile gets a hamburger that opens MobileNav. Renders Server-side; only
// MobileNav itself is a Client Component.
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/recurring", label: "Recurring" },
  { href: "/categories", label: "Categories" },
];

export function AppNav({ email }: { email: string }) {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <MobileNav links={links} email={email} />
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight"
          >
            Income Tracker
          </Link>
        </div>
        <nav className="hidden gap-4 text-sm text-muted-foreground sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden text-muted-foreground sm:inline">{email}</span>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

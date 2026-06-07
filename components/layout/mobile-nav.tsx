// components/layout/mobile-nav.tsx
// Owner: UI / layout
// Purpose: Hamburger button + slide-in drawer for narrow viewports. Lives in
// its own Client Component so the surrounding header (app-nav.tsx) can stay a
// Server Component.
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavLink = { href: string; label: string };

export function MobileNav({
  links,
  email,
}: {
  links: NavLink[];
  email: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          className="sm:hidden"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col gap-6 p-6">
        <SheetHeader className="p-0 text-left">
          <SheetTitle>Income Tracker</SheetTitle>
          <p className="text-xs text-muted-foreground">{email}</p>
        </SheetHeader>
        <nav className="flex flex-col gap-1 text-sm">
          {links.map((l) => (
            <SheetClose key={l.href} asChild>
              <Link
                href={l.href}
                className="rounded-md px-3 py-2 transition-colors hover:bg-muted"
              >
                {l.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

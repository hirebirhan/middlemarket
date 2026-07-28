"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
] as const;

export default function PublicNav() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <div
      aria-label="Public sections"
      className="hidden items-center rounded-md border border-border bg-muted/60 p-0.5 md:flex"
      role="group"
    >
      {PUBLIC_LINKS.map((link) => {
        const active = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center rounded-pill px-3 text-sm font-medium transition-colors",
              active
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:bg-card/70 hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

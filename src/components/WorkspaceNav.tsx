"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";

/**
 * The signed-in header's workspace links. Each role sees the two destinations
 * it actually alternates between; admin keeps a single Console entry because
 * the rail inside /admin owns section navigation.
 */
const WORKSPACE_LINKS: Record<Role, { href: string; label: string }[]> = {
  BUYER: [
    { href: "/buyer", label: "Requests" },
    { href: "/buyer/new", label: "New request" },
  ],
  SELLER: [
    { href: "/seller", label: "Queue" },
    { href: "/seller/offers", label: "Offers" },
  ],
  ADMIN: [{ href: "/admin", label: "Console" }],
};

/** Role roots light only on an exact match; their children own sub-paths. */
function isActive(pathname: string, href: string) {
  if (href === "/buyer" || href === "/seller" || href === "/admin") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceNav({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label="Workspace"
      className="hidden items-center gap-0.5 sm:flex"
    >
      {WORKSPACE_LINKS[role].map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center rounded-md px-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

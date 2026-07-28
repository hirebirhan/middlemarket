"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, ClipboardCheck, Package, History } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavCounts = {
  pending: number;
  activeOrders: number;
};

const ITEMS: {
  href: string;
  label: string;
  /** Shorter label for the mobile strip, where four items share one row. */
  short: string;
  icon: LucideIcon;
  count?: keyof NavCounts;
  /** Draws attention only when there is work — a permanent badge is wallpaper. */
  urgent?: boolean;
}[] = [
  { href: "/admin", label: "Overview", short: "Overview", icon: LayoutDashboard },
  {
    href: "/admin/queue",
    label: "Review queue",
    short: "Queue",
    icon: ClipboardCheck,
    count: "pending",
    urgent: true,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    short: "Orders",
    icon: Package,
    count: "activeOrders",
  },
  { href: "/admin/decisions", label: "Decisions", short: "Decisions", icon: History },
];

/**
 * `/admin` is the overview and must not stay lit on every child route; the
 * others own their whole subtree.
 */
function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/** The rail. Desktop only — below `lg` the strip below replaces it. */
export function AdminSidebar({ counts }: { counts: NavCounts }) {
  const isActive = useIsActive();

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
      <nav aria-label="Admin sections" className="flex h-full flex-col gap-1 p-3">
        <p className="px-3 pt-2 pb-1 text-eyebrow font-semibold text-muted-foreground uppercase">
          Control room
        </p>
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          const count = item.count ? counts[item.count] : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium",
                "transition-colors duration-150 ease-soft",
                active
                  ? "bg-card text-foreground shadow-xs"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "size-4 shrink-0",
                  active ? "text-brand" : "text-muted-foreground"
                )}
                aria-hidden="true"
              />
              <span className="flex-1 truncate">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    "rounded-pill px-1.5 py-0.5 text-2xs font-semibold tabular-nums",
                    item.urgent
                      ? "bg-warning text-warning-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {count}
                  <span className="sr-only">
                    {" "}
                    {item.urgent ? "awaiting review" : "needing action"}
                  </span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

/**
 * The mobile equivalent. A scrolling strip rather than a hamburger drawer:
 * there are four destinations, they fit, and a drawer would hide the whole
 * navigation behind a tap plus a focus trap to save no space at all. This is
 * the same information at a shape that suits the viewport, not a shrunken rail.
 */
export function AdminTabs({ counts }: { counts: NavCounts }) {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Admin sections"
      className="sticky top-14 z-30 flex gap-1 overflow-x-auto border-b border-border bg-card/95 px-4 py-2 backdrop-blur-xl lg:hidden"
    >
      {ITEMS.map((item) => {
        const active = isActive(item.href);
        const count = item.count ? counts[item.count] : undefined;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium",
              "transition-colors duration-150 ease-soft",
              active
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {item.short}
            {count !== undefined && count > 0 && (
              <span
                className={cn(
                  "rounded-pill px-1.5 text-2xs font-semibold tabular-nums",
                  item.urgent
                    ? "bg-warning text-warning-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

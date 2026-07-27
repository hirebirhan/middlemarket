"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * The header's link to the signed-in home.
 *
 * It carries `aria-current="page"` and a visible active treatment when you are
 * already there. Without it the one navigation item in the app gave no
 * indication of where you were — and on a product where three roles see three
 * different dashboards, "which screen am I on" is a real question.
 */
export default function DashboardLink({ href }: { href: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      Dashboard
    </Link>
  );
}

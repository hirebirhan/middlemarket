"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * The signed-out header actions.
 *
 * On the marketing pages "Sign up" is the page's whole goal, so it carries the
 * filled brand button. On /login and /register the form's own submit button is
 * the primary action, so the header's version steps down to a quiet link
 * rather than competing with the thing it is pointing at.
 *
 * The link for the page you are already on is dropped rather than disabled —
 * an inert control is worse than no control.
 */
export default function AuthNav() {
  const pathname = usePathname();
  const onAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <>
      {pathname !== "/login" && (
        <Link
          href="/login"
          className="inline-flex h-9 shrink-0 items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Log in
        </Link>
      )}
      {pathname !== "/register" && (
        <Link
          href="/register"
          className={cn(
            onAuthPage
              ? "inline-flex h-9 shrink-0 items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              : buttonVariants({
                  variant: "default",
                  size: "sm",
                  className: "shrink-0 whitespace-nowrap",
                })
          )}
        >
          Sign up
        </Link>
      )}
    </>
  );
}

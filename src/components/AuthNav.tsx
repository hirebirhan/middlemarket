"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * On the auth pages the form's own submit button is the primary action, so the
 * header CTA drops its solid fill rather than competing with it — and the link
 * to the page you are already on is hidden entirely.
 */
export default function AuthNav() {
  const pathname = usePathname();
  const onAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <>
      {pathname !== "/login" && (
        <Link
          href="/login"
          className="text-muted-foreground transition-opacity hover:opacity-75"
        >
          Log in
        </Link>
      )}
      {pathname !== "/register" && (
        <Link
          href="/register"
          className={
            onAuthPage
              ? "font-medium text-foreground underline underline-offset-4 hover:no-underline"
              : "inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          }
        >
          Sign up
        </Link>
      )}
    </>
  );
}

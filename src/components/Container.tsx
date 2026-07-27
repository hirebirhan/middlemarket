import { cn } from "@/lib/utils";

/**
 * The standard page column.
 *
 * This used to live on the root layout's `<main>`, which meant every screen in
 * the product was locked to one width and one padding — including the admin
 * console, whose sidebar has to reach the viewport edge. Pages now opt in, so a
 * full-bleed shell is a layout decision rather than a fight with the shell.
 */
export function Container({
  size = "page",
  className,
  children,
}: {
  /** `page` for dashboards and marketing, `narrow` for single-column reading. */
  size?: "page" | "narrow";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 sm:px-6 sm:py-10",
        size === "page" ? "max-w-page" : "max-w-narrow",
        className
      )}
    >
      {children}
    </div>
  );
}

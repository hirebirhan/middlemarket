import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-md bg-brand font-display text-sm leading-none font-semibold text-brand-foreground",
        className
      )}
    >
      M
    </span>
  );
}

export function Logo({
  href = "/",
  className,
  compact = false,
}: {
  href?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="MiddleMarket home"
      className={cn(
        "inline-flex items-center gap-2 rounded-md transition-opacity hover:opacity-80",
        className
      )}
    >
      <LogoMark />
      {/* Signed-in headers carry more controls, so they keep the wordmark for
          wider screens. Signed-out marketing pages need the name earlier. */}
      <span
        className={cn(
          "hidden font-display text-lg leading-none font-semibold",
          compact ? "sm:inline" : "wordmark:inline"
        )}
      >
        MiddleMarket
      </span>
      <span className="sr-only sm:hidden">MiddleMarket</span>
    </Link>
  );
}

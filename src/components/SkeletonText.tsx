import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * A text-line placeholder. The stock shadcn `Skeleton` is a bare box; this
 * wrapper picks a sensible width from a named size so callers don't repeat
 * `h-4 w-*` everywhere.
 */
const WIDTHS: Record<string, string> = {
  short: "h-4 w-24",
  half: "h-4 w-1/2",
  long: "h-4 w-3/4",
};

export function SkeletonText({
  width = "long",
  className,
}: {
  width?: "short" | "half" | "long";
  className?: string;
}) {
  return <Skeleton className={cn(WIDTHS[width], className)} />;
}

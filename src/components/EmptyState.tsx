import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * What a section says when it has nothing to show.
 *
 * An empty state is the most-read screen a new account ever sees, so it gets a
 * real sentence and, wherever one exists, the button that ends the emptiness.
 * The title is sentence case at heading weight — it used to be uppercase
 * monospace, which turned "no requests yet" into an error message.
 *
 * The icon sits in a tinted well rather than floating at 40% opacity; a
 * half-faded glyph reads as something that failed to load.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-card border border-dashed border-border bg-card px-6 py-12 text-center",
        className
      )}
    >
      <span className="mb-4 grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="text-heading font-semibold">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

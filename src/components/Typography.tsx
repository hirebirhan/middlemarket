import { cn } from "@/lib/utils";

/**
 * The small caps label above a section heading.
 *
 * This is the *only* place uppercase letter-spaced type survives in the app.
 * It used to be applied — in monospace — to form labels, table headers, badges,
 * stat captions, nav links and empty states, which is what made a marketplace
 * for people read like a machine readout. Here it does real work: it separates
 * a section's category from its statement without adding another type size.
 *
 * Sans, not mono. Mono is now reserved for figures.
 */
export function Eyebrow({
  children,
  className,
  as: Tag = "p",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
}) {
  return (
    <Tag
      className={cn(
        "text-eyebrow font-semibold uppercase text-muted-foreground",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * The top of a dashboard. Gives every authenticated page the same anatomy —
 * who you are, what this screen is, and what you can do from here — so moving
 * between buyer, seller and admin never feels like moving between products.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-2 border-b border-border/40",
        className
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          {eyebrow && <Eyebrow className="shrink-0">{eyebrow}</Eyebrow>}
          <h1 className="font-display text-title font-semibold tracking-tight">
            {title}
          </h1>
        </div>
        {description && (
          <p className="mt-0.5 max-w-prose text-xs sm:text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * A monetary figure. Tabular so columns of prices line up on the decimal, and
 * monospace because a price is data — this is what the mono face is *for*.
 */
export function Money({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={
        className
          ? `font-mono tabular-nums ${className}`
          : "font-mono tabular-nums"
      }
    >
      {children}
    </span>
  );
}

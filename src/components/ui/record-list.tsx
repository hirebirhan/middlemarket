import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A table-like list that actually reflows.
 *
 * Below `md` every row becomes a stack of label/value pairs; at `md` and up the
 * shared column template kicks in and the header row appears. The template
 * lives in a CSS custom property so the header and every row stay in sync
 * without repeating an arbitrary Tailwind class in three places.
 */

type Column = { label: string; align?: "left" | "right" };

export function RecordList({
  columns,
  template,
  className,
  children,
}: {
  columns: Column[];
  /** A grid-template-columns value, e.g. "1fr auto auto". */
  template: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ "--record-cols": template } as React.CSSProperties}
      className={cn(
        "overflow-hidden rounded-card border border-border",
        className
      )}
    >
      <div className="hidden gap-4 bg-muted/60 px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid md:[grid-template-columns:var(--record-cols)]">
        {columns.map((column) => (
          <span
            key={column.label}
            className={cn(column.align === "right" && "text-right")}
          >
            {column.label}
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}

export function RecordRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-2 border-t border-border px-5 py-4 text-sm transition-colors",
        "md:gap-4 md:[grid-template-columns:var(--record-cols)] md:items-center",
        "hover:bg-accent/50",
        className
      )}
    >
      {children}
    </div>
  );
}

export function RecordCell({
  label,
  align = "left",
  className,
  children,
}: {
  /** Shown only on mobile, where the header row is hidden. */
  label?: string;
  align?: "left" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-baseline justify-between gap-3 md:block",
        align === "right" && "md:text-right",
        className
      )}
    >
      {label && (
        <span className="shrink-0 text-xs uppercase tracking-wide text-muted-foreground md:hidden">
          {label}
        </span>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

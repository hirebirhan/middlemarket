import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A table-like list that actually reflows.
 *
 * Below `md` every row becomes a stack of label/value pairs; at `md` and up the
 * shared column template kicks in and the header row appears. The template
 * lives in a CSS custom property, applied through the `.record-grid` utility,
 * so the header and every row stay in sync from a single declaration — and
 * without an arbitrary `[grid-template-columns:…]` class repeated in two places.
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
        "overflow-hidden rounded-card border border-border bg-card",
        className
      )}
    >
      <div className="record-grid hidden gap-4 border-b border-border bg-muted px-5 py-2.5 text-label font-medium text-muted-foreground md:grid">
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
        // Stacked on mobile: a row of key/value pairs with room to breathe.
        "grid grid-cols-1 gap-2.5 px-5 py-4 text-sm",
        // Tabular from md up.
        "record-grid md:items-center md:gap-4",
        // The divider lives on the row, not between rows, so a list stays
        // aligned no matter which row is first after a filter.
        "border-t border-border first:border-t-0",
        "transition-colors duration-150 ease-soft hover:bg-accent",
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
        <span className="shrink-0 text-xs text-muted-foreground md:hidden">
          {label}
        </span>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

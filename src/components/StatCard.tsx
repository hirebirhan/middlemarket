import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Stat = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Jumps to the section this stat summarises. Without it the card is inert. */
  href?: string;
  tone?: "neutral" | "warning" | "success" | "brand";
  /** Small qualifier under the number, e.g. "awaiting your decision". */
  hint?: string;
};

/** Icon sits in a tinted well so the tone reads before the number does. */
const CHIP = {
  neutral: "bg-secondary text-muted-foreground",
  warning: "bg-warning text-warning-foreground",
  success: "bg-success text-success-foreground",
  brand: "bg-brand-muted text-brand",
} as const;

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tone = "neutral",
  hint,
}: Stat) {
  const body = (
    <>
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg transition-transform duration-150 ease-soft group-hover:-translate-y-px",
          CHIP[tone]
        )}
      >
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-2xl leading-none font-semibold tabular-nums">
          {value}
        </span>
        {/* Sentence case, sans. This caption used to be uppercase monospace and
            clipped to "AWAIT…" inside the sidebar; now it just reads. */}
        <span className="mt-1.5 block truncate text-sm text-muted-foreground">
          {hint ?? label}
        </span>
      </span>
      {href && (
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 shrink-0 self-start text-muted-foreground opacity-0 transition-opacity duration-150 ease-soft group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      )}
    </>
  );

  const base =
    "group flex items-center gap-3 rounded-card border border-border bg-card p-4 shadow-sm";

  if (!href) return <div className={base}>{body}</div>;

  return (
    <Link
      href={href}
      className={cn(
        base,
        "transition-colors duration-150 ease-soft hover:border-border-strong hover:bg-accent"
      )}
    >
      {body}
    </Link>
  );
}

export function StatGrid({
  stats,
  className,
}: {
  stats: Stat[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3", className ?? "grid-cols-2")}>
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

/**
 * The headline number for a dashboard. MiddleMarket's whole promise is that
 * mediation saves the buyer money, so that figure gets the largest type on the
 * page rather than sitting in a row of equal-weight tiles.
 *
 * The figure is monospace and tabular — it is the one number people will
 * compare against their own arithmetic, and it has to line up while doing it.
 */
export function MetricHero({
  label,
  value,
  hint,
  icon: Icon,
  footer,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-brand-border/50 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4 text-brand" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-3 font-mono text-metric font-semibold break-words tabular-nums text-brand">
        {value}
      </p>
      {hint && (
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      )}
      {footer && <div className="mt-4 border-t border-border pt-3">{footer}</div>}
    </div>
  );
}

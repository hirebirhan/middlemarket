import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Stat = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Jumps to the section this stat summarises. Without it the card is inert. */
  href?: string;
  tone?: "neutral" | "warning" | "success";
};

const TONE = {
  neutral: "text-muted-foreground",
  warning: "text-warning-foreground",
  success: "text-success-foreground",
} as const;

export function StatCard({ label, value, icon: Icon, href, tone = "neutral" }: Stat) {
  const body = (
    <>
      <span className="flex items-center gap-2.5">
        <Icon className={cn("h-4 w-4 shrink-0", TONE[tone])} aria-hidden="true" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </span>
      <span className="text-lg font-semibold tabular-nums">{value}</span>
    </>
  );

  const className =
    "flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3";

  if (!href) {
    return <div className={className}>{body}</div>;
  }

  return (
    <Link
      href={href}
      className={cn(className, "transition-colors hover:bg-accent")}
    >
      {body}
    </Link>
  );
}

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}

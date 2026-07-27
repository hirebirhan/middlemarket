import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The happy path an order walks. CANCELLED is deliberately not a step — it is
 * an exit from the track, so it renders as its own state rather than pretending
 * to be further along than PENDING.
 *
 * Layout note: the steps sit in a fixed four-column grid and each connector is
 * drawn from the previous circle's centre to this one (`-left-1/2` → `right-1/2`)
 * behind the markers. The previous version laid the labels out in the normal
 * flow next to a flexible connector, so at sidebar width "In progress" and
 * "Delivered" ran into each other.
 */
const STEPS = ["PENDING", "IN_PROGRESS", "DELIVERED", "COMPLETED"] as const;

const LABEL: Record<string, string> = {
  PENDING: "Placed",
  IN_PROGRESS: "In progress",
  DELIVERED: "Delivered",
  COMPLETED: "Complete",
  CANCELLED: "Cancelled",
};

export function OrderProgress({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <p className="flex items-center gap-2 text-xs font-medium text-danger-foreground">
        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-danger">
          <X className="size-3" aria-hidden="true" />
        </span>
        Order cancelled
      </p>
    );
  }

  const current = STEPS.indexOf(status as (typeof STEPS)[number]);

  return (
    <ol
      className="grid grid-cols-4"
      aria-label={`Order progress: ${LABEL[status] ?? status}`}
    >
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={step}
            aria-current={active ? "step" : undefined}
            className="relative flex flex-col items-center gap-1.5 px-1"
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  // top-2.5 is the vertical centre of the size-5 marker.
                  "absolute top-2.5 right-1/2 -left-1/2 h-px",
                  i <= current ? "bg-brand" : "bg-border"
                )}
              />
            )}
            <span
              className={cn(
                "relative grid size-5 shrink-0 place-items-center rounded-full border text-2xs font-semibold tabular-nums transition-colors",
                done && "border-brand bg-brand text-brand-foreground",
                active && "border-brand bg-brand-muted text-brand",
                // An explicit surface, so the connector passes behind the
                // marker rather than through it.
                !done && !active && "border-border bg-card text-muted-foreground"
              )}
            >
              {done ? <Check className="size-3" aria-hidden="true" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-center text-2xs leading-tight",
                active ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {LABEL[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

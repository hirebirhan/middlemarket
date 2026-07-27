import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonText } from "@/components/SkeletonText";

/**
 * Shown while a dashboard's queries run. All three dashboards are
 * `force-dynamic`, so every navigation waits on the database — until this
 * existed that wait was a blank screen with no indication anything had
 * happened.
 *
 * The shape matters as much as the presence. A skeleton meaningfully shorter
 * than the page it stands in for drags the footer up into view and then drops
 * it again when the data lands: the admin dashboard measured 0.213 CLS from
 * exactly that, well past the 0.1 "good" threshold. So each route describes
 * the sections it actually renders, and the skeleton reserves that space.
 */

type SectionShape = {
  /** "cards" for a stack of record cards, "table" for a header + rows. */
  kind: "cards" | "table";
  rows?: number;
  /** Mirrors a section that carries a search box or filter tabs above it. */
  toolbar?: boolean;
};

function Section({ kind, rows = 3, toolbar }: SectionShape) {
  return (
    <div className="space-y-5">
      <div className="space-y-2 border-b border-border pb-4">
        <Skeleton className="h-5 w-40" />
        <SkeletonText width="half" />
      </div>

      {toolbar && <Skeleton className="h-10 w-64 rounded-xl" />}

      {kind === "cards" ? (
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="space-y-3 rounded-card border border-border bg-card p-5"
            >
              <Skeleton className="h-4 w-1/3" />
              <SkeletonText width="long" />
              <SkeletonText width="half" />
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border bg-card">
          <div className="border-b border-border bg-muted px-5 py-2.5">
            <Skeleton className="h-3.5 w-24" />
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="space-y-2 border-t border-border px-5 py-4 first:border-t-0"
            >
              <Skeleton className="h-4 w-2/5" />
              <SkeletonText width="short" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DashboardSkeleton({
  /** Match the number of stat tiles the real page renders in its rail. */
  stats = 3,
  metric = true,
  /** Whether the sidebar also holds a form, as the buyer's does. */
  sidebarForm = false,
  /**
   * Buyer and seller put their stats in a left rail. The admin console already
   * has a rail — its nav — so its pages run full width instead.
   */
  rail = true,
  /** Stat tiles across the top, for the full-width console layout. */
  statRow,
  sections,
}: {
  stats?: number;
  metric?: boolean;
  sidebarForm?: boolean;
  rail?: boolean;
  statRow?: number;
  sections: SectionShape[];
}) {
  const body = (
    <div className="min-w-0 flex-1 space-y-10">
      {sections.map((section, i) => (
        <Section key={i} {...section} />
      ))}
    </div>
  );

  return (
    <div
      className="mx-auto w-full max-w-page space-y-8 px-4 py-8 sm:px-6 sm:py-10"
      aria-busy="true"
    >
      {/* Announced once, rather than letting a dozen grey boxes be read out. */}
      <p className="sr-only" role="status">
        Loading…
      </p>

      <div className="space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-56" />
        <SkeletonText width="long" className="max-w-md" />
      </div>

      {statRow !== undefined && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: statRow }).map((_, i) => (
            <Skeleton key={i} className="h-22 rounded-card" />
          ))}
        </div>
      )}

      {rail ? (
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="space-y-4 lg:w-72 lg:shrink-0">
            {metric && <Skeleton className="h-44 rounded-card" />}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {Array.from({ length: stats }).map((_, i) => (
                <Skeleton key={i} className="h-22 rounded-card" />
              ))}
            </div>
            {sidebarForm && <Skeleton className="h-10 rounded-lg" />}
          </div>
          {body}
        </div>
      ) : (
        body
      )}
    </div>
  );
}

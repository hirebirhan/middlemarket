import { formatMoneyCompact } from "@/lib/money";
import { getPlatformStats } from "@/lib/platform-stats";

/**
 * The real-activity band shared by the public pages. Every figure comes from
 * the database; the band renders nothing on an empty marketplace rather than
 * quoting zeros.
 */
export async function PlatformActivity() {
  const stats = await getPlatformStats();

  const activity = [
    stats.requestsPosted > 0 && {
      label: "Requests posted by buyers",
      value: stats.requestsPosted.toLocaleString("en-US"),
    },
    stats.offersReviewed > 0 && {
      label: "Prices reviewed before comparison",
      value: stats.offersReviewed.toLocaleString("en-US"),
    },
    stats.savedByMediation > 0 && {
      label: "Saved by mediation",
      value: formatMoneyCompact(stats.savedByMediation),
    },
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  if (activity.length === 0) return null;

  return (
    <section
      aria-label="Marketplace activity so far"
      className="border-b border-border bg-card"
    >
      <dl className="mx-auto grid max-w-page grid-cols-1 divide-y divide-border px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
        {activity.map((item) => (
          <div
            key={item.label}
            className="py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0"
          >
            <dt className="text-xs font-medium text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 font-mono text-title font-semibold tabular-nums">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

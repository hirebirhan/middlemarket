/**
 * Relative age for queue triage. A seller deciding "which requests should I
 * quote now?" reads "2 days ago" faster than a calendar date, and stale
 * requests read as stale without anyone computing dates in their head.
 *
 * Deterministic and server-rendered: `now` is injectable so tests and the
 * server agree, and the rendered HTML never depends on the client's clock.
 * Past two weeks the calendar date is more useful than "23 days ago".
 */
const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days elapsed since `posted`, floor at 0 for same-day posts. */
export function ageInDays(posted: Date, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - posted.getTime()) / DAY_MS));
}

export function formatPostedAge(posted: Date, now: Date = new Date()): string {
  const days = ageInDays(posted, now);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return posted.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: posted.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

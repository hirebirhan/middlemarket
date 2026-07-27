/**
 * URL state for the dashboard lists.
 *
 * Every list on this product is server-rendered, so its search term, filter and
 * page live in the query string rather than in client state. That buys three
 * things for free: the back button works, a filtered view can be sent to
 * someone, and a reload does not silently drop you back to page one of an
 * unfiltered list. It also keeps the pages Server Components — the only
 * client-side JavaScript any of this needs is the debounce on the search box.
 */

/**
 * Ten rows. Enough that the common case needs no paging at all, few enough
 * that a page of seller request cards — each of which can open an offer form —
 * stays a screen you can read rather than a wall you scroll past.
 */
export const PAGE_SIZE = 10;

/** Query keys, named once so a page and its links cannot disagree. */
export const PARAM = {
  search: "q",
  requests: "requests",
  offers: "offers",
  orders: "orders",
  decisions: "decisions",
} as const;

export type SearchParams = Record<string, string | string[] | undefined>;

/** First value only — `?q=a&q=b` is a malformed URL, not two searches. */
export function readParam(
  params: SearchParams,
  key: string
): string | undefined {
  const value = params[key];
  const first = Array.isArray(value) ? value[0] : value;
  const trimmed = first?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Narrows a query value to a known option. Anything unrecognised — a typo, a
 * stale bookmark, a hand-edited URL — falls back to the default rather than
 * producing an empty list the user cannot explain.
 */
export function readOption<T extends string>(
  params: SearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T
): T {
  const value = readParam(params, key);
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** 1-based, and never NaN, zero or negative however the URL was edited. */
export function readPage(params: SearchParams, key: string): number {
  const raw = Number(readParam(params, key));
  return Number.isInteger(raw) && raw > 0 ? raw : 1;
}

export type Page = {
  /** For `prisma.findMany`. */
  skip: number;
  take: number;
  page: number;
  totalPages: number;
  total: number;
  /** 1-based inclusive range being shown, for "Showing 1–10 of 42". */
  from: number;
  to: number;
};

export function paginate(total: number, page: number, size = PAGE_SIZE): Page {
  const totalPages = Math.max(1, Math.ceil(total / size));
  // A filter that shrinks the result set can strand you on page 5 of 2.
  // Clamping means that URL shows the last page instead of nothing at all.
  const current = Math.min(page, totalPages);
  const skip = (current - 1) * size;
  return {
    skip,
    take: size,
    page: current,
    totalPages,
    total,
    from: total === 0 ? 0 : skip + 1,
    to: Math.min(skip + size, total),
  };
}

/**
 * Builds a link to the same page with some query values changed. `null` clears
 * a key — that is how defaults (page 1, an empty search, the "all" filter) stay
 * out of the URL entirely, so the address bar only ever shows what the user
 * actually chose.
 */
export function listHref(
  basePath: string,
  current: SearchParams,
  updates: Record<string, string | number | null>
): string {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) next.set(key, first);
  }
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, String(value));
  }

  const query = next.toString();
  return query ? `${basePath}?${query}` : basePath;
}

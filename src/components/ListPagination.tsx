import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { listHref, type Page, type SearchParams } from "@/lib/list-params";

/**
 * Server-rendered pagination for a dashboard list.
 *
 * The stock shadcn `Pagination` is a set of low-level primitives; this wrapper
 * owns the page math and URL building so every list (queue, decisions, orders,
 * buyer, seller) gets the same nav with one line of JSX.
 *
 * Links are real `<a>` tags — the URL is the state, so a page can be shared,
 * the back button works, and no client JavaScript is needed to turn a page.
 */
export function ListPagination({
  page,
  basePath,
  params,
  pageKey,
  label,
}: {
  page: Page;
  basePath: string;
  params: SearchParams;
  pageKey: string;
  /** Used in the aria-label, e.g. "offers awaiting review". */
  label: string;
}) {
  if (page.totalPages <= 1) return null;

  const href = (n: number) =>
    listHref(basePath, params, { [pageKey]: n === 1 ? null : n });

  const prev = page.page > 1 ? href(page.page - 1) : undefined;
  const next = page.page < page.totalPages ? href(page.page + 1) : undefined;

  // Show first, last, current, and neighbours — same window the old custom
  // component produced.
  const pages = pageRange(page.page, page.totalPages);

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={prev}
            aria-disabled={!prev}
            aria-label={`Previous page of ${label}`}
          />
        </PaginationItem>

        {pages.map((p, i) =>
          p === null ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href={href(p)}
                isActive={p === page.page}
                aria-label={`Page ${p} of ${label}`}
                aria-current={p === page.page ? "page" : undefined}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href={next}
            aria-disabled={!next}
            aria-label={`Next page of ${label}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

/** Window of page numbers to show, with `null` for ellipsis gaps. */
function pageRange(current: number, total: number): (number | null)[] {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      out.push(null);
    }
  }
  return out;
}

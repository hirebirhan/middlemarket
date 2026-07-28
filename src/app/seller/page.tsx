import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, SearchX, ArrowRight } from "lucide-react";
import type { OfferStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  PARAM,
  paginate,
  readOption,
  readPage,
  readParam,
  type SearchParams,
} from "@/lib/list-params";
import { SearchField } from "@/components/SearchField";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { ListPagination } from "@/components/ListPagination";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/Container";
import { SellerRequestCard } from "@/components/SellerRequestCard";

export const metadata: Metadata = {
  title: "Your shop",
  description:
    "Browse open buyer requests, send your best price, and follow the offers you have in review.",
  // Signed-in surfaces hold one account's data and must never be crawled.
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** An offer that still occupies the seller's one slot on a request. */
const LIVE_STATUSES: OfferStatus[] = ["PENDING_REVIEW", "APPROVED", "ACCEPTED"];

/**
 * The seller's triage question is "what haven't I quoted yet?", so that is a
 * filter rather than something to be worked out by scanning.
 */
const REQUEST_VIEWS = ["new", "all"] as const;

export default async function SellerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Previously sent buyers back to /seller, which redirected them here again —
  // an infinite loop.
  if (user.role !== "SELLER") redirect(user.role === "ADMIN" ? "/admin" : "/buyer");

  const params = await searchParams;
  const query = readParam(params, PARAM.search);
  const requestView = readOption(params, PARAM.requests, REQUEST_VIEWS, "new");

  // Title, exact model and the buyer's notes are all places the thing a shop
  // stocks might be named, so all three are searched.
  const requestWhere: Prisma.RequestWhereInput = {
    status: "OPEN",
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { sku: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(requestView === "new"
      ? { offers: { none: { sellerId: user.id, status: { in: LIVE_STATUSES } } } }
      : {}),
  };

  const [requestTotal, unquotedTotal, openRequestTotal] = await Promise.all([
    prisma.request.count({ where: requestWhere }),
    prisma.request.count({
      where: {
        status: "OPEN",
        offers: { none: { sellerId: user.id, status: { in: LIVE_STATUSES } } },
      },
    }),
    prisma.request.count({ where: { status: "OPEN" } }),
  ]);

  const requestPage = paginate(requestTotal, readPage(params, "rpage"));

  const openRequests = await prisma.request.findMany({
    where: requestWhere,
    include: {
      buyer: true,
      offers: {
        where: { sellerId: user.id },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: requestPage.skip,
    take: requestPage.take,
  });

  const requestNoun = (count: number) => `request${count === 1 ? "" : "s"}`;
  const requestHeading = query
    ? `${requestTotal} matching ${requestNoun(requestTotal)}`
    : requestView === "all"
      ? `${openRequestTotal} open ${requestNoun(openRequestTotal)}`
      : `${unquotedTotal} ${requestNoun(unquotedTotal)} ${
          unquotedTotal === 1 ? "needs" : "need"
        } a price`;
  const requestDescription =
    requestView === "all"
      ? "All open buyer requests, including the ones you have already quoted."
      : "Quote requests you can fulfil. Every offer is checked before the buyer sees it.";

  return (
    <Container className="flex flex-col gap-8 pt-5 sm:pt-6">
      <section id="open-requests" className="scroll-mt-24">
        <div className="border-b border-border pb-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground">
                Seller queue
              </p>
              <h1 className="mt-1 font-display text-title font-semibold">
                {requestHeading}
              </h1>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                {requestDescription}
              </p>
            </div>
            <Link
              href="/seller/offers"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "w-full justify-center sm:w-auto",
              })}
            >
              View offers
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchField
              paramKey={PARAM.search}
              pageKey="rpage"
              label="Search open requests"
              placeholder="Search by item, model or detail..."
              className="sm:max-w-xs sm:flex-1"
            />
            <FilterTabs
              label="Filter open requests"
              basePath="/seller"
              params={params}
              paramKey={PARAM.requests}
              pageKey="rpage"
              value={requestView}
              options={[
                { value: "new", label: "Needs quote" },
                { value: "all", label: "All" },
              ]}
            />
          </div>
        </div>

        <div className="mt-3">
          {openRequests.length === 0 ? (
            // A search that found nothing and an inbox that is genuinely
            // empty are different situations with different next actions.
            // Telling someone to "check back shortly" when they simply
            // mistyped a model number is how a working feature gets reported
            // as broken.
            query || requestView === "new" ? (
              <EmptyState
                icon={SearchX}
                title="Nothing matches that"
                description={
                  query
                    ? `No open request mentions "${query}". Try a shorter term, or clear the search to see everything buyers are asking for.`
                    : "You've quoted every open request. New ones appear here as buyers post them."
                }
                action={
                  <Link
                    href="/seller?requests=all"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Show all open requests
                  </Link>
                }
              />
            ) : (
              <EmptyState
                icon={Inbox}
                title="No open requests right now"
                description="Buyers post throughout the day. New requests appear here automatically."
              />
            )
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
              {openRequests.map((request) => {
                const latest = request.offers[0];
                const live = request.offers.find((o) =>
                  LIVE_STATUSES.includes(o.status)
                );
                // A rejection used to lock the seller out of the request for
                // good; now they can act on the feedback and bid again.
                const wasRejected = !live && latest?.status === "REJECTED";

                return (
                  <SellerRequestCard
                    key={request.id}
                    request={request}
                    liveOffer={live}
                    latestRejectedOffer={wasRejected ? latest : undefined}
                  />
                );
              })}
            </div>
          )}
        </div>

        <ListPagination
          page={requestPage}
          basePath="/seller"
          params={params}
          pageKey="rpage"
          label="open requests"
        />
      </section>
    </Container>
  );
}

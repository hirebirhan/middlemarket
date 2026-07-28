import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Inbox,
  Plus,
  SearchX,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { formatPostedAge } from "@/lib/time";
import {
  PAGE_SIZE,
  PARAM,
  paginate,
  readOption,
  readPage,
  readParam,
  type SearchParams,
} from "@/lib/list-params";
import StatusBadge from "@/components/StatusBadge";
import { SearchField } from "@/components/SearchField";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/SectionHeader";
import { FilterTabs } from "@/components/FilterTabs";
import { ListPagination } from "@/components/ListPagination";
import { BuyerOfferCard } from "@/components/BuyerOfferCard";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader, Money } from "@/components/Typography";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "Your requests",
  description:
    "Post what you need, see checked offers from shops in Addis Ababa, and track your orders.",
  // Signed-in surfaces hold one account's data and must never be crawled.
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * A buyer's three questions, in the order they ask them: what needs me, what
 * is on its way, and what have I asked for.
 */
const VIEWS = ["all", "deciding", "ordered"] as const;

/** Downward adjustments only — approving at the asking price saves nothing. */
function savingOn(offer: { price: unknown; adminPrice: unknown }) {
  if (offer.adminPrice === null || offer.adminPrice === undefined) return 0;
  const diff = Number(offer.price) - Number(offer.adminPrice);
  return diff > 0 ? diff : 0;
}

export default async function BuyerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "BUYER") redirect(user.role === "ADMIN" ? "/admin" : "/seller");

  const params = await searchParams;
  const query = readParam(params, PARAM.search);
  const view = readOption(params, PARAM.requests, VIEWS, "all");

  const requestWhere: Prisma.RequestWhereInput = {
    buyerId: user.id,
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(view === "deciding"
      ? { offers: { some: { status: "APPROVED" } } }
      : view === "ordered"
        ? { offers: { some: { order: { isNot: null } } } }
        : {}),
  };

  // Every figure below is computed across the buyer's whole history, never
  // across the page on screen — "saved by mediation" that shrinks when you
  // filter would be worse than showing nothing.
  const [
    requestTotal,
    allRequestTotal,
    decidingTotal,
    orderedTotal,
    visibleOffers,
  ] = await Promise.all([
    prisma.request.count({ where: requestWhere }),
    prisma.request.count({ where: { buyerId: user.id } }),
    prisma.request.count({
      where: { buyerId: user.id, offers: { some: { status: "APPROVED" } } },
    }),
    prisma.request.count({
      where: { buyerId: user.id, offers: { some: { order: { isNot: null } } } },
    }),
    prisma.offer.findMany({
      where: {
        request: { buyerId: user.id },
        status: { in: ["APPROVED", "ACCEPTED"] },
      },
      select: {
        status: true,
        price: true,
        adminPrice: true,
        order: { select: { status: true } },
      },
    }),
  ]);

  const requestPage = paginate(requestTotal, readPage(params, "page"));

  const requests = await prisma.request.findMany({
    where: requestWhere,
    include: {
      offers: {
        where: { status: { in: ["APPROVED", "ACCEPTED"] } },
        include: { seller: true, order: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: requestPage.skip,
    take: requestPage.take,
  });

  const awaitingDecision = visibleOffers.filter((o) => o.status === "APPROVED");
  const activeOrders = visibleOffers.filter(
    (o) =>
      o.order && o.order.status !== "COMPLETED" && o.order.status !== "CANCELLED"
  );

  // The product's whole promise, measured from real rows: what the seller asked
  // minus what the review brought it down to, on offers this buyer accepted.
  const accepted = visibleOffers.filter((o) => o.status === "ACCEPTED");
  const savedTotal = accepted.reduce((sum, o) => sum + savingOn(o), 0);
  const savedOn = accepted.filter((o) => savingOn(o) > 0).length;

  // Same figure for offers still awaiting the buyer's decision.
  const pendingSaving = awaitingDecision.reduce(
    (sum, o) => sum + savingOn(o),
    0
  );

  return (
    <Container className="space-y-8">
      <PageHeader
        eyebrow="Buyer"
        title={`Hi, ${user.name.split(" ")[0]}`}
        description={
          awaitingDecision.length > 0
            ? `You have ${awaitingDecision.length} reviewed offer${awaitingDecision.length === 1 ? "" : "s"} waiting on your decision.`
            : "Post what you need, and we'll bring you prices worth saying yes to."
        }
        action={
          <Link
            href="/buyer/new"
            className={buttonVariants({ variant: "default" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Post a request
          </Link>
        }
      />

      {/* Flat stat strip: the numbers a buyer checks first, in decision
          order. Hairline cells, not tiles — this is a console, not a
          marketing dashboard. */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border lg:grid-cols-4">
        <div className="bg-card p-4">
          <dt className="text-xs text-muted-foreground">To decide</dt>
          <dd
            className={
              awaitingDecision.length > 0
                ? "mt-1 text-xl font-semibold tabular-nums text-warning-foreground"
                : "mt-1 text-xl font-semibold tabular-nums"
            }
          >
            {awaitingDecision.length}
          </dd>
        </div>
        <div className="bg-card p-4">
          <dt className="text-xs text-muted-foreground">Active orders</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums">
            {activeOrders.length}
          </dd>
        </div>
        <div className="bg-card p-4">
          <dt className="text-xs text-muted-foreground">Requests posted</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums">
            {allRequestTotal}
          </dd>
        </div>
        <div className="bg-card p-4">
          <dt className="text-xs text-muted-foreground">Saved by mediation</dt>
          <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-brand">
            {formatMoney(savedTotal) ?? "—"}
          </dd>
          {pendingSaving > 0 && (
            <dd className="mt-1 text-xs text-muted-foreground">
              {formatMoney(pendingSaving)} more awaiting your decision
            </dd>
          )}
        </div>
      </dl>

      <section id="requests" className="scroll-mt-24">
          <SectionHeader
            title="Your requests"
            description="Only offers our team has already checked appear here."
          />

          {/* A buyer with two requests does not need to filter them. The
              controls appear once the list is long enough to be worth
              narrowing. */}
          {allRequestTotal > 3 && (
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <FilterTabs
                label="Filter your requests"
                basePath="/buyer"
                params={params}
                paramKey={PARAM.requests}
                pageKey="page"
                value={view}
                options={[
                  { value: "all", label: "All", count: allRequestTotal },
                  { value: "deciding", label: "To decide", count: decidingTotal },
                  { value: "ordered", label: "Ordered", count: orderedTotal },
                ]}
              />
              {allRequestTotal > PAGE_SIZE && (
                <SearchField
                  paramKey={PARAM.search}
                  pageKey="page"
                  label="Search your requests"
                  placeholder="Search your requests…"
                  className="sm:max-w-xs sm:flex-1"
                />
              )}
            </div>
          )}

          {requests.length === 0 ? (
            query || view !== "all" ? (
              <EmptyState
                icon={SearchX}
                title="Nothing here"
                description={
                  query
                    ? `None of your requests mention “${query}”.`
                    : view === "deciding"
                      ? "No offer is waiting on your decision right now. We'll bring you checked prices as shops respond."
                      : "You haven't placed an order yet. Accept a checked offer and it will appear here."
                }
                action={
                  <Link
                    href="/buyer#requests"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Show all requests
                  </Link>
                }
              />
            ) : (
              <EmptyState
                icon={Inbox}
                title="Nothing posted yet"
                description="Tell us what you're after and shops around Addis will come back with their best price. It's free, and you're never obliged to accept."
                action={
                  <Link
                    href="/buyer/new"
                    className={buttonVariants({ variant: "default", size: "sm" })}
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Post your first request
                  </Link>
                }
              />
            )
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
              {requests.map((request) => {
                const budget = formatMoney(request.budget);
                return (
                  <article key={request.id}>
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 p-4 sm:p-5">
                      <div className="min-w-0">
                        <h3 className="font-semibold">{request.title}</h3>
                        {request.sku && (
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {request.sku}
                          </p>
                        )}
                        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                          {request.description}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {budget && (
                            <span>
                              Budget <Money>{budget}</Money>
                            </span>
                          )}
                          <time dateTime={request.createdAt.toISOString()}>
                            Posted {formatPostedAge(request.createdAt)}
                          </time>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <StatusBadge value={request.type} />
                        <StatusBadge value={request.status} />
                      </div>
                    </div>

                    {request.offers.length === 0 ? (
                      <p className="border-t border-border bg-muted/60 px-4 py-3.5 text-sm text-muted-foreground sm:px-5">
                        {request.status === "OPEN"
                          ? "No checked offers yet. Shops are still responding — we'll list them here as soon as our team has been through the price."
                          : "This request is closed."}
                      </p>
                    ) : (
                      <div className="border-t border-border">
                        {request.offers.map((offer) => (
                          <BuyerOfferCard key={offer.id} offer={offer} />
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          <ListPagination
            page={requestPage}
            basePath="/buyer"
            params={params}
            pageKey="page"
            label="requests"
          />
      </section>
    </Container>
  );
}

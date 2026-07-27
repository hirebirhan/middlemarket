import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Inbox,
  Clock,
  Package,
  PiggyBank,
  Plus,
  SearchX,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
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
import { StatGrid, MetricHero } from "@/components/StatCard";
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

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="space-y-4 lg:w-72 lg:shrink-0">
          <MetricHero
            label="Saved by mediation"
            value={formatMoney(savedTotal) ?? "—"}
            icon={PiggyBank}
            hint={
              savedOn > 0
                ? `Across ${savedOn} order${savedOn === 1 ? "" : "s"} where our review brought the price down.`
                : "Once you accept a reviewed offer, what we saved you shows up here."
            }
            footer={
              pendingSaving > 0 ? (
                <p className="text-xs text-muted-foreground">
                  <Money className="font-semibold text-foreground">
                    {formatMoney(pendingSaving)}
                  </Money>{" "}
                  more is waiting on offers you haven&apos;t decided on yet.
                </p>
              ) : null
            }
          />

          {/* Each tile now lands on the view it counts. They all pointed at the
              same `#requests` anchor before, so "3 to decide" dropped you at
              the top of an unfiltered list to go and find them yourself. */}
          <StatGrid
            stats={[
              {
                label: "Requests",
                value: allRequestTotal,
                icon: Inbox,
                href: "/buyer#requests",
              },
              {
                label: "To decide",
                value: awaitingDecision.length,
                icon: Clock,
                href: "/buyer?requests=deciding#requests",
                tone: awaitingDecision.length ? "warning" : "neutral",
              },
              {
                label: "Active orders",
                value: activeOrders.length,
                icon: Package,
                href: "/buyer?requests=ordered#requests",
                tone: activeOrders.length ? "success" : "neutral",
              },
            ]}
            // Three tiles across a 288px sidebar squeezed the labels to a single
            // letter; full width in the sidebar, three across only when there's room.
            className="grid-cols-1 sm:grid-cols-3 lg:grid-cols-1"
          />
          <div className="rounded-card border border-border bg-card p-4 shadow-sm">
            <p className="font-medium">Need something else?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start a focused request flow so shops can quote the right thing.
            </p>
            <Link
              href="/buyer/new"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "mt-4 w-full",
              })}
            >
              <Plus className="size-4" aria-hidden="true" />
              New request
            </Link>
          </div>
        </aside>

        <section id="requests" className="min-w-0 flex-1 scroll-mt-24">
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
            <div className="space-y-5">
              {requests.map((request) => {
                const budget = formatMoney(request.budget);
                return (
                  <article
                    key={request.id}
                    className="overflow-hidden rounded-card border border-border bg-card shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 p-5">
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
                            Posted {request.createdAt.toLocaleDateString()}
                          </time>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <StatusBadge value={request.type} />
                        <StatusBadge value={request.status} />
                      </div>
                    </div>

                    {request.offers.length === 0 ? (
                      <p className="border-t border-border bg-muted px-5 py-4 text-sm text-muted-foreground">
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
      </div>
    </Container>
  );
}

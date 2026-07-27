import type { Metadata } from "next";
import type * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Send, Trophy, Wallet, SearchX } from "lucide-react";
import type { OfferStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import {
  PARAM,
  paginate,
  readOption,
  readPage,
  type SearchParams,
} from "@/lib/list-params";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { FilterTabs } from "@/components/FilterTabs";
import { ListPagination } from "@/components/ListPagination";
import { RecordCell, RecordList, RecordRow } from "@/components/ResponsiveRecordList";
import { Money } from "@/components/Typography";
import { Container } from "@/components/Container";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Your offers",
  description: "Track the prices you have sent and their review outcomes.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const OFFER_VIEWS = ["all", "review", "approved", "won", "declined"] as const;
type OfferView = (typeof OFFER_VIEWS)[number];

const ALL_OFFER_STATUSES: OfferStatus[] = [
  "PENDING_REVIEW",
  "APPROVED",
  "ACCEPTED",
  "REJECTED",
];

const OFFER_VIEW_STATUS: Record<OfferView, OfferStatus[] | undefined> = {
  all: undefined,
  review: ["PENDING_REVIEW"],
  approved: ["APPROVED"],
  won: ["ACCEPTED"],
  declined: ["REJECTED"],
};

function OfferMetric({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: typeof Send;
}) {
  return (
    <div className="min-w-0 sm:flex sm:items-center sm:gap-3">
      <span className="hidden size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground sm:grid">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 break-words text-base leading-tight font-semibold tabular-nums sm:text-lg">
          {value}
        </dd>
        {hint && (
          <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

export default async function SellerOffersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SELLER") redirect(user.role === "ADMIN" ? "/admin" : "/buyer");

  const params = await searchParams;
  const offerView = readOption(params, PARAM.offers, OFFER_VIEWS, "all");
  const offerWhere: Prisma.OfferWhereInput = {
    sellerId: user.id,
    ...(OFFER_VIEW_STATUS[offerView]
      ? { status: { in: OFFER_VIEW_STATUS[offerView] } }
      : {}),
  };

  const [offerTotal, offerCounts, acceptedOffers] = await Promise.all([
    prisma.offer.count({ where: offerWhere }),
    prisma.offer.groupBy({
      by: ["status"],
      where: { sellerId: user.id },
      _count: { _all: true },
    }),
    prisma.offer.findMany({
      where: { sellerId: user.id, status: "ACCEPTED" },
      select: { price: true, adminPrice: true },
    }),
  ]);

  const offerPage = paginate(offerTotal, readPage(params, "opage"));
  const offers = await prisma.offer.findMany({
    where: offerWhere,
    include: { request: true, order: true },
    orderBy: { createdAt: "desc" },
    skip: offerPage.skip,
    take: offerPage.take,
  });

  const countOf = (...statuses: OfferStatus[]) =>
    offerCounts
      .filter((row) => statuses.includes(row.status))
      .reduce((sum, row) => sum + row._count._all, 0);

  const won = countOf("ACCEPTED");
  const inReview = countOf("PENDING_REVIEW");
  const earned = acceptedOffers.reduce(
    (sum, o) => sum + Number(o.adminPrice ?? o.price),
    0
  );
  const decided = countOf("APPROVED", "ACCEPTED", "REJECTED");
  const winRate = decided > 0 ? Math.round((won / decided) * 100) : null;

  return (
    <Container className="flex flex-col gap-6 pt-5 sm:pt-6">
      <header className="border-b border-border pb-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted-foreground">
              Seller offers
            </p>
            <h1 className="mt-1 font-display text-title font-semibold">
              Your offers
            </h1>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              Track prices you have already sent after they leave the quote queue.
            </p>
          </div>
          <Link
            href="/seller"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "w-full justify-center sm:w-auto",
            })}
          >
            <ArrowLeft data-icon="inline-start" aria-hidden="true" />
            Back to queue
          </Link>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-6 border-b border-border pb-5 sm:grid-cols-3">
        <OfferMetric
          label="In review"
          value={inReview}
          icon={Send}
          hint="With marketplace"
        />
        <OfferMetric
          label="Won"
          value={won}
          icon={Trophy}
          hint={winRate !== null ? `${winRate}% reviewed win rate` : "Accepted offers"}
        />
        <OfferMetric
          label="Revenue"
          value={<Money>{formatMoney(earned) ?? "-"}</Money>}
          icon={Wallet}
          hint={won > 0 ? "Buyer-paid reviewed price" : "No accepted offers yet"}
        />
      </dl>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-heading font-semibold">Offer history</h2>
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              Each row is one price you sent, with the marketplace decision and
              buyer order state.
            </p>
          </div>
          <FilterTabs
            label="Filter your offers"
            basePath="/seller/offers"
            params={params}
            paramKey={PARAM.offers}
            pageKey="opage"
            value={offerView}
            options={[
              { value: "all", label: "All", count: countOf(...ALL_OFFER_STATUSES) },
              { value: "review", label: "In review", count: inReview },
              { value: "approved", label: "Approved", count: countOf("APPROVED") },
              { value: "won", label: "Won", count: won },
              { value: "declined", label: "Declined", count: countOf("REJECTED") },
            ]}
          />
        </div>

        {offers.length === 0 ? (
          offerView === "all" ? (
            <EmptyState
              icon={Send}
              title="You haven't made an offer yet"
              description="Quote an open request first. Sent prices appear here after they go to review."
              action={
                <Link
                  href="/seller"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Go to queue
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={SearchX}
              title="Nothing here yet"
              description="No offer of yours is in this state right now."
              action={
                <Link
                  href="/seller/offers"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Show all offers
                </Link>
              }
            />
          )
        ) : (
          <RecordList
            template="minmax(18rem,1fr) auto auto auto"
            columns={[
              { label: "Request" },
              { label: "Price", align: "right" },
              { label: "Status", align: "right" },
              { label: "Order", align: "right" },
            ]}
          >
            {offers.map((offer) => (
              <RecordRow key={offer.id}>
                <RecordCell>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{offer.request.title}</p>
                    {offer.condition && <StatusBadge value={offer.condition} />}
                  </div>
                  {offer.adminNote && (
                    <p className="mt-1 max-w-prose text-xs text-muted-foreground">
                      {offer.adminNote}
                    </p>
                  )}
                </RecordCell>
                <RecordCell label="Price" align="right">
                  <Money className="font-semibold">
                    {formatMoney(offer.price)}
                  </Money>
                  {offer.adminPrice && (
                    <p className="text-xs text-muted-foreground">
                      buyer sees <Money>{formatMoney(offer.adminPrice)}</Money>
                    </p>
                  )}
                </RecordCell>
                <RecordCell label="Status" align="right">
                  <StatusBadge value={offer.status} />
                </RecordCell>
                <RecordCell label="Order" align="right">
                  {offer.order ? (
                    <StatusBadge value={offer.order.status} />
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </RecordCell>
              </RecordRow>
            ))}
          </RecordList>
        )}

        <ListPagination
          page={offerPage}
          basePath="/seller/offers"
          params={params}
          pageKey="opage"
          label="offers"
        />
      </section>
    </Container>
  );
}

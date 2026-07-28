import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, SearchX, ArrowRight } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import { ageInDays, formatPostedAge } from "@/lib/time";
import {
  PAGE_SIZE,
  PARAM,
  paginate,
  readPage,
  readParam,
  type SearchParams,
} from "@/lib/list-params";
import ReviewOfferForm from "@/components/ReviewOfferForm";
import StatusBadge from "@/components/StatusBadge";
import { SearchField } from "@/components/SearchField";
import { EmptyState } from "@/components/EmptyState";
import { ListPagination } from "@/components/ListPagination";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/Container";
import { PageHeader, Money } from "@/components/Typography";

export const metadata: Metadata = {
  title: "Review queue",
  description: "Approve, adjust or decline each offer before the buyer sees it.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = readParam(params, PARAM.search);

  const where: Prisma.OfferWhereInput = {
    status: "PENDING_REVIEW",
    ...(query
      ? {
          OR: [
            { request: { title: { contains: query, mode: "insensitive" } } },
            { request: { sku: { contains: query, mode: "insensitive" } } },
            { seller: { name: { contains: query, mode: "insensitive" } } },
            {
              request: {
                buyer: { name: { contains: query, mode: "insensitive" } },
              },
            },
          ],
        }
      : {}),
  };

  const [total, pendingTotal] = await Promise.all([
    prisma.offer.count({ where }),
    prisma.offer.count({ where: { status: "PENDING_REVIEW" } }),
  ]);
  const page = paginate(total, readPage(params, "page"));

  const offers = await prisma.offer.findMany({
    where,
    include: { seller: true, request: { include: { buyer: true } } },
    orderBy: { createdAt: "asc" },
    skip: page.skip,
    take: page.take,
  });

  return (
    <Container className="py-4 sm:py-5 space-y-4">
      <PageHeader
        eyebrow="Admin"
        title="Review queue"
        description="Every price passes through here before a buyer can see it. Oldest first."
        action={
          pendingTotal > 0 ? (
            <Badge variant="secondary">
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              {pendingTotal} waiting
            </Badge>
          ) : null
        }
      />

      {(pendingTotal > PAGE_SIZE || query) && (
        <SearchField
          paramKey={PARAM.search}
          pageKey="page"
          label="Search the review queue"
          placeholder="Search by item, shop or buyer…"
          className="sm:max-w-sm"
        />
      )}

      {offers.length === 0 ? (
        query ? (
          <EmptyState
            icon={SearchX}
            title="Nothing in the queue matches that"
            description={`No offer awaiting review mentions “${query}”. It may already have been decided — check Decisions.`}
            action={
              <Link
                href="/admin/queue"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Show the whole queue
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title="All caught up"
            description="Every offer submitted so far has been reviewed. New ones appear here as shops send them."
          />
        )
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
          {offers.map((offer) => {
            const asked = formatMoney(offer.price);
            const budget = formatMoney(offer.request.budget);
            const waitingDays = ageInDays(offer.createdAt);
            return (
              <div key={offer.id}>
                {/* Header & Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-3.5 sm:px-4 sm:py-3 bg-secondary/20">
                  <div className="min-w-0 flex-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="font-semibold text-sm text-foreground truncate">
                      {offer.request.title}
                    </h2>
                    {offer.request.sku && (
                      <Badge variant="outline" className="text-2xs py-0 h-5">
                        {offer.request.sku}
                      </Badge>
                    )}
                    <StatusBadge value={offer.request.type} />

                    {/* How long the shop has been waiting on a decision —
                        the queue is oldest-first, and age is what makes
                        "oldest" feel urgent rather than arbitrary. */}
                    <span
                      className={
                        waitingDays >= 2
                          ? "inline-flex items-center gap-1 rounded-pill bg-warning px-2 py-0.5 text-2xs font-semibold text-warning-foreground"
                          : "inline-flex items-center gap-1 rounded-pill bg-secondary px-2 py-0.5 text-2xs font-medium text-secondary-foreground"
                      }
                    >
                      <Clock className="size-3" aria-hidden="true" />
                      Waiting {formatPostedAge(offer.createdAt)}
                    </span>

                    {/* Trade Identity */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {offer.request.buyer.name}
                      </span>
                      <ArrowRight className="size-3 text-muted-foreground" aria-hidden="true" />
                      <span className="font-medium text-foreground">
                        {offer.seller.name}
                      </span>
                      {budget && (
                        <span className="ml-1 text-2xs text-muted-foreground">
                          (Budget: <Money>{budget}</Money>)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Asking price & Condition */}
                  <div className="flex items-center gap-2 shrink-0">
                    {offer.condition && (
                      <StatusBadge value={offer.condition} />
                    )}
                    <div className="text-right">
                      <span className="text-2xs text-muted-foreground block">
                        Shop Asks
                      </span>
                      <Money className="text-base font-bold text-foreground">
                        {asked}
                      </Money>
                    </div>
                  </div>
                </div>

                {/* Description & Seller Message (Compact line) */}
                {(offer.request.description || offer.message) && (
                  <div className="px-4 py-2 border-t border-border/50 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                    {offer.request.description && (
                      <p className="line-clamp-1 flex-1">
                        <span className="font-medium text-foreground">Request: </span>
                        {offer.request.description}
                      </p>
                    )}
                    {offer.message && (
                      <p className="line-clamp-1 flex-1">
                        <span className="font-medium text-foreground">Shop Note: </span>
                        {offer.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Compact Inline Form */}
                <div className="border-t border-border p-3 sm:p-4">
                  <ReviewOfferForm offerId={offer.id} askingPrice={asked ?? ""} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ListPagination
        page={page}
        basePath="/admin/queue"
        params={params}
        pageKey="page"
        label="offers awaiting review"
      />
    </Container>
  );
}

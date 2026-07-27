import type { Metadata } from "next";
import { History } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import {
  PARAM,
  paginate,
  readOption,
  readPage,
  type SearchParams,
} from "@/lib/list-params";
import {
  DECISION_VIEWS,
  DECISION_VIEW_STATUS,
  REVIEWED_STATUSES,
} from "@/lib/admin";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { RecordList, RecordRow, RecordCell } from "@/components/ResponsiveRecordList";
import { FilterTabs } from "@/components/FilterTabs";
import { ListPagination } from "@/components/ListPagination";
import { Container } from "@/components/Container";
import { PageHeader, Money } from "@/components/Typography";

export const metadata: Metadata = {
  title: "Decisions",
  description: "Every offer reviewed, the band it was judged against, and the price the buyer saw.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDecisionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const view = readOption(params, PARAM.decisions, DECISION_VIEWS, "all");

  const counts = await prisma.offer.groupBy({
    by: ["status"],
    where: { status: { in: REVIEWED_STATUSES } },
    _count: { _all: true },
  });
  const countOf = (...statuses: string[]) =>
    counts
      .filter((row) => statuses.includes(row.status))
      .reduce((sum, row) => sum + row._count._all, 0);

  const total = countOf(...DECISION_VIEW_STATUS[view]);
  const page = paginate(total, readPage(params, "page"));

  const decisions = await prisma.offer.findMany({
    where: { status: { in: DECISION_VIEW_STATUS[view] } },
    include: { seller: true, request: { include: { buyer: true } } },
    orderBy: { createdAt: "desc" },
    skip: page.skip,
    take: page.take,
  });

  return (
    <Container className="py-4 sm:py-5 space-y-4">
      <PageHeader
        eyebrow="Admin"
        title="Decisions"
        // Was "the last 25" — the whole history is now reachable, which is what
        // makes this an audit trail rather than a recent-items list.
        description="Every offer you have reviewed, the band you judged it against, and the price the buyer was shown."
      />

      <FilterTabs
        label="Filter decisions"
        basePath="/admin/decisions"
        params={params}
        paramKey={PARAM.decisions}
        pageKey="page"
        value={view}
        options={[
          { value: "all", label: "All", count: countOf(...REVIEWED_STATUSES) },
          { value: "approved", label: "Approved", count: countOf("APPROVED") },
          { value: "declined", label: "Declined", count: countOf("REJECTED") },
          { value: "accepted", label: "Bought", count: countOf("ACCEPTED") },
        ]}
      />

      {decisions.length === 0 ? (
        <EmptyState
          icon={History}
          title={
            view === "all" ? "Nothing reviewed yet" : "No decisions of this kind"
          }
          description={
            view === "all"
              ? "Offers you approve or decline are listed here, with the band you judged them against."
              : "Switch to another view to see the decisions you have made."
          }
        />
      ) : (
        <RecordList
          template="1fr auto auto"
          columns={[
            { label: "Offer" },
            { label: "Price", align: "right" },
            { label: "Outcome", align: "right" },
          ]}
        >
          {decisions.map((offer) => {
            const wasAdjusted = offer.adminPrice !== null;
            return (
              <RecordRow key={offer.id}>
                <RecordCell>
                  <p className="font-medium">{offer.request.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {offer.seller.name} → {offer.request.buyer.name}
                  </p>
                  {offer.adminNote && (
                    <p className="mt-1 max-w-prose text-xs text-muted-foreground">
                      {offer.adminNote}
                    </p>
                  )}
                </RecordCell>
                <RecordCell label="Price" align="right">
                  <Money className="font-semibold">
                    {formatMoney(offer.adminPrice ?? offer.price)}
                  </Money>
                  {wasAdjusted && (
                    <p className="text-xs text-muted-foreground">
                      <Money className="line-through">
                        {formatMoney(offer.price)}
                      </Money>{" "}
                      asked
                    </p>
                  )}
                  {(offer.bandLow || offer.bandHigh) && (
                    <p className="text-xs text-muted-foreground">
                      band <Money>{formatMoney(offer.bandLow) ?? "—"}</Money>–
                      <Money>{formatMoney(offer.bandHigh) ?? "—"}</Money>
                    </p>
                  )}
                </RecordCell>
                <RecordCell label="Outcome" align="right">
                  <StatusBadge value={offer.status} />
                </RecordCell>
              </RecordRow>
            );
          })}
        </RecordList>
      )}

      <ListPagination
        page={page}
        basePath="/admin/decisions"
        params={params}
        pageKey="page"
        label="decisions"
      />
    </Container>
  );
}

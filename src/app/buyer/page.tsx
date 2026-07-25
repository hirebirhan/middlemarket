import { redirect } from "next/navigation";
import { Inbox, Clock, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";
import NewRequestForm from "@/components/NewRequestForm";
import AcceptOfferButton from "@/components/AcceptOfferButton";
import StatusBadge from "@/components/StatusBadge";
import { StatGrid } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { RecordList, RecordRow, RecordCell } from "@/components/ui/record-list";

export const dynamic = "force-dynamic";

export default async function BuyerPage({
  searchParams,
}: {
  searchParams: Promise<{ need?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "BUYER") redirect(user.role === "ADMIN" ? "/admin" : "/seller");

  // Carried from the landing-page request box through signup.
  const { need } = await searchParams;

  const requests = await prisma.request.findMany({
    where: { buyerId: user.id },
    include: {
      offers: {
        where: { status: { in: ["APPROVED", "ACCEPTED"] } },
        include: { seller: true, order: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const allOffers = requests.flatMap((r) => r.offers);
  const awaitingDecision = allOffers.filter((o) => o.status === "APPROVED");
  const activeOrders = allOffers.filter(
    (o) => o.order && o.order.status !== "COMPLETED" && o.order.status !== "CANCELLED"
  );

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <aside className="space-y-6 lg:w-65 lg:shrink-0">
        <div>
          <h1 className="text-title font-semibold">{user.name.split(" ")[0]}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Buyer dashboard</p>
        </div>
        <StatGrid
          stats={[
            { label: "Requests", value: requests.length, icon: Inbox, href: "#requests" },
            {
              label: "To decide",
              value: awaitingDecision.length,
              icon: Clock,
              href: "#requests",
              tone: awaitingDecision.length ? "warning" : "neutral",
            },
            {
              label: "Active orders",
              value: activeOrders.length,
              icon: Package,
              href: "#requests",
              tone: activeOrders.length ? "success" : "neutral",
            },
          ]}
        />
        <NewRequestForm initialTitle={need} />
      </aside>

      <section id="requests" className="min-w-0 scroll-mt-20">
        <SectionHeader
          title="My requests"
          description="You only see offers our team has already reviewed."
        />

        {requests.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No requests yet"
            description="Post what you need and sellers will start competing for it."
          />
        ) : (
          <div className="space-y-6">
            {requests.map((request) => {
              const budget = formatMoney(request.budget);
              return (
                <article
                  key={request.id}
                  className="overflow-hidden rounded-card border border-border"
                >
                  <div className="flex items-start justify-between gap-4 bg-card p-5">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{request.title}</h3>
                      {request.sku && (
                        <p className="mt-0.5 text-xs font-medium text-foreground">
                          {request.sku}
                        </p>
                      )}
                      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                        {request.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {budget && <span>Budget {budget}</span>}
                        <time dateTime={request.createdAt.toISOString()}>
                          {request.createdAt.toLocaleDateString()}
                        </time>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <StatusBadge value={request.type} />
                      <StatusBadge value={request.status} />
                    </div>
                  </div>

                  {request.offers.length === 0 ? (
                    <p className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
                      {request.status === "OPEN"
                        ? "No reviewed offers yet. We'll show them here once our team has checked the price."
                        : "This request is closed."}
                    </p>
                  ) : (
                    <RecordList
                      className="rounded-none border-x-0 border-b-0"
                      template="1fr auto minmax(9rem, auto)"
                      columns={[
                        { label: "Seller" },
                        { label: "Price", align: "right" },
                        { label: "Action", align: "right" },
                      ]}
                    >
                      {request.offers.map((offer) => {
                        const finalPrice = formatMoney(offer.adminPrice ?? offer.price);
                        const wasAdjusted = offer.adminPrice !== null;
                        return (
                          <RecordRow key={offer.id}>
                            <RecordCell>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium">{offer.seller.name}</p>
                                {offer.condition && (
                                  <StatusBadge value={offer.condition} />
                                )}
                              </div>
                              <p className="mt-0.5 max-w-prose text-xs text-muted-foreground">
                                {offer.message}
                              </p>
                              {offer.adminNote && (
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                  <span className="font-medium text-foreground">
                                    Marketplace note:
                                  </span>{" "}
                                  {offer.adminNote}
                                </p>
                              )}
                              {offer.order && (
                                <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                  Order
                                  <StatusBadge value={offer.order.status} />
                                </span>
                              )}
                            </RecordCell>

                            <RecordCell label="Price" align="right">
                              <p className="font-semibold tabular-nums">{finalPrice}</p>
                              {wasAdjusted && (
                                <p className="text-xs tabular-nums text-muted-foreground">
                                  <span className="line-through">
                                    {formatMoney(offer.price)}
                                  </span>{" "}
                                  asked
                                </p>
                              )}
                            </RecordCell>

                            <RecordCell label="Action" align="right">
                              {offer.status === "APPROVED" ? (
                                <AcceptOfferButton
                                  offerId={offer.id}
                                  price={finalPrice ?? ""}
                                />
                              ) : (
                                <StatusBadge value={offer.status} />
                              )}
                            </RecordCell>
                          </RecordRow>
                        );
                      })}
                    </RecordList>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

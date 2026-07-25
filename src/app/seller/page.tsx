import { redirect } from "next/navigation";
import { Inbox, Send, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";
import OfferForm from "@/components/OfferForm";
import StatusBadge from "@/components/StatusBadge";
import { StatGrid } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { RecordList, RecordRow, RecordCell } from "@/components/ui/record-list";
import { Alert } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

const LIVE_STATUSES = ["PENDING_REVIEW", "APPROVED", "ACCEPTED"];

export default async function SellerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Previously sent buyers back to /seller, which redirected them here again —
  // an infinite loop.
  if (user.role !== "SELLER") redirect(user.role === "ADMIN" ? "/admin" : "/buyer");

  const [openRequests, myOffers] = await Promise.all([
    prisma.request.findMany({
      where: { status: "OPEN" },
      include: {
        buyer: true,
        offers: {
          where: { sellerId: user.id },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.offer.findMany({
      where: { sellerId: user.id },
      include: { request: true, order: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const won = myOffers.filter((o) => o.status === "ACCEPTED").length;
  const inReview = myOffers.filter((o) => o.status === "PENDING_REVIEW").length;

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6">
        <div>
          <h1 className="text-title font-semibold">{user.name.split(" ")[0]}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Seller dashboard</p>
        </div>
        <StatGrid
          stats={[
            {
              label: "Open requests",
              value: openRequests.length,
              icon: Inbox,
              href: "#open-requests",
            },
            {
              label: "In review",
              value: inReview,
              icon: Send,
              href: "#my-offers",
              tone: inReview ? "warning" : "neutral",
            },
            {
              label: "Won",
              value: won,
              icon: Trophy,
              href: "#my-offers",
              tone: won ? "success" : "neutral",
            },
          ]}
        />
      </aside>

      <div className="min-w-0 space-y-10">
        <section id="open-requests" className="scroll-mt-20">
          <SectionHeader
            title="Open requests"
            description="Every offer is price-reviewed before the buyer sees it."
          />

          {openRequests.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No open requests right now"
              description="New buyer requests appear here as soon as they are posted."
            />
          ) : (
            <div className="space-y-3">
              {openRequests.map((request) => {
                const latest = request.offers[0];
                const live = request.offers.find((o) =>
                  LIVE_STATUSES.includes(o.status)
                );
                const budget = formatMoney(request.budget);
                // A rejection used to lock the seller out of the request for
                // good; now they can act on the feedback and bid again.
                const wasRejected = !live && latest?.status === "REJECTED";

                return (
                  <article
                    key={request.id}
                    className="rounded-card border border-border p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold">{request.title}</h3>
                        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                          {request.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>by {request.buyer.name}</span>
                          {budget && <span>Budget {budget}</span>}
                          <time dateTime={request.createdAt.toISOString()}>
                            {request.createdAt.toLocaleDateString()}
                          </time>
                        </div>
                      </div>
                      <StatusBadge value={request.type} />
                    </div>

                    {live ? (
                      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                        <Send
                          className="h-3.5 w-3.5 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <span>
                          You offered{" "}
                          <span className="font-semibold tabular-nums">
                            {formatMoney(live.price)}
                          </span>
                        </span>
                        <StatusBadge value={live.status} />
                      </div>
                    ) : (
                      <>
                        {wasRejected && (
                          <Alert variant="danger" className="mt-4">
                            <p className="font-medium">
                              Your previous offer of {formatMoney(latest.price)} was
                              rejected.
                            </p>
                            {latest.adminNote && (
                              <p className="mt-0.5">{latest.adminNote}</p>
                            )}
                          </Alert>
                        )}
                        <OfferForm
                          requestId={request.id}
                          budget={budget}
                          label={wasRejected ? "Offer again" : "Make an offer"}
                        />
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section id="my-offers" className="scroll-mt-20">
          <SectionHeader
            title="My offers"
            description="Where each of your offers stands."
          />

          {myOffers.length === 0 ? (
            <EmptyState
              icon={Send}
              title="No offers yet"
              description="Pick an open request above and submit your best price."
            />
          ) : (
            <RecordList
              template="1fr auto auto auto"
              columns={[
                { label: "Request" },
                { label: "Price", align: "right" },
                { label: "Status", align: "right" },
                { label: "Order", align: "right" },
              ]}
            >
              {myOffers.map((offer) => (
                <RecordRow key={offer.id}>
                  <RecordCell>
                    <p className="font-medium">{offer.request.title}</p>
                    {offer.adminNote && (
                      <p className="mt-0.5 max-w-prose text-xs text-muted-foreground">
                        {offer.adminNote}
                      </p>
                    )}
                  </RecordCell>
                  <RecordCell label="Price" align="right">
                    <p className="font-semibold tabular-nums">
                      {formatMoney(offer.price)}
                    </p>
                    {offer.adminPrice && (
                      <p className="text-xs tabular-nums text-muted-foreground">
                        buyer sees {formatMoney(offer.adminPrice)}
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
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </RecordCell>
                </RecordRow>
              ))}
            </RecordList>
          )}
        </section>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import {
  Clock,
  PackageOpen,
  ShoppingCart,
  Users,
  CheckCircle2,
  History,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";
import ReviewOfferForm from "@/components/ReviewOfferForm";
import OrderStatusSelect from "@/components/OrderStatusSelect";
import StatusBadge from "@/components/StatusBadge";
import { StatGrid } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { RecordList, RecordRow, RecordCell } from "@/components/ui/record-list";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect(user.role === "SELLER" ? "/seller" : "/buyer");

  const [pendingOffers, decisions, orders, openRequests, totalUsers] =
    await Promise.all([
      prisma.offer.findMany({
        where: { status: "PENDING_REVIEW" },
        include: { seller: true, request: { include: { buyer: true } } },
        orderBy: { createdAt: "asc" },
      }),
      // Reviewed offers were previously unreachable once acted on — there was
      // no way to answer "what did I approve, and at what price?".
      prisma.offer.findMany({
        where: { status: { in: ["APPROVED", "REJECTED", "ACCEPTED"] } },
        include: { seller: true, request: { include: { buyer: true } } },
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
      prisma.order.findMany({
        include: {
          offer: { include: { seller: true, request: { include: { buyer: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.request.count({ where: { status: "OPEN" } }),
      prisma.user.count(),
    ]);

  const activeOrders = orders.filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED"
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6">
        <div>
          <h1 className="text-title font-semibold">Control room</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Admin dashboard</p>
        </div>
        <StatGrid
          stats={[
            {
              label: "Awaiting review",
              value: pendingOffers.length,
              icon: Clock,
              href: "#review-queue",
              tone: pendingOffers.length ? "warning" : "neutral",
            },
            {
              label: "Active orders",
              value: activeOrders.length,
              icon: ShoppingCart,
              href: "#orders",
              tone: activeOrders.length ? "success" : "neutral",
            },
            { label: "Open requests", value: openRequests, icon: PackageOpen },
            { label: "Users", value: totalUsers, icon: Users },
          ]}
        />
      </aside>

      <div className="min-w-0 space-y-10">
        {/* ── Review queue ── */}
        <section id="review-queue" className="scroll-mt-20">
          <SectionHeader
            title="Review queue"
            description="Approve, adjust, or reject each offer before the buyer sees it."
            action={
              pendingOffers.length > 0 ? (
                <Badge variant="warning">{pendingOffers.length} pending</Badge>
              ) : null
            }
          />

          {pendingOffers.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="All caught up"
              description="No offers are waiting for review."
            />
          ) : (
            <div className="space-y-4">
              {pendingOffers.map((offer) => {
                const asked = formatMoney(offer.price);
                const budget = formatMoney(offer.request.budget);
                return (
                  <article
                    key={offer.id}
                    className="overflow-hidden rounded-card border border-border"
                  >
                    <div className="flex items-start justify-between gap-4 bg-card p-5">
                      <div className="min-w-0">
                        <h3 className="font-semibold">{offer.request.title}</h3>
                        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                          {offer.request.description}
                        </p>
                        <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                          <div className="flex gap-1.5">
                            <dt>Buyer</dt>
                            <dd className="font-medium text-foreground">
                              {offer.request.buyer.name}
                            </dd>
                          </div>
                          <div className="flex gap-1.5">
                            <dt>Seller</dt>
                            <dd className="font-medium text-foreground">
                              {offer.seller.name}
                            </dd>
                          </div>
                          {budget && (
                            <div className="flex gap-1.5">
                              <dt>Budget</dt>
                              <dd className="font-medium text-foreground tabular-nums">
                                {budget}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                      <StatusBadge value={offer.request.type} />
                    </div>

                    <div className="flex flex-wrap items-baseline justify-between gap-4 border-t border-border bg-muted/40 px-5 py-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Seller&apos;s ask
                        </p>
                        <p className="text-title font-semibold tabular-nums">
                          {asked}
                        </p>
                      </div>
                      <p className="max-w-prose text-sm text-muted-foreground">
                        {offer.message}
                      </p>
                    </div>

                    {/* The review form owns its own spacing — it used to add a
                        second border on top of this one. */}
                    <div className="border-t border-border p-5">
                      <ReviewOfferForm
                        offerId={offer.id}
                        askingPrice={offer.price.toString()}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Orders ── */}
        <section id="orders" className="scroll-mt-20">
          <SectionHeader
            title="Orders"
            description="Move each order along as it progresses. Completed and cancelled are final."
          />

          {orders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders yet"
              description="Orders appear here once a buyer accepts an approved offer."
            />
          ) : (
            <RecordList
              template="1fr auto auto minmax(10rem, auto)"
              columns={[
                { label: "Order" },
                { label: "Price", align: "right" },
                { label: "Status", align: "right" },
                { label: "Advance", align: "right" },
              ]}
            >
              {orders.map((order) => (
                <RecordRow key={order.id}>
                  <RecordCell>
                    <p className="font-medium">{order.offer.request.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <span className="text-foreground">
                        {order.offer.request.buyer.name}
                      </span>
                      {" ← "}
                      <span className="text-foreground">
                        {order.offer.seller.name}
                      </span>
                      {" · "}
                      <time dateTime={order.createdAt.toISOString()}>
                        {order.createdAt.toLocaleDateString()}
                      </time>
                    </p>
                  </RecordCell>
                  <RecordCell label="Price" align="right">
                    <span className="font-semibold tabular-nums">
                      {formatMoney(order.offer.adminPrice ?? order.offer.price)}
                    </span>
                  </RecordCell>
                  <RecordCell label="Status" align="right">
                    <StatusBadge value={order.status} />
                  </RecordCell>
                  <RecordCell label="Advance" align="right">
                    <OrderStatusSelect orderId={order.id} current={order.status} />
                  </RecordCell>
                </RecordRow>
              ))}
            </RecordList>
          )}
        </section>

        {/* ── Decision history ── */}
        <section id="decisions" className="scroll-mt-20">
          <SectionHeader
            title="Recent decisions"
            description="The last 25 offers you reviewed, and what the buyer was shown."
          />

          {decisions.length === 0 ? (
            <EmptyState
              icon={History}
              title="Nothing reviewed yet"
              description="Offers you approve or reject will be listed here."
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
                const adjusted = offer.adminPrice !== null;
                return (
                  <RecordRow key={offer.id}>
                    <RecordCell>
                      <p className="font-medium">{offer.request.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {offer.seller.name} → {offer.request.buyer.name}
                      </p>
                      {offer.adminNote && (
                        <p className="mt-1 max-w-prose text-xs text-muted-foreground">
                          {offer.adminNote}
                        </p>
                      )}
                    </RecordCell>
                    <RecordCell label="Price" align="right">
                      <span className="font-semibold tabular-nums">
                        {formatMoney(offer.adminPrice ?? offer.price)}
                      </span>
                      {adjusted && (
                        <p className="text-xs tabular-nums text-muted-foreground">
                          <span className="line-through">
                            {formatMoney(offer.price)}
                          </span>{" "}
                          asked
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
        </section>
      </div>
    </div>
  );
}

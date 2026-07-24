import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ReviewOfferForm from "@/components/ReviewOfferForm";
import OrderStatusSelect from "@/components/OrderStatusSelect";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect(user.role === "SELLER" ? "/seller" : "/buyer");

  const [pendingOffers, orders, openRequests, totalUsers] = await Promise.all([
    prisma.offer.findMany({
      where: { status: "PENDING_REVIEW" },
      include: { seller: true, request: { include: { buyer: true } } },
      orderBy: { createdAt: "asc" },
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Marketplace control room 🏛</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review every offer, keep prices rational, and track orders to completion.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          ["Open requests", openRequests, "📋"],
          ["Awaiting review", pendingOffers.length, "⏳"],
          ["Orders", orders.length, "📦"],
          ["Users", totalUsers, "👥"],
        ].map(([label, count, icon]) => (
          <div key={String(label)} className="bg-white border rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
              {icon} {label}
            </p>
            <p className="text-2xl font-bold mt-1">{count}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Offers to review</h2>
        {pendingOffers.length === 0 && (
          <div className="bg-white border border-dashed rounded-xl p-10 text-center text-slate-400">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-medium text-slate-500">All caught up</p>
            <p className="text-sm">No offers waiting for review.</p>
          </div>
        )}
        <div className="space-y-4">
          {pendingOffers.map((o) => (
            <div key={o.id} className="bg-white border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{o.request.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    🧑 Buyer: {o.request.buyer.name}
                    {o.request.budget && ` (budget $${o.request.budget.toString()})`} · 🏪 Seller:{" "}
                    {o.seller.name}
                  </p>
                </div>
                <StatusBadge value={o.request.type} />
              </div>
              <p className="text-sm mt-3 bg-slate-50 rounded-lg p-3">
                Asking <span className="font-bold text-indigo-700">${o.price.toString()}</span> —{" "}
                {o.message}
              </p>
              <ReviewOfferForm offerId={o.id} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Orders</h2>
        {orders.length === 0 && (
          <div className="bg-white border border-dashed rounded-xl p-10 text-center text-slate-400">
            <p className="text-3xl mb-2">📦</p>
            <p className="font-medium text-slate-500">No orders yet</p>
            <p className="text-sm">Orders appear here once buyers accept approved offers.</p>
          </div>
        )}
        <div className="space-y-3">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white border rounded-xl p-4 text-sm flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold">{ord.offer.request.title}</p>
                <p className="text-slate-600 mt-0.5">
                  {ord.offer.request.buyer.name} ← {ord.offer.seller.name} ·{" "}
                  <span className="font-semibold text-indigo-700">
                    ${(ord.offer.adminPrice ?? ord.offer.price).toString()}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge value={ord.status} />
                <OrderStatusSelect orderId={ord.id} current={ord.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

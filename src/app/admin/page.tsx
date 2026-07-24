import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ReviewOfferForm from "@/components/ReviewOfferForm";
import OrderStatusSelect from "@/components/OrderStatusSelect";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect(user.role === "SELLER" ? "/seller" : "/buyer");

  const [pendingOffers, orders, openRequests] = await Promise.all([
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
  ]);

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          ["Open requests", openRequests],
          ["Offers awaiting review", pendingOffers.length],
          ["Orders", orders.length],
        ].map(([label, count]) => (
          <div key={label} className="bg-white border rounded-lg p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-bold">{count}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Offers to review</h2>
        {pendingOffers.length === 0 && (
          <p className="text-slate-500 text-sm">No offers waiting for review.</p>
        )}
        <div className="space-y-4">
          {pendingOffers.map((o) => (
            <div key={o.id} className="bg-white border rounded-lg p-5">
              <p className="font-semibold">{o.request.title}</p>
              <p className="text-sm text-slate-500">
                Buyer: {o.request.buyer.name}
                {o.request.budget && ` (budget $${o.request.budget.toString()})`} · Seller:{" "}
                {o.seller.name}
              </p>
              <p className="text-sm mt-2">
                Asking <span className="font-semibold">${o.price.toString()}</span> — {o.message}
              </p>
              <ReviewOfferForm offerId={o.id} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Orders</h2>
        {orders.length === 0 && <p className="text-slate-500 text-sm">No orders yet.</p>}
        <div className="space-y-2">
          {orders.map((ord) => (
            <div key={ord.id} className="bg-white border rounded-lg p-4 text-sm flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{ord.offer.request.title}</p>
                <p className="text-slate-600">
                  {ord.offer.request.buyer.name} ← {ord.offer.seller.name} · $
                  {(ord.offer.adminPrice ?? ord.offer.price).toString()}
                </p>
              </div>
              <OrderStatusSelect orderId={ord.id} current={ord.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

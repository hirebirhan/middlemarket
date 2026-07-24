import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import NewRequestForm from "@/components/NewRequestForm";
import AcceptOfferButton from "@/components/AcceptOfferButton";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function BuyerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "BUYER") redirect(user.role === "ADMIN" ? "/admin" : "/seller");

  const requests = await prisma.request.findMany({
    where: { buyerId: user.id },
    include: {
      offers: {
        where: { status: { in: ["APPROVED", "ACCEPTED"] } },
        include: { seller: true, order: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeOrders = requests
    .flatMap((r) => r.offers)
    .filter((o) => o.order && o.order.status !== "COMPLETED" && o.order.status !== "CANCELLED").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user.name.split(" ")[0]} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">
          Post what you need and let sellers compete — we review every price for you.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          ["My requests", requests.length],
          ["Offers to consider", requests.flatMap((r) => r.offers).filter((o) => o.status === "APPROVED").length],
          ["Active orders", activeOrders],
        ].map(([label, count]) => (
          <div key={label} className="bg-white border rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
            <p className="text-2xl font-bold mt-1">{count}</p>
          </div>
        ))}
      </div>

      <NewRequestForm />

      <div>
        <h2 className="text-lg font-semibold mb-3">My requests</h2>
        {requests.length === 0 && (
          <div className="bg-white border border-dashed rounded-xl p-10 text-center text-slate-400">
            <p className="text-3xl mb-2">🛒</p>
            <p className="font-medium text-slate-500">No requests yet</p>
            <p className="text-sm">Post your first request above and sellers will start making offers.</p>
          </div>
        )}
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="bg-white border rounded-xl p-5 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-base">{r.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{r.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <StatusBadge value={r.type} />
                  <StatusBadge value={r.status} />
                </div>
              </div>
              <div className="flex gap-4 text-sm text-slate-500 mt-2">
                {r.budget && <span>💰 Budget: ${r.budget.toString()}</span>}
                <span>📅 {r.createdAt.toLocaleDateString()}</span>
              </div>
              {r.offers.length > 0 && (
                <div className="mt-4 border-t pt-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-700">
                    ✅ Reviewed offers ({r.offers.length})
                  </p>
                  {r.offers.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-start justify-between gap-4 text-sm bg-slate-50 rounded-lg p-4"
                    >
                      <div>
                        <p>
                          <span className="font-semibold">{o.seller.name}</span>{" "}
                          <span className="font-bold text-indigo-700">
                            ${(o.adminPrice ?? o.price).toString()}
                          </span>
                          {o.adminPrice && (
                            <span className="text-slate-400 line-through ml-2">
                              ${o.price.toString()}
                            </span>
                          )}
                        </p>
                        <p className="text-slate-600 mt-1">{o.message}</p>
                        {o.adminNote && (
                          <p className="text-indigo-600 text-xs mt-1">
                            🏛 Marketplace note: {o.adminNote}
                          </p>
                        )}
                        {o.order && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-slate-500">Order status:</span>
                            <StatusBadge value={o.order.status} />
                          </div>
                        )}
                      </div>
                      {o.status === "APPROVED" && <AcceptOfferButton offerId={o.id} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import OfferForm from "@/components/OfferForm";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function SellerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SELLER") redirect(user.role === "ADMIN" ? "/admin" : "/buyer");

  const [openRequests, myOffers] = await Promise.all([
    prisma.request.findMany({
      where: { status: "OPEN" },
      include: { buyer: true, offers: { where: { sellerId: user.id } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.offer.findMany({
      where: { sellerId: user.id },
      include: { request: true, order: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const won = myOffers.filter((o) => o.status === "ACCEPTED").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user.name.split(" ")[0]} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">
          Browse open requests and win business with competitive, honest offers.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          ["Open requests", openRequests.length],
          ["My offers", myOffers.length],
          ["Offers won", won],
        ].map(([label, count]) => (
          <div key={label} className="bg-white border rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
            <p className="text-2xl font-bold mt-1">{count}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Open requests</h2>
        {openRequests.length === 0 && (
          <div className="bg-white border border-dashed rounded-xl p-10 text-center text-slate-400">
            <p className="text-3xl mb-2">🔎</p>
            <p className="font-medium text-slate-500">No open requests right now</p>
            <p className="text-sm">Check back soon — new buyer requests appear here.</p>
          </div>
        )}
        <div className="space-y-4">
          {openRequests.map((r) => (
            <div key={r.id} className="bg-white border rounded-xl p-5 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-base">{r.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{r.description}</p>
                </div>
                <StatusBadge value={r.type} />
              </div>
              <div className="flex gap-4 text-sm text-slate-500 mt-2">
                {r.budget && <span>💰 Buyer budget: ${r.budget.toString()}</span>}
                <span>📅 {r.createdAt.toLocaleDateString()}</span>
              </div>
              {r.offers.length > 0 ? (
                <p className="text-sm text-emerald-700 mt-3 bg-emerald-50 rounded-lg px-3 py-2 inline-block">
                  ✅ You offered ${r.offers[0].price.toString()} —{" "}
                  {r.offers[0].status.replace("_", " ").toLowerCase()}
                </p>
              ) : (
                <OfferForm requestId={r.id} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">My offers</h2>
        {myOffers.length === 0 && (
          <div className="bg-white border border-dashed rounded-xl p-10 text-center text-slate-400">
            <p className="text-3xl mb-2">💼</p>
            <p className="font-medium text-slate-500">No offers yet</p>
            <p className="text-sm">Make your first offer on an open request above.</p>
          </div>
        )}
        <div className="space-y-3">
          {myOffers.map((o) => (
            <div
              key={o.id}
              className="bg-white border rounded-xl p-4 text-sm flex items-start justify-between gap-4"
            >
              <div>
                <p className="font-semibold">{o.request.title}</p>
                <p className="text-slate-600 mt-0.5">
                  Your price: <span className="font-semibold">${o.price.toString()}</span>
                  {o.adminPrice && (
                    <span className="text-indigo-700"> · adjusted to ${o.adminPrice.toString()}</span>
                  )}
                </p>
                {o.adminNote && (
                  <p className="text-indigo-600 text-xs mt-1">🏛 Note: {o.adminNote}</p>
                )}
              </div>
              <div className="text-right space-y-2 shrink-0">
                <StatusBadge value={o.status} />
                {o.order && (
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-xs text-slate-500">Order:</span>
                    <StatusBadge value={o.order.status} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

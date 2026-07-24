import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import OfferForm from "@/components/OfferForm";

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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-3">Open requests</h2>
        {openRequests.length === 0 && (
          <p className="text-slate-500 text-sm">No open requests right now.</p>
        )}
        <div className="space-y-4">
          {openRequests.map((r) => (
            <div key={r.id} className="bg-white border rounded-lg p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{r.title}</h3>
                <span className="text-xs bg-slate-100 rounded px-2 py-1">{r.type}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{r.description}</p>
              {r.budget && (
                <p className="text-sm text-slate-500 mt-1">Buyer budget: ${r.budget.toString()}</p>
              )}
              {r.offers.length > 0 ? (
                <p className="text-sm text-emerald-700 mt-3">
                  You offered ${r.offers[0].price.toString()} — {r.offers[0].status.replace("_", " ").toLowerCase()}
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
        {myOffers.length === 0 && <p className="text-slate-500 text-sm">No offers yet.</p>}
        <div className="space-y-2">
          {myOffers.map((o) => (
            <div key={o.id} className="bg-white border rounded-lg p-4 text-sm flex justify-between">
              <div>
                <p className="font-medium">{o.request.title}</p>
                <p className="text-slate-600">
                  ${o.price.toString()}
                  {o.adminPrice && ` (adjusted to $${o.adminPrice.toString()})`}
                </p>
                {o.adminNote && <p className="text-indigo-600 text-xs">Note: {o.adminNote}</p>}
              </div>
              <div className="text-right">
                <span className="text-xs bg-slate-100 rounded px-2 py-1">{o.status}</span>
                {o.order && (
                  <p className="text-xs mt-2 text-emerald-700">Order: {o.order.status}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

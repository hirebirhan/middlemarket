import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import NewRequestForm from "@/components/NewRequestForm";
import AcceptOfferButton from "@/components/AcceptOfferButton";

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

  return (
    <div className="space-y-8">
      <NewRequestForm />
      <div>
        <h2 className="text-lg font-semibold mb-3">My requests</h2>
        {requests.length === 0 && (
          <p className="text-slate-500 text-sm">No requests yet — post one above.</p>
        )}
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className="bg-white border rounded-lg p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{r.title}</h3>
                <span className="text-xs bg-slate-100 rounded px-2 py-1">
                  {r.type} · {r.status}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{r.description}</p>
              {r.budget && (
                <p className="text-sm text-slate-500 mt-1">Budget: ${r.budget.toString()}</p>
              )}
              {r.offers.length > 0 && (
                <div className="mt-4 border-t pt-3 space-y-3">
                  <p className="text-sm font-medium">Reviewed offers</p>
                  {r.offers.map((o) => (
                    <div key={o.id} className="flex items-start justify-between gap-4 text-sm">
                      <div>
                        <p>
                          <span className="font-medium">{o.seller.name}</span> — $
                          {(o.adminPrice ?? o.price).toString()}
                          {o.adminPrice && (
                            <span className="text-slate-400 line-through ml-2">
                              ${o.price.toString()}
                            </span>
                          )}
                        </p>
                        <p className="text-slate-600">{o.message}</p>
                        {o.adminNote && (
                          <p className="text-indigo-600 text-xs mt-1">Marketplace note: {o.adminNote}</p>
                        )}
                        {o.order && (
                          <p className="text-xs mt-1 text-emerald-700">
                            Order status: {o.order.status}
                          </p>
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

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar, AdminTabs } from "@/components/admin/AdminNav";
import { OPEN_ORDER_STATUSES } from "@/lib/admin";

/**
 * The operator console shell.
 *
 * Admin is the only role that works a queue rather than completing a task, so
 * it is the only one that gets a persistent rail: the three jobs — review,
 * track, audit — need to be visible from each other, with the size of the
 * queue readable without navigating to it.
 *
 * Buyer and seller deliberately keep the plain top-nav layout. A buyer with
 * two requests should not be handed an operations tool.
 *
 * The guard lives here rather than in each page, so a new admin route cannot
 * be added without it.
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") {
    redirect(user.role === "SELLER" ? "/seller" : "/buyer");
  }

  // Counts for the nav badges. Two cheap aggregates, and they are the whole
  // reason the rail earns its width: "12 waiting" is the state of the business.
  const [pending, activeOrders] = await Promise.all([
    prisma.offer.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.order.count({ where: { status: { in: OPEN_ORDER_STATUSES } } }),
  ]);
  const counts = { pending, activeOrders };

  return (
    <div className="flex">
      <AdminSidebar counts={counts} />
      <div className="min-w-0 flex-1">
        <AdminTabs counts={counts} />
        {children}
      </div>
    </div>
  );
}

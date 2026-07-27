import type { Metadata } from "next";
import { ShoppingCart, SearchX, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import {
  PARAM,
  paginate,
  readOption,
  readPage,
  type SearchParams,
} from "@/lib/list-params";
import {
  CLOSED_ORDER_STATUSES,
  OPEN_ORDER_STATUSES,
  ORDER_VIEWS,
  ORDER_VIEW_STATUS,
} from "@/lib/admin";
import OrderStatusSelect from "@/components/OrderStatusSelect";
import StatusBadge from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { RecordList, RecordRow, RecordCell } from "@/components/ResponsiveRecordList";
import { FilterTabs } from "@/components/FilterTabs";
import { ListPagination } from "@/components/ListPagination";
import { Container } from "@/components/Container";
import { PageHeader, Money } from "@/components/Typography";

export const metadata: Metadata = {
  title: "Orders",
  description: "Track every order through fulfilment.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const view = readOption(params, PARAM.orders, ORDER_VIEWS, "active");
  const statuses = ORDER_VIEW_STATUS[view];
  const where = statuses ? { status: { in: statuses } } : {};

  const [total, activeTotal, deliveredTotal, closedTotal, allTotal] =
    await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { status: { in: OPEN_ORDER_STATUSES } } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.count({ where: { status: { in: CLOSED_ORDER_STATUSES } } }),
      prisma.order.count(),
    ]);

  const page = paginate(total, readPage(params, "page"));

  const orders = await prisma.order.findMany({
    where,
    include: {
      offer: { include: { seller: true, request: { include: { buyer: true } } } },
    },
    orderBy: { createdAt: "desc" },
    skip: page.skip,
    take: page.take,
  });

  return (
    <Container className="py-4 sm:py-5 space-y-4">
      <PageHeader
        eyebrow="Admin"
        title="Orders"
        description="Move each order along as it progresses. Complete and cancelled are final."
      />

      <FilterTabs
        label="Filter orders"
        basePath="/admin/orders"
        params={params}
        paramKey={PARAM.orders}
        pageKey="page"
        value={view}
        options={[
          { value: "active", label: "Needs action", count: activeTotal },
          { value: "delivered", label: "Delivered", count: deliveredTotal },
          { value: "closed", label: "Closed", count: closedTotal },
          { value: "all", label: "All", count: allTotal },
        ]}
      />

      {orders.length === 0 ? (
        allTotal === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="An order is created the moment a buyer accepts an approved offer."
          />
        ) : (
          <EmptyState
            icon={SearchX}
            title="No orders in this state"
            description="Nothing to do here right now. Switch to another view to see the rest."
          />
        )
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
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="text-foreground">
                    {order.offer.request.buyer.name}
                  </span>
                  <ArrowRight className="size-3 shrink-0" aria-hidden="true" />
                  <span className="sr-only">bought from</span>
                  <span className="text-foreground">
                    {order.offer.seller.name}
                  </span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={order.createdAt.toISOString()}>
                    {order.createdAt.toLocaleDateString()}
                  </time>
                </p>
              </RecordCell>
              <RecordCell label="Price" align="right">
                <Money className="font-semibold">
                  {formatMoney(order.offer.adminPrice ?? order.offer.price)}
                </Money>
              </RecordCell>
              <RecordCell label="Status" align="right">
                <StatusBadge value={order.status} />
              </RecordCell>
              <RecordCell label="Advance" align="right">
                <OrderStatusSelect
                  orderId={order.id}
                  current={order.status}
                  item={order.offer.request.title}
                />
              </RecordCell>
            </RecordRow>
          ))}
        </RecordList>
      )}

      <ListPagination
        page={page}
        basePath="/admin/orders"
        params={params}
        pageKey="page"
        label="orders"
      />
    </Container>
  );
}

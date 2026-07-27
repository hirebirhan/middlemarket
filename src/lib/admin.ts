import type { OfferStatus, OrderStatus } from "@prisma/client";

/**
 * Vocabulary shared by the admin routes and the console shell.
 *
 * These lived inside the single admin page. Now that the console is four
 * routes, they have to be somewhere all of them — and the layout that renders
 * the nav badges — can agree on. A sidebar that counts "active orders"
 * differently from the page it links to is worse than no count.
 */

/** Terminal orders are history; everything else still needs someone. */
export const CLOSED_ORDER_STATUSES: OrderStatus[] = ["COMPLETED", "CANCELLED"];
export const OPEN_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "DELIVERED",
];

export const ORDER_VIEWS = ["active", "delivered", "closed", "all"] as const;
export type OrderView = (typeof ORDER_VIEWS)[number];

export const ORDER_VIEW_STATUS: Record<OrderView, OrderStatus[] | undefined> = {
  active: OPEN_ORDER_STATUSES,
  delivered: ["DELIVERED"],
  closed: CLOSED_ORDER_STATUSES,
  all: undefined,
};

export const REVIEWED_STATUSES: OfferStatus[] = [
  "APPROVED",
  "REJECTED",
  "ACCEPTED",
];

export const DECISION_VIEWS = [
  "all",
  "approved",
  "declined",
  "accepted",
] as const;
export type DecisionView = (typeof DECISION_VIEWS)[number];

export const DECISION_VIEW_STATUS: Record<DecisionView, OfferStatus[]> = {
  all: REVIEWED_STATUSES,
  approved: ["APPROVED"],
  declined: ["REJECTED"],
  accepted: ["ACCEPTED"],
};

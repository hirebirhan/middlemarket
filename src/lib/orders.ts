import type { OrderStatus } from "@prisma/client";

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

/**
 * Which statuses an order may move to from where it is now. Shared by the API
 * route and the admin dropdown so the UI can only ever offer a move the server
 * would accept. COMPLETED and CANCELLED are terminal.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  // Delivery can be walked back if it turns out it never arrived.
  IN_PROGRESS: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["COMPLETED", "IN_PROGRESS"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return ORDER_TRANSITIONS[from].includes(to);
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" && ORDER_STATUSES.includes(value as OrderStatus)
  );
}

import { Badge } from "@/components/ui/badge";
import type { BadgeProps } from "@/components/ui/badge";

type Variant = NonNullable<BadgeProps["variant"]>;

const VARIANTS: Record<string, Variant> = {
  // Request
  OPEN: "info",
  MATCHED: "success",
  CLOSED: "outline",
  // Offer
  PENDING_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  ACCEPTED: "success",
  // Order
  PENDING: "warning",
  IN_PROGRESS: "info",
  DELIVERED: "info",
  COMPLETED: "success",
  CANCELLED: "danger",
  // Request type
  PRODUCT: "outline",
  SERVICE: "outline",
};

export function formatStatus(value: string) {
  return value.replace(/_/g, " ").toLowerCase();
}

export default function StatusBadge({ value }: { value: string }) {
  return (
    <Badge variant={VARIANTS[value] ?? "neutral"}>{formatStatus(value)}</Badge>
  );
}

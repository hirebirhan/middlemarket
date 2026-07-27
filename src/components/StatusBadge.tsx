import { Badge } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";

type StockVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

/**
 * Maps the product's semantic tones to the stock shadcn Badge variants. The
 * stock component only carries `default | secondary | destructive | outline |
 * ghost | link` — custom tones like "success" and "warning" are expressed
 * through those, not by adding variants to `ui/badge.tsx`.
 */
const VARIANT_MAP: Record<string, StockVariant> = {
  // Request
  OPEN: "outline",
  MATCHED: "default",
  CLOSED: "secondary",
  // Offer
  PENDING_REVIEW: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  ACCEPTED: "default",
  // Order
  PENDING: "secondary",
  IN_PROGRESS: "outline",
  DELIVERED: "outline",
  COMPLETED: "default",
  CANCELLED: "destructive",
  // Request type
  PRODUCT: "outline",
  SERVICE: "outline",
  // Offer condition
  NEW: "secondary",
  OPEN_BOX: "outline",
  REFURBISHED: "outline",
  USED: "outline",
};

/** Enum values are shouted; people are not. */
const LABELS: Record<string, string> = {
  OPEN: "Open",
  MATCHED: "Matched",
  CLOSED: "Closed",
  PENDING_REVIEW: "In review",
  APPROVED: "Approved",
  DECLINED: "Declined",
  REJECTED: "Declined",
  ACCEPTED: "Accepted",
  // "Placed" rather than "Pending": it matches the first step of OrderProgress,
  // so the badge and the tracker never call the same moment two things.
  PENDING: "Placed",
  IN_PROGRESS: "In progress",
  DELIVERED: "Delivered",
  COMPLETED: "Complete",
  CANCELLED: "Cancelled",
  PRODUCT: "Product",
  SERVICE: "Service",
  NEW: "New",
  OPEN_BOX: "Open box",
  REFURBISHED: "Refurbished",
  USED: "Used",
};

const CLASSIFIERS = new Set([
  "PRODUCT",
  "SERVICE",
  "NEW",
  "OPEN_BOX",
  "REFURBISHED",
  "USED",
]);

/** Fallback for any value not in the table: PENDING_REVIEW → "Pending review". */
export function formatStatus(value: string) {
  const label = LABELS[value];
  if (label) return label;
  const words = value.replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export default function StatusBadge({ value }: { value: string }) {
  const variant = VARIANT_MAP[value] ?? "secondary";
  const showDot = !CLASSIFIERS.has(value);
  return (
    <Badge variant={variant}>
      {showDot && (
        <span
          className="size-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {formatStatus(value)}
    </Badge>
  );
}

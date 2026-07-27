import { DashboardSkeleton } from "@/components/DashboardSkeleton";

/** Seller offers: performance metrics and a filterable history table. */
export default function Loading() {
  return (
    <DashboardSkeleton
      rail={false}
      statRow={3}
      sections={[{ kind: "table", rows: 6, toolbar: true }]}
    />
  );
}

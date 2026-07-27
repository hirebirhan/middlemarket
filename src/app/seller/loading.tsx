import { DashboardSkeleton } from "@/components/DashboardSkeleton";

/** Seller queue: one toolbar and the request cards that need a price. */
export default function Loading() {
  return (
    <DashboardSkeleton
      rail={false}
      sections={[
        { kind: "cards", rows: 5, toolbar: true },
      ]}
    />
  );
}

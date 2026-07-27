import { DashboardSkeleton } from "@/components/DashboardSkeleton";

/** Overview: a stat row across the top, then queue preview and the metric. */
export default function Loading() {
  return (
    <DashboardSkeleton
      rail={false}
      statRow={4}
      sections={[{ kind: "table", rows: 3 }]}
    />
  );
}

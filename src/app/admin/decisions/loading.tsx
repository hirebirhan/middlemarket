import { DashboardSkeleton } from "@/components/DashboardSkeleton";

export default function Loading() {
  return (
    <DashboardSkeleton
      rail={false}
      sections={[{ kind: "table", rows: 8, toolbar: true }]}
    />
  );
}

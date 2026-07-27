import { DashboardSkeleton } from "@/components/DashboardSkeleton";

/** Tall review cards, each carrying a form. */
export default function Loading() {
  return (
    <DashboardSkeleton
      rail={false}
      sections={[{ kind: "cards", rows: 3, toolbar: true }]}
    />
  );
}

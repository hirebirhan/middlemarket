import { DashboardSkeleton } from "@/components/DashboardSkeleton";

/**
 * Savings metric, three tiles and the post-a-request control in the rail; one
 * body section, whose cards each carry a nested list of checked offers.
 */
export default function Loading() {
  return (
    <DashboardSkeleton
      stats={3}
      sidebarForm
      sections={[{ kind: "cards", rows: 4, toolbar: true }]}
    />
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonText } from "@/components/SkeletonText";

export default function NewBuyerRequestLoading() {
  return (
    <div className="mx-auto w-full max-w-page space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-56" />
        <SkeletonText width="long" className="max-w-lg" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-[34rem] rounded-card" />
        <Skeleton className="h-80 rounded-card" />
      </div>
    </div>
  );
}

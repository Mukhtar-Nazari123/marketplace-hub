import { Skeleton } from "@/components/ui/skeleton";

const PromoCardSkeleton = () => {
  return (
    <div className="relative rounded-xl overflow-hidden bg-muted/50 p-6 flex-1 animate-pulse">
      <div className="absolute top-0 left-0 w-20 h-20 bg-muted rounded-full blur-2xl" />
      <Skeleton className="h-5 w-24 mb-2" />
      <Skeleton className="h-6 w-40 mb-1" />
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-8 w-28" />
    </div>
  );
};

export default PromoCardSkeleton;

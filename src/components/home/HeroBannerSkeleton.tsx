import { Skeleton } from "@/components/ui/skeleton";

const HeroBannerSkeleton = () => {
  return (
    <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-muted min-h-[400px] lg:min-h-[500px]">
      <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/95 to-muted/70" />
      <div className="relative z-10 h-full flex items-center justify-between px-8 lg:px-16">
        {/* Icon skeleton */}
        <div className="flex-shrink-0">
          <Skeleton className="w-48 h-48 lg:w-72 lg:h-72 rounded-full" />
        </div>
        
        {/* Content skeleton */}
        <div className="max-w-md p-6 lg:p-8 flex flex-col gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-12 w-32 mt-4" />
        </div>
      </div>
    </div>
  );
};

export default HeroBannerSkeleton;

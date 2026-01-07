import { Skeleton } from "@/components/ui/skeleton";

const HeroBannerSkeleton = () => {
  return (
    <div className="lg:col-span-2 relative rounded-xl sm:rounded-2xl overflow-hidden bg-muted min-h-[280px] sm:min-h-[350px] lg:min-h-[500px] w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/95 to-muted/70" />
      <div className="relative z-10 h-full flex flex-col sm:flex-row items-center justify-center sm:justify-between px-4 sm:px-8 lg:px-16 py-6 sm:py-0 gap-4 sm:gap-6">
        {/* Icon skeleton */}
        <div className="flex-shrink-0 order-1 sm:order-none">
          <Skeleton className="w-24 h-24 sm:w-36 sm:h-36 lg:w-56 lg:h-56 xl:w-72 xl:h-72 rounded-full" />
        </div>
        
        {/* Content skeleton */}
        <div className="flex-1 max-w-xs sm:max-w-sm lg:max-w-md flex flex-col gap-2 sm:gap-4 items-center sm:items-start order-2 sm:order-none">
          <Skeleton className="h-5 sm:h-6 w-20 sm:w-24" />
          <Skeleton className="h-8 sm:h-10 lg:h-12 w-full" />
          <Skeleton className="h-8 sm:h-10 lg:h-12 w-3/4" />
          <Skeleton className="h-4 sm:h-6 w-full" />
          <Skeleton className="h-10 sm:h-12 w-28 sm:w-32 mt-2 sm:mt-4" />
        </div>
      </div>
    </div>
  );
};

export default HeroBannerSkeleton;

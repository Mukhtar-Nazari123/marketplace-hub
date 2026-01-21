import { Skeleton } from '@/components/ui/skeleton';

const BlogCardSkeleton = () => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
      <Skeleton className="aspect-video w-full" />
      <div className="p-6">
        <div className="flex items-center gap-4 mb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-16 mb-3" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  );
};

export default BlogCardSkeleton;

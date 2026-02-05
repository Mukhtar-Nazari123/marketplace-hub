 import { useEffect, useRef, useCallback } from 'react';
 
 interface UseInfiniteScrollOptions {
   /** Callback to load more items */
   onLoadMore: () => void;
   /** Whether more items are available to load */
   hasMore: boolean;
   /** Whether currently loading */
   isLoading: boolean;
   /** Root margin for intersection observer (default: 200px) */
   rootMargin?: string;
   /** Threshold for intersection observer (default: 0) */
   threshold?: number;
 }
 
 /**
  * Hook for implementing infinite scroll behavior using Intersection Observer
  * Returns a ref to attach to a sentinel element at the bottom of the list
  */
 export const useInfiniteScroll = ({
   onLoadMore,
   hasMore,
   isLoading,
   rootMargin = '200px',
   threshold = 0,
 }: UseInfiniteScrollOptions) => {
   const sentinelRef = useRef<HTMLDivElement>(null);
   
   const handleIntersection = useCallback(
     (entries: IntersectionObserverEntry[]) => {
       const [entry] = entries;
       if (entry.isIntersecting && hasMore && !isLoading) {
         onLoadMore();
       }
     },
     [onLoadMore, hasMore, isLoading]
   );
 
   useEffect(() => {
     const sentinel = sentinelRef.current;
     if (!sentinel) return;
 
     const observer = new IntersectionObserver(handleIntersection, {
       root: null, // viewport
       rootMargin,
       threshold,
     });
 
     observer.observe(sentinel);
 
     return () => {
       observer.disconnect();
     };
   }, [handleIntersection, rootMargin, threshold]);
 
   return sentinelRef;
 };
 
 export default useInfiniteScroll;
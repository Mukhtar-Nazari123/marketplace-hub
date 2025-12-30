import { useState, useEffect } from "react";
import { MessageSquare, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewCard } from "./ReviewCard";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/lib/i18n";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  buyer?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { isRTL } = useLanguage();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          buyer_id
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch buyer profiles separately
      const buyerIds = [...new Set(data?.map(r => r.buyer_id) || [])];
      
      let profilesMap: Record<string, { full_name: string; avatar_url?: string }> = {};
      
      if (buyerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", buyerIds);
        
        profiles?.forEach(p => {
          profilesMap[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url || undefined };
        });
      }

      const reviewsWithBuyers = data?.map(review => ({
        ...review,
        buyer: profilesMap[review.buyer_id],
      })) || [];

      setReviews(reviewsWithBuyers);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0,
  }));

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-8 sm:p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
          <p className="text-muted-foreground">
            Be the first to review this product!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className={cn(
            "flex flex-col sm:flex-row gap-6 sm:gap-8",
            isRTL ? "sm:flex-row-reverse" : ""
          )}>
            {/* Average Rating */}
            <div className={cn(
              "flex flex-col items-center justify-center gap-2 sm:min-w-[140px]",
              isRTL ? "sm:border-l sm:pl-8" : "sm:border-r sm:pr-8"
            )}>
              <span className="text-4xl sm:text-5xl font-bold text-foreground">
                {averageRating.toFixed(1)}
              </span>
              <StarRating rating={Math.round(averageRating)} readonly size="sm" />
              <span className="text-sm text-muted-foreground">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div
                  key={rating}
                  className={cn(
                    "flex items-center gap-3",
                    isRTL ? "flex-row-reverse" : ""
                  )}
                >
                  <span className={cn(
                    "text-sm text-muted-foreground w-6",
                    isRTL ? "text-left" : "text-right"
                  )}>
                    {rating}
                  </span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full bg-yellow-400 transition-all duration-500 rounded-full",
                        isRTL ? "ml-auto" : ""
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-sm text-muted-foreground w-8",
                    isRTL ? "text-right" : "text-left"
                  )}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className={cn(
          "text-lg font-semibold",
          isRTL ? "text-right" : "text-left"
        )}>
          Customer Reviews
        </h3>
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "./StarRating";
import { ReviewForm } from "./ReviewForm";
import { ReviewCard } from "./ReviewCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface OrderItemReviewProps {
  orderId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  orderStatus: string;
}

interface ExistingReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export function OrderItemReview({
  orderId,
  productId,
  productName,
  productImage,
  orderStatus,
}: OrderItemReviewProps) {
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const { isRTL } = useLanguage();

  const isDelivered = orderStatus === "delivered";
  const canReview = isDelivered && user;

  useEffect(() => {
    if (user && productId) {
      fetchExistingReview();
    } else {
      setLoading(false);
    }
  }, [user, productId]);

  const fetchExistingReview = async () => {
    try {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at")
        .eq("product_id", productId)
        .eq("buyer_id", user!.id)
        .maybeSingle();

      setExistingReview(data);
    } catch (error) {
      console.error("Error fetching review:", error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = existingReview
    ? new Date(existingReview.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    : false;

  if (loading) {
    return <Skeleton className="h-10 w-24" />;
  }

  if (!canReview) {
    return (
      <span className="text-xs text-muted-foreground">
        {isRTL ? "نیاز به تحویل سفارش" : "Delivery required"}
      </span>
    );
  }

  if (existingReview) {
    return (
      <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "")}>
        <StarRating rating={existingReview.rating} readonly size="sm" />
        {canEdit && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                {isRTL ? "ویرایش" : "Edit"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className={cn(isRTL ? "text-right" : "")}>
                  {isRTL ? "ویرایش نظر" : "Edit Review"}
                </DialogTitle>
              </DialogHeader>
              <div className={cn("flex items-center gap-3 mb-4", isRTL ? "flex-row-reverse" : "")}>
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {productImage ? (
                    <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className={cn("font-medium text-sm line-clamp-2", isRTL ? "text-right" : "")}>
                  {productName}
                </p>
              </div>
              <ReviewForm
                productId={productId}
                orderId={orderId}
                existingReview={existingReview}
                onSuccess={() => {
                  setDialogOpen(false);
                  fetchExistingReview();
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Star className="w-4 h-4" />
          {isRTL ? "ثبت نظر" : "Review"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className={cn(isRTL ? "text-right" : "")}>
            {isRTL ? "ثبت نظر" : "Write a Review"}
          </DialogTitle>
        </DialogHeader>
        <div className={cn("flex items-center gap-3 mb-4", isRTL ? "flex-row-reverse" : "")}>
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {productImage ? (
              <img src={productImage} alt={productName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <p className={cn("font-medium text-sm line-clamp-2", isRTL ? "text-right" : "")}>
            {productName}
          </p>
        </div>
        <ReviewForm
          productId={productId}
          orderId={orderId}
          onSuccess={() => {
            setDialogOpen(false);
            fetchExistingReview();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

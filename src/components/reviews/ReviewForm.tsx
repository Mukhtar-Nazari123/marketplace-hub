import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { StarRating } from "./StarRating";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review must be less than 1000 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  orderId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
  };
  onSuccess?: () => void;
}

export function ReviewForm({ productId, orderId, existingReview, onSuccess }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  
  const isEditing = !!existingReview;
  const canEdit = existingReview 
    ? new Date(existingReview.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    : true;

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || "",
    },
  });

  const onSubmit = async (values: ReviewFormValues) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit a review",
          variant: "destructive",
        });
        return;
      }

      if (isEditing && existingReview) {
        const { error } = await supabase
          .from("reviews")
          .update({
            rating: values.rating,
            comment: values.comment,
          })
          .eq("id", existingReview.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("reviews")
          .insert({
            product_id: productId,
            order_id: orderId,
            buyer_id: user.id,
            rating: values.rating,
            comment: values.comment,
          });

        if (error) throw error;
      }

      setShowSuccess(true);
      toast({
        title: isEditing ? "Review updated!" : "Review submitted!",
        description: "Thank you for your feedback",
      });

      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
      }, 2000);

    } catch (error: any) {
      console.error("Review submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canEdit && isEditing) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Reviews can only be edited within 7 days of submission.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showSuccess) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-8 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <CheckCircle className="w-16 h-16 text-primary animate-scale-in" />
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          </div>
          <p className="text-lg font-medium text-foreground animate-fade-in">
            {isEditing ? "Review Updated Successfully!" : "Thank You for Your Review!"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 transition-all duration-300 hover:shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className={cn(
          "text-lg font-semibold",
          isRTL ? "text-right" : "text-left"
        )}>
          {isEditing ? "Edit Your Review" : "Write a Review"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating Field */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(isRTL ? "text-right block" : "")}>
                    Your Rating *
                  </FormLabel>
                  <FormControl>
                    <div className={cn(isRTL ? "flex justify-end" : "")}>
                      <StarRating
                        rating={field.value}
                        onRatingChange={field.onChange}
                        size="lg"
                        showLabel
                      />
                    </div>
                  </FormControl>
                  <FormMessage className={cn(isRTL ? "text-right" : "")} />
                </FormItem>
              )}
            />

            {/* Comment Field */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(isRTL ? "text-right block" : "")}>
                    Your Review *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience with this product..."
                      className={cn(
                        "min-h-[120px] resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                        isRTL ? "text-right" : "text-left"
                      )}
                      {...field}
                    />
                  </FormControl>
                  <div className={cn(
                    "flex justify-between text-xs text-muted-foreground",
                    isRTL ? "flex-row-reverse" : ""
                  )}>
                    <FormMessage />
                    <span>{field.value.length}/1000</span>
                  </div>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full sm:w-auto transition-all duration-200",
                isRTL ? "flex-row-reverse" : ""
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ltr:mr-2 rtl:ml-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                  {isEditing ? "Update Review" : "Submit Review"}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

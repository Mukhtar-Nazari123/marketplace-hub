import { format } from "date-fns";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    buyer?: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { isRTL } = useLanguage();
  
  const initials = review.buyer?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <Card className="group transition-all duration-300 hover:shadow-md border-border/50 bg-card">
      <CardContent className="p-4 sm:p-6">
        <div className={cn("flex gap-4", isRTL ? "flex-row-reverse" : "flex-row")}>
          {/* Avatar */}
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-background shadow-sm flex-shrink-0">
            <AvatarImage src={review.buyer?.avatar_url} alt={review.buyer?.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Content */}
          <div className={cn("flex-1 min-w-0", isRTL ? "text-right" : "text-left")}>
            {/* Header */}
            <div className={cn(
              "flex flex-wrap items-center gap-2 sm:gap-3 mb-2",
              isRTL ? "flex-row-reverse" : "flex-row"
            )}>
              <h4 className="font-semibold text-foreground truncate">
                {review.buyer?.full_name || "Anonymous"}
              </h4>
              <span className="text-xs text-muted-foreground">
                {format(new Date(review.created_at), "MMM d, yyyy")}
              </span>
            </div>
            
            {/* Rating */}
            <div className={cn("mb-3", isRTL ? "flex justify-end" : "")}>
              <StarRating rating={review.rating} readonly size="sm" />
            </div>
            
            {/* Comment */}
            <p className={cn(
              "text-sm sm:text-base text-muted-foreground leading-relaxed",
              isRTL ? "text-right" : "text-left"
            )}>
              {review.comment}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const labels = {
  en: ["Poor", "Fair", "Good", "Very Good", "Excellent"],
  fa: ["ضعیف", "متوسط", "خوب", "خیلی خوب", "عالی"],
};

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  showLabel = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const { language, isRTL } = useLanguage();
  
  const displayRating = hoverRating || rating;
  const stars = [1, 2, 3, 4, 5];
  const orderedStars = isRTL ? [...stars].reverse() : stars;

  const handleClick = (starValue: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleMouseEnter = (starValue: number) => {
    if (!readonly) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const getRatingLabel = () => {
    if (displayRating === 0) return "";
    const labelArray = language === "fa" ? labels.fa : labels.en;
    return labelArray[displayRating - 1];
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex items-center gap-1",
          isRTL ? "flex-row" : "flex-row"
        )}
        onMouseLeave={handleMouseLeave}
      >
        {orderedStars.map((starValue) => {
          const isFilled = starValue <= displayRating;
          
          return (
            <button
              key={starValue}
              type="button"
              disabled={readonly}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              className={cn(
                "relative transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm",
                !readonly && "cursor-pointer hover:scale-110 active:scale-95",
                readonly && "cursor-default"
              )}
              aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-all duration-200",
                  isFilled
                    ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                    : "fill-transparent text-muted-foreground/40"
                )}
              />
              {/* Animated glow effect on hover */}
              {!readonly && hoverRating >= starValue && (
                <span
                  className={cn(
                    "absolute inset-0 rounded-full bg-yellow-400/20 animate-ping",
                    sizeClasses[size]
                  )}
                  style={{ animationDuration: "0.6s", animationIterationCount: "1" }}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {showLabel && displayRating > 0 && (
        <span
          className={cn(
            "text-sm font-medium text-muted-foreground animate-fade-in",
            isRTL ? "text-right" : "text-left"
          )}
        >
          {getRatingLabel()}
        </span>
      )}
    </div>
  );
}

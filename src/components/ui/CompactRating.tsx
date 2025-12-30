import { Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface CompactRatingProps {
  rating: number;
  reviewCount: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
  className?: string;
}

const CompactRating = ({ 
  rating, 
  reviewCount, 
  size = 'sm', 
  showCount = true,
  className 
}: CompactRatingProps) => {
  const { t, isRTL } = useLanguage();
  
  const starSize = size === 'sm' ? 12 : 14;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  
  // If no reviews, show placeholder
  if (reviewCount === 0) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <div className={cn('flex items-center', isRTL && 'flex-row-reverse')}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              style={{ width: starSize, height: starSize }}
              className="text-muted-foreground/40"
            />
          ))}
        </div>
        {showCount && (
          <span className={cn(textSize, 'text-muted-foreground')}>
            ({isRTL ? 'بدون نظر' : 'No reviews'})
          </span>
        )}
      </div>
    );
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className={cn('flex items-center', isRTL && 'flex-row-reverse')}>
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            style={{ width: starSize, height: starSize }}
            className="fill-orange text-orange"
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative" style={{ width: starSize, height: starSize }}>
            <Star
              style={{ width: starSize, height: starSize }}
              className="absolute text-muted-foreground/40"
            />
            <div className="absolute overflow-hidden" style={{ width: starSize / 2 }}>
              <Star
                style={{ width: starSize, height: starSize }}
                className="fill-orange text-orange"
              />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            style={{ width: starSize, height: starSize }}
            className="text-muted-foreground/40"
          />
        ))}
      </div>
      
      {showCount && (
        <span className={cn(textSize, 'text-muted-foreground')}>
          ({isRTL ? reviewCount.toLocaleString('fa-AF') : reviewCount} {t.product.reviews})
        </span>
      )}
    </div>
  );
};

export default CompactRating;

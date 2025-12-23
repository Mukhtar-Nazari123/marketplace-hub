import { Star, Heart, ShoppingCart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

interface ProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image?: string;
  badge?: "sale" | "new" | "hot";
  discount?: number;
  countdown?: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

const ProductCard = ({
  name,
  price,
  originalPrice,
  rating,
  reviews,
  image,
  badge,
  discount,
  countdown,
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { t, isRTL } = useLanguage();

  const formatPrice = (num: number) => {
    if (isRTL) {
      return num.toFixed(2).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
    }
    return num.toFixed(2);
  };

  return (
    <div
      className="group relative bg-card rounded-xl border border-border overflow-hidden hover-lift"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className={`absolute top-3 z-10 flex flex-col gap-1 ${isRTL ? 'right-3' : 'left-3'}`}>
        {badge === "sale" && (
          <Badge variant="sale" className="text-xs">
            -{discount}{isRTL ? '٪' : '%'}
          </Badge>
        )}
        {badge === "new" && (
          <Badge variant="new" className="text-xs">
            {t.product.new}
          </Badge>
        )}
        {badge === "hot" && (
          <Badge variant="hot" className="text-xs">
            {t.product.hot}
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <button className={`absolute top-3 z-10 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-orange hover:text-accent-foreground transition-colors ${isRTL ? 'left-3' : 'right-3'}`}>
        <Heart className="h-4 w-4" />
      </button>

      {/* Image */}
      <div className="relative aspect-square bg-secondary/50 p-4 overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          {image ? (
            <img src={image} alt={name} className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button variant="cyan" size="icon" className="rounded-full h-9 w-9">
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full h-9 w-9">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < rating ? "fill-orange text-orange" : "text-muted"}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({reviews} {t.product.reviews})</span>
        </div>

        {/* Name */}
        <h3 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-cyan transition-colors">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${formatPrice(originalPrice)}
            </span>
          )}
          <span className="text-lg font-bold text-orange">${formatPrice(price)}</span>
        </div>

        {/* Countdown */}
        {countdown && (
          <div className="mt-3 flex items-center justify-center gap-1 bg-foreground text-background rounded-lg p-2">
            <div className="text-center">
              <span className="font-bold text-lg">{isRTL ? countdown.hours.toString().padStart(2, "0").replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]) : countdown.hours.toString().padStart(2, "0")}</span>
              <p className="text-[10px] uppercase opacity-70">{t.product.hours}</p>
            </div>
            <span className="font-bold">:</span>
            <div className="text-center">
              <span className="font-bold text-lg">{isRTL ? countdown.minutes.toString().padStart(2, "0").replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]) : countdown.minutes.toString().padStart(2, "0")}</span>
              <p className="text-[10px] uppercase opacity-70">{t.product.minutes}</p>
            </div>
            <span className="font-bold">:</span>
            <div className="text-center">
              <span className="font-bold text-lg">{isRTL ? countdown.seconds.toString().padStart(2, "0").replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]) : countdown.seconds.toString().padStart(2, "0")}</span>
              <p className="text-[10px] uppercase opacity-70">{t.product.seconds}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

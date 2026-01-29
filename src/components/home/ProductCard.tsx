import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import CompactRating from "@/components/ui/CompactRating";
import DealCountdown from "./DealCountdown";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image?: string;
  badge?: "sale" | "new" | "hot"; // Legacy support
  isNew?: boolean;
  isHot?: boolean;
  discount?: number;
  // Legacy countdown support (static)
  countdown?: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  // New deal countdown support (dynamic)
  isDeal?: boolean;
  dealStartAt?: string | null;
  dealEndAt?: string | null;
  currency?: 'AFN' | 'USD';
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  rating,
  reviews,
  image,
  badge,
  isNew,
  isHot,
  discount,
  countdown,
  isDeal,
  dealStartAt,
  dealEndAt,
  currency = 'AFN',
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, role } = useAuth();

  const isWishlisted = isInWishlist(id);
  const isBuyer = role === 'buyer';
  const currencySymbol = currency === 'USD' ? '$' : (isRTL ? 'افغانی' : 'AFN');

  // Show countdown if deal is active with valid end time
  const showDealCountdown = isDeal && dealEndAt;

  const formatPrice = (num: number) => {
    if (isRTL) {
      return num.toLocaleString('fa-AF');
    }
    return num.toLocaleString();
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    await addToCart(id);
    setIsAddingToCart(false);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    await toggleWishlist(id);
  };

  return (
    <div
      className="group relative bg-background rounded-xl border border-muted-foreground/30 overflow-hidden hover-lift h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges - Red badges */}
      <div className={`absolute top-3 z-10 flex flex-col gap-1 ${isRTL ? 'right-3' : 'left-3'}`}>
        {/* New badge */}
        {(isNew || badge === "new") && (
          <Badge variant="new" className="text-xs">
            {t.product.new}
          </Badge>
        )}
        {/* Discount badge - Red with percentage */}
        {discount && discount > 0 && (
          <Badge variant="sale" className="text-xs">
            -{discount}{isRTL ? '٪' : '%'}
          </Badge>
        )}
        {/* Hot badge */}
        {(isHot || badge === "hot") && !isNew && (
          <Badge variant="hot" className="text-xs">
            {t.product.hot}
          </Badge>
        )}
      </div>

      {/* Top Right Actions - Wishlist & Quick View */}
      <div className={`absolute top-3 z-10 flex flex-col gap-2 ${isRTL ? 'left-3' : 'right-3'}`}>
        {/* Wishlist Button */}
        {(!user || isBuyer) && (
          <button 
            onClick={handleWishlistToggle}
            className={cn(
              "w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors",
              isWishlisted 
                ? "bg-primary text-white" 
                : "bg-background/80 text-muted-foreground hover:bg-primary hover:text-white"
            )}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
          </button>
        )}

        {/* Quick View Icon - Appears on Hover */}
        <Link 
          to={`/products/${id}`}
          className={cn(
            "w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 bg-background/80 text-muted-foreground hover:bg-primary hover:text-white",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <Eye className="h-4 w-4" />
        </Link>
      </div>

      {/* Image - Fixed aspect ratio 1:1 */}
      <Link to={`/products/${id}`} className="block flex-shrink-0">
        <div className="relative aspect-square overflow-hidden">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-1 md:p-2 flex flex-col flex-grow">
        {/* Price - Primary visual element */}
        <div className="flex items-baseline gap-1.5 flex-shrink-0 mb-1.5">
          <span className="text-base sm:text-lg md:text-xl font-bold text-primary truncate">
            {formatPrice(price)} {currencySymbol}
          </span>
          {originalPrice && (
            <span className="text-[10px] sm:text-xs text-muted-foreground line-through truncate">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Name - Single line, truncated */}
        <Link to={`/products/${id}`} className="flex-shrink-0">
          <h3 className="text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating - Tertiary element */}
        <div className="h-4 mt-1.5 flex-shrink-0">
          <CompactRating rating={rating} reviewCount={reviews} size="sm" />
        </div>

        {/* Countdown - Red numbers, grey labels */}
        {(showDealCountdown || countdown) && (
          <div className="h-14 mt-2 flex-shrink-0">
            {showDealCountdown ? (
              <DealCountdown dealEndAt={dealEndAt} dealStartAt={dealStartAt} />
            ) : countdown ? (
              // Legacy static countdown support
              <div className="flex items-center justify-center gap-1 bg-foreground text-background rounded-lg p-2 h-full">
                <div className="text-center">
                  <span className="font-bold text-lg text-primary">{isRTL ? countdown.hours.toString().padStart(2, "0").replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]) : countdown.hours.toString().padStart(2, "0")}</span>
                  <p className="text-[10px] uppercase opacity-70">{t.product.hours}</p>
                </div>
                <span className="font-bold">:</span>
                <div className="text-center">
                  <span className="font-bold text-lg text-primary">{isRTL ? countdown.minutes.toString().padStart(2, "0").replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]) : countdown.minutes.toString().padStart(2, "0")}</span>
                  <p className="text-[10px] uppercase opacity-70">{t.product.minutes}</p>
                </div>
                <span className="font-bold">:</span>
                <div className="text-center">
                  <span className="font-bold text-lg text-primary">{isRTL ? countdown.seconds.toString().padStart(2, "0").replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]) : countdown.seconds.toString().padStart(2, "0")}</span>
                  <p className="text-[10px] uppercase opacity-70">{t.product.seconds}</p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Add to Cart Button - Always visible at bottom */}
        <Button 
          className="w-full mt-auto pt-2"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
        >
          <ShoppingCart className={cn("h-4 w-4 mr-2", isAddingToCart && "animate-pulse")} />
          {isRTL ? 'افزودن' : 'Add'}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;

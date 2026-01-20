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

      {/* Wishlist Button */}
      {(!user || isBuyer) && (
        <button 
          onClick={handleWishlistToggle}
          className={cn(
            `absolute top-3 z-10 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${isRTL ? 'left-3' : 'right-3'}`,
            isWishlisted 
              ? "bg-primary text-white" 
              : "bg-background/80 text-muted-foreground hover:bg-primary hover:text-white"
          )}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </button>
      )}

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

          {/* Quick Actions */}
          <div
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 transition-all duration-300 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button 
              size="icon" 
              className="rounded-full h-9 w-9"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingCart className={cn("h-4 w-4", isAddingToCart && "animate-pulse")} />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full h-9 w-9" asChild>
              <Link to={`/products/${id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Rating */}
        <div className="h-5 mb-2 flex-shrink-0">
          <CompactRating rating={rating} reviewCount={reviews} size="sm" />
        </div>

        {/* Name */}
        <Link to={`/products/${id}`} className="flex-shrink-0">
          <h3 className="font-medium text-foreground h-11 line-clamp-2 group-hover:text-primary transition-colors overflow-hidden">
            {name}
          </h3>
        </Link>

        {/* Price - Red for main price, grey strikethrough for original */}
        <div className="h-7 flex items-center gap-2 flex-shrink-0 mt-2">
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through truncate">
              {formatPrice(originalPrice)} {currencySymbol}
            </span>
          )}
          <span className="text-lg font-bold text-primary truncate">{formatPrice(price)} {currencySymbol}</span>
          <Badge variant="outline" className="text-xs ml-auto flex-shrink-0">{currency}</Badge>
        </div>

        {/* Countdown - Red numbers, grey labels */}
        <div className="h-14 mt-auto flex-shrink-0">
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
      </div>
    </div>
  );
};

export default ProductCard;

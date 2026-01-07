import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Eye, Grid, List } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useProductRatings } from '@/hooks/useProductRatings';
import CompactRating from '@/components/ui/CompactRating';

// Support both mock data format and new DB format
interface DisplayProduct {
  id: string;
  name: { fa: string; en: string } | string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category?: string;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  isNew?: boolean;
  isHot?: boolean;
  discount?: number;
  currency?: string;
  currencySymbol?: string;
  description?: { fa: string; en: string } | string;
}

interface ProductGridProps {
  products: DisplayProduct[];
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

const ProductGrid = ({ products, viewMode = 'grid', onViewModeChange }: ProductGridProps) => {
  const { t, isRTL } = useLanguage();
  
  const productIds = useMemo(() => products.map(p => p.id), [products]);
  const { getRating } = useProductRatings(productIds);

  return (
    <div>
      {/* View Toggle */}
      {onViewModeChange && (
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={viewMode === 'grid' ? 'cyan' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid size={18} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'cyan' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            <List size={18} />
          </Button>
          <span className="text-sm text-muted-foreground mx-2">
            {products.length} {isRTL ? 'محصول' : 'products'}
          </span>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} getRating={getRating} />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {products.map((product) => (
            <ProductListItem key={product.id} product={product} getRating={getRating} />
          ))}
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t.common.noProducts}</p>
        </div>
      )}
    </div>
  );
};

const getProductName = (name: { fa: string; en: string } | string, language: 'fa' | 'en'): string => {
  if (typeof name === 'string') return name;
  return name[language] || name.en;
};

const getProductDescription = (desc: { fa: string; en: string } | string | undefined, language: 'fa' | 'en'): string => {
  if (!desc) return '';
  if (typeof desc === 'string') return desc;
  return desc[language] || desc.en;
};

interface ProductCardInternalProps {
  product: DisplayProduct;
  getRating: (id: string) => { averageRating: number; reviewCount: number };
}

const ProductCard = ({ product, getRating }: ProductCardInternalProps) => {
  const { t, language, isRTL } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const isWishlisted = isInWishlist(product.id);
  const isBuyer = role === 'buyer';
  const currencySymbol = product.currencySymbol || (product.currency === 'USD' ? '$' : 'AFN');
  
  const { averageRating, reviewCount } = getRating(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    await addToCart(product.id);
    setIsAddingToCart(false);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    await toggleWishlist(product.id);
  };

  return (
    <div
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image - Fixed aspect ratio */}
      <div className="relative aspect-square overflow-hidden flex-shrink-0">
        <Link to={`/products/${product.slug}`}>
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={getProductName(product.name, language)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Badges */}
        <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} flex flex-col gap-1`}>
          {product.isNew && <Badge variant="new">{t.product.new}</Badge>}
          {product.isHot && <Badge variant="hot">{t.product.hot}</Badge>}
          {product.discount && product.discount > 0 && <Badge variant="sale">-{product.discount}%</Badge>}
        </div>

        {/* Quick Actions */}
        <div
          className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}
        >
          {/* Wishlist - only for buyers */}
          {(!user || isBuyer) && (
            <button
              onClick={handleWishlistToggle}
              className={cn(
                "p-2 rounded-full transition-colors shadow-md",
                isWishlisted 
                  ? "bg-red-500 text-white" 
                  : "bg-white/90 dark:bg-gray-800/90 hover:bg-primary hover:text-white"
              )}
            >
              <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
            </button>
          )}
          <Link
            to={`/products/${product.slug}`}
            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-primary hover:text-white transition-colors shadow-md"
          >
            <Eye size={18} />
          </Link>
        </div>
      </div>

      {/* Content - Flex grow to fill remaining space */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Name - Fixed height with truncation */}
        <Link to={`/products/${product.slug}`} className="flex-shrink-0">
          <h3 className="font-medium text-foreground hover:text-primary transition-colors h-11 line-clamp-2 overflow-hidden mb-2">
            {getProductName(product.name, language)}
          </h3>
        </Link>

        {/* Rating - Fixed height */}
        <div className="h-5 mb-2 flex-shrink-0">
          <CompactRating rating={averageRating} reviewCount={reviewCount} size="sm" />
        </div>

        {/* Price - Fixed height container */}
        <div className="h-7 flex items-center gap-2 mb-3 flex-shrink-0">
          {product.originalPrice && product.originalPrice !== product.price && (
            <span className="text-sm text-muted-foreground line-through truncate">
              {product.currency === 'USD' ? '$' : ''}{product.originalPrice.toLocaleString()} {product.currency !== 'USD' ? currencySymbol : ''}
            </span>
          )}
          <span className="text-lg font-bold text-orange truncate">
            {product.currency === 'USD' ? '$' : ''}{product.price.toLocaleString()} {product.currency !== 'USD' ? currencySymbol : ''}
          </span>
          <Badge variant="outline" className="text-xs ml-auto flex-shrink-0">{product.currency || 'AFN'}</Badge>
        </div>

        {/* Add to Cart - Push to bottom */}
        <div className="mt-auto flex-shrink-0">
          <Button 
            variant="cyan" 
            size="sm" 
            className="w-full gap-2"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            <ShoppingCart size={16} className={isAddingToCart ? 'animate-pulse' : ''} />
            {isAddingToCart 
              ? (isRTL ? 'در حال افزودن...' : 'Adding...') 
              : t.product.addToCart
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProductListItem = ({ product, getRating }: ProductCardInternalProps) => {
  const { t, language, isRTL } = useLanguage();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const isWishlisted = isInWishlist(product.id);
  const isBuyer = role === 'buyer';
  const currencySymbol = product.currencySymbol || (product.currency === 'USD' ? '$' : 'AFN');
  
  const { averageRating, reviewCount } = getRating(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    await addToCart(product.id);
    setIsAddingToCart(false);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    await toggleWishlist(product.id);
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row">
      {/* Image */}
      <div className="relative w-full md:w-64 aspect-square md:aspect-auto md:h-48 flex-shrink-0">
        <Link to={`/products/${product.slug}`}>
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={getProductName(product.name, language)}
            className="w-full h-full object-cover"
          />
        </Link>
        <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} flex gap-1`}>
          {product.isNew && <Badge variant="new">{t.product.new}</Badge>}
          {product.isHot && <Badge variant="hot">{t.product.hot}</Badge>}
          {product.discount && product.discount > 0 && <Badge variant="sale">-{product.discount}%</Badge>}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-medium text-lg text-foreground hover:text-primary transition-colors mb-2">
            {getProductName(product.name, language)}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {getProductDescription(product.description, language)}
        </p>

        <div className="mb-2">
          <CompactRating rating={averageRating} reviewCount={reviewCount} size="sm" />
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {product.originalPrice && product.originalPrice !== product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {product.currency === 'USD' ? '$' : ''}{product.originalPrice.toLocaleString()} {product.currency !== 'USD' ? currencySymbol : ''}
              </span>
            )}
            <span className="text-xl font-bold text-orange">
              {product.currency === 'USD' ? '$' : ''}{product.price.toLocaleString()} {product.currency !== 'USD' ? currencySymbol : ''}
            </span>
            <Badge variant="outline" className="text-xs">{product.currency || 'AFN'}</Badge>
          </div>
          <div className="flex gap-2">
            {(!user || isBuyer) && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleWishlistToggle}
                className={isWishlisted ? 'text-red-500' : ''}
              >
                <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
              </Button>
            )}
            <Button 
              variant="cyan" 
              size="sm" 
              className="gap-2"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingCart size={16} className={isAddingToCart ? 'animate-pulse' : ''} />
              {isAddingToCart 
                ? (isRTL ? 'افزودن...' : 'Adding...') 
                : t.product.addToCart
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Heart, ShoppingCart, Eye, Grid, List } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {products.map((product) => (
            <ProductListItem key={product.id} product={product} />
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

const ProductCard = ({ product }: { product: DisplayProduct }) => {
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
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
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

      {/* Content */}
      <div className="p-4">
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 mb-2">
            {getProductName(product.name, language)}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}
            />
          ))}
          <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary">
            {product.currency === 'USD' ? '$' : ''}{product.price.toLocaleString()} {product.currency !== 'USD' ? currencySymbol : ''}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              {product.currency === 'USD' ? '$' : ''}{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart */}
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
  );
};

const ProductListItem = ({ product }: { product: DisplayProduct }) => {
  const { t, language, isRTL } = useLanguage();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const isWishlisted = isInWishlist(product.id);
  const isBuyer = role === 'buyer';
  const currencySymbol = product.currencySymbol || (product.currency === 'USD' ? '$' : 'AFN');

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

        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}
            />
          ))}
          <span className="text-xs text-muted-foreground">({product.reviewCount || 0} {t.product.reviews})</span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">
              {product.currency === 'USD' ? '$' : ''}{product.price.toLocaleString()} {product.currency !== 'USD' ? currencySymbol : ''}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {product.currency === 'USD' ? '$' : ''}{product.originalPrice.toLocaleString()}
              </span>
            )}
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

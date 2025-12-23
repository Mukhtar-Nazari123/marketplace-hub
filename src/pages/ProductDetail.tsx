import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { products, reviews } from '@/data/mockData';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
} from 'lucide-react';

const ProductDetail = () => {
  const { slug } = useParams();
  const { t, language, isRTL } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.slug === slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t.common.pageNotFound}</h1>
          <Link to="/">
            <Button variant="cyan">{t.common.backToHome}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              {t.pages.home}
            </Link>
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <Link to="/products" className="text-muted-foreground hover:text-primary">
              {t.pages.products}
            </Link>
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <span className="text-primary">{product.name[language]}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={product.images[selectedImage]}
                alt={product.name[language]}
                className="w-full h-full object-cover"
              />
              {product.discount && (
                <Badge variant="sale" className="absolute top-4 left-4 text-lg px-3 py-1">
                  -{product.discount}%
                </Badge>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex gap-2">
              {product.isNew && <Badge variant="new">{t.product.new}</Badge>}
              {product.isHot && <Badge variant="hot">{t.product.hot}</Badge>}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {product.name[language]}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                ({product.reviewCount} {t.product.reviews})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary">
                {product.price.toLocaleString()} {isRTL ? 'افغانی' : 'AFN'}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <Check className="text-green-500" size={20} />
                  <span className="text-green-500 font-medium">{t.product.inStock}</span>
                </>
              ) : (
                <span className="text-red-500 font-medium">{t.product.outOfStock}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground">{product.description[language]}</p>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  className="p-3 hover:bg-muted transition-colors"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <Minus size={18} />
                </button>
                <span className="px-6 font-medium">{quantity}</span>
                <button
                  className="p-3 hover:bg-muted transition-colors"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus size={18} />
                </button>
              </div>
              <Button variant="cyan" size="lg" className="flex-1 gap-2">
                <ShoppingCart size={20} />
                {t.product.addToCart}
              </Button>
              <Button variant="outline" size="lg">
                <Heart size={20} />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 size={20} />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="text-primary" size={20} />
                <span>{t.footer.freeShipping}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="text-primary" size={20} />
                <span>{t.footer.securePayment}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="text-primary" size={20} />
                <span>{t.footer.easyReturns}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="text-primary" size={20} />
                <span>{t.footer.protected}</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="p-4 bg-muted/50 rounded-xl">
              <h4 className="font-medium mb-3">{t.product.sellerInfo}</h4>
              <div className="flex items-center gap-3">
                <img
                  src={product.seller.avatar}
                  alt={product.seller.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                />
                <div>
                  <p className="font-medium">{product.seller.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      {product.seller.rating}
                    </span>
                    <span>•</span>
                    <span>{product.seller.productCount} {isRTL ? 'محصول' : 'products'}</span>
                  </div>
                </div>
                <Link to={`/products?filter=seller&seller=${product.seller.id}`} className={isRTL ? 'mr-auto' : 'ml-auto'}>
                  <Button variant="outline" size="sm">
                    {isRTL ? 'مشاهده فروشگاه' : 'Visit Store'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              {t.product.description}
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              {t.product.specifications}
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              {t.product.reviews} ({product.reviewCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-6">
            <p className="text-muted-foreground leading-relaxed">{product.description[language]}</p>
          </TabsContent>

          <TabsContent value="specifications" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specifications.map((spec, idx) => (
                <div key={idx} className="flex justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">{spec.key}</span>
                  <span className="font-medium">{spec.value[language]}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="pt-6">
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{review.userName}</span>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">{t.product.relatedProducts}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug}`}
                  className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={p.images[0]}
                      alt={p.name[language]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-foreground line-clamp-2 mb-2">{p.name[language]}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">
                        {p.price.toLocaleString()} {isRTL ? 'افغانی' : 'AFN'}
                      </span>
                      {p.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {p.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;

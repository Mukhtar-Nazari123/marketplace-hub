import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StarRating } from '@/components/reviews/StarRating';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Star, 
  MessageSquare, 
  TrendingUp,
  Search,
  Package,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  product_id: string;
  buyer?: {
    full_name: string;
    avatar_url?: string;
  };
  product?: {
    name: string;
    slug: string;
    images: string[] | null;
  };
}

interface ProductStats {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  averageRating: number;
  reviewCount: number;
}

const SellerReviews = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReviews = async () => {
    if (!user) return;

    try {
      // Get all products by this seller
      const { data: products } = await supabase
        .from('products')
        .select('id, name, slug, images')
        .eq('seller_id', user.id);

      if (!products || products.length === 0) {
        setLoading(false);
        return;
      }

      const productIds = products.map(p => p.id);

      // Get all reviews for seller's products
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, product_id, buyer_id')
        .in('product_id', productIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch buyer profiles separately
      const buyerIds = [...new Set((reviewsData || []).map(r => r.buyer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', buyerIds);

      // Map reviews with product and buyer info
      const formattedReviews = (reviewsData || []).map((review: any) => {
        const product = products.find(p => p.id === review.product_id);
        const buyer = profiles?.find(p => p.user_id === review.buyer_id);
        return {
          ...review,
          buyer: buyer ? { full_name: buyer.full_name, avatar_url: buyer.avatar_url } : undefined,
          product: product ? {
            name: product.name,
            slug: product.slug,
            images: product.images,
          } : undefined,
        };
      });

      setReviews(formattedReviews);

      // Calculate per-product stats
      const stats: ProductStats[] = products.map(product => {
        const productReviews = formattedReviews.filter(r => r.product_id === product.id);
        const avgRating = productReviews.length > 0
          ? Math.round((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length) * 10) / 10
          : 0;
        
        return {
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImage: product.images?.[0] || null,
          averageRating: avgRating,
          reviewCount: productReviews.length,
        };
      }).filter(s => s.reviewCount > 0).sort((a, b) => b.reviewCount - a.reviewCount);

      setProductStats(stats);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const filteredReviews = reviews.filter(review =>
    review.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.buyer?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
    : 0;
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;

  if (loading) {
    return (
      <DashboardLayout
        title={isRTL ? 'نظرات محصولات' : 'Product Reviews'}
        description={isRTL ? 'مشاهده نظرات خریداران درباره محصولات شما' : 'View customer reviews about your products'}
        allowedRoles={['seller']}
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-12 w-12 rounded-full mb-4" />
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={isRTL ? 'نظرات محصولات' : 'Product Reviews'}
      description={isRTL ? 'مشاهده نظرات خریداران درباره محصولات شما' : 'View customer reviews about your products'}
      allowedRoles={['seller']}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalReviews}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'کل نظرات' : 'Total Reviews'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange/10 to-orange/5 border-orange/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-orange fill-orange" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{averageRating}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'میانگین امتیاز' : 'Average Rating'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{fiveStarCount}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'نظرات ۵ ستاره' : '5-Star Reviews'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Stats */}
        {productStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isRTL ? 'امتیاز محصولات' : 'Product Ratings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {productStats.slice(0, 6).map((stat) => (
                  <Link
                    key={stat.productId}
                    to={`/dashboard/seller/products/view/${stat.productId}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {stat.productImage ? (
                        <img
                          src={stat.productImage}
                          alt={stat.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{stat.productName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3 h-3 fill-orange text-orange" />
                        <span className="text-sm font-medium">{stat.averageRating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({stat.reviewCount} {isRTL ? 'نظر' : 'reviews'})
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Reviews List */}
        <Card>
          <CardHeader>
            <div className={cn("flex flex-col sm:flex-row gap-4 justify-between", isRTL && "sm:flex-row-reverse")}>
              <CardTitle className="text-lg">
                {isRTL ? 'همه نظرات' : 'All Reviews'}
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                  isRTL ? "right-3" : "left-3"
                )} />
                <Input
                  placeholder={isRTL ? 'جستجو...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(isRTL ? "pr-10" : "pl-10")}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? (isRTL ? 'نظری یافت نشد' : 'No reviews found')
                    : (isRTL ? 'هنوز نظری ثبت نشده' : 'No reviews yet')
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => {
                  const initials = review.buyer?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U";

                  return (
                    <div
                      key={review.id}
                      className={cn(
                        "flex gap-4 p-4 rounded-lg border bg-card",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {review.product?.images?.[0] ? (
                          <img
                            src={review.product.images[0]}
                            alt={review.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                        <div className={cn("flex items-start justify-between gap-2 mb-2", isRTL && "flex-row-reverse")}>
                          <div>
                            <p className="font-medium text-sm line-clamp-1">
                              {review.product?.name || (isRTL ? 'محصول' : 'Product')}
                            </p>
                            <div className={cn("flex items-center gap-2 mt-1", isRTL && "flex-row-reverse")}>
                              <Avatar className="w-5 h-5">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {review.buyer?.full_name || (isRTL ? 'خریدار' : 'Buyer')}
                              </span>
                            </div>
                          </div>
                          <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                            <Calendar className="w-3 h-3" />
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>

                        <StarRating rating={review.rating} readonly size="sm" />

                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SellerReviews;

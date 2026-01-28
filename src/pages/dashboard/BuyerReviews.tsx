import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/reviews/StarRating';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Star, 
  MessageSquare, 
  Edit, 
  Calendar,
  Package,
  ExternalLink
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  product_id: string;
  order_id: string;
  product?: {
    name: string;
    slug: string;
    images: string[] | null;
  };
}

const BuyerReviews = () => {
  const { isRTL, language } = useLanguage();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Helper for trilingual support
  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  const fetchReviews = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id, rating, comment, created_at, updated_at, product_id, order_id,
          products:product_id (name, slug, images)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReviews = (data || []).map((review: any) => ({
        ...review,
        product: review.products,
      }));

      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const canEditReview = (createdAt: string) => {
    const daysSinceCreation = differenceInDays(new Date(), new Date(createdAt));
    return daysSinceCreation <= 7;
  };

  const handleEditSuccess = () => {
    setEditingReview(null);
    fetchReviews();
  };

  const averageRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  if (loading) {
    return (
      <DashboardLayout
        title={getLabel('My Reviews', 'نظرات من', 'زما بیاکتنې')}
        description={getLabel('Manage your reviews and ratings', 'مدیریت نظرات و امتیازات شما', 'خپلې بیاکتنې او درجې اداره کړئ')}
        allowedRoles={['buyer']}
      >
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={getLabel('My Reviews', 'نظرات من', 'زما بیاکتنې')}
      description={getLabel('Manage your reviews and ratings', 'مدیریت نظرات و امتیازات شما', 'خپلې بیاکتنې او درجې اداره کړئ')}
      allowedRoles={['buyer']}
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
                  <p className="text-2xl font-bold">{reviews.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {getLabel('Total Reviews', 'کل نظرات', 'ټولې بیاکتنې')}
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
                    {getLabel('Average Rating', 'میانگین امتیاز', 'اوسط درجه')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Edit className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {reviews.filter(r => canEditReview(r.created_at)).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getLabel('Editable', 'قابل ویرایش', 'د سمون وړ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {getLabel('No reviews yet', 'هنوز نظری ثبت نکرده‌اید', 'تر اوسه بیاکتنه نشته')}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {getLabel(
                  'You can submit reviews after your orders are delivered.',
                  'پس از تحویل سفارش می‌توانید نظر خود را ثبت کنید.',
                  'تاسو کولی شئ وروسته له دې چې امرونه تحویل شي بیاکتنې ورکړئ.'
                )}
              </p>
              <Button asChild>
                <Link to="/dashboard/buyer/orders">
                  {getLabel('View Orders', 'مشاهده سفارشات', 'امرونه وګورئ')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const canEdit = canEditReview(review.created_at);
              const daysRemaining = 7 - differenceInDays(new Date(), new Date(review.created_at));

              return (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className={cn("flex gap-4", isRTL && "flex-row-reverse")}>
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {review.product?.images?.[0] ? (
                          <img
                            src={review.product.images[0]}
                            alt={review.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                        {/* Header */}
                        <div className={cn("flex items-start justify-between gap-2 mb-2", isRTL && "flex-row-reverse")}>
                          <div>
                            <Link
                              to={`/products/${review.product?.slug || review.product_id}`}
                              className="font-semibold hover:text-primary transition-colors line-clamp-1 flex items-center gap-1"
                            >
                              {review.product?.name || getLabel('Product', 'محصول', 'محصول')}
                              <ExternalLink className="w-3 h-3 opacity-50" />
                            </Link>
                            <div className={cn("flex items-center gap-2 mt-1", isRTL && "flex-row-reverse")}>
                              <StarRating rating={review.rating} readonly size="sm" />
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(review.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>

                          {/* Edit Button */}
                          <div className="flex items-center gap-2">
                            {canEdit ? (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  {getLabel(`${daysRemaining} days left`, `${daysRemaining} روز باقی`, `${daysRemaining} ورځې پاتې`)}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingReview(review)}
                                  className="gap-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  {getLabel('Edit', 'ویرایش', 'سمول')}
                                </Button>
                              </>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {getLabel('Locked', 'غیرقابل ویرایش', 'بندول شوی')}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Comment */}
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Review Dialog */}
      <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {getLabel('Edit Review', 'ویرایش نظر', 'بیاکتنه سمول')}
            </DialogTitle>
          </DialogHeader>
          {editingReview && (
            <ReviewForm
              productId={editingReview.product_id}
              orderId={editingReview.order_id}
              existingReview={{
                id: editingReview.id,
                rating: editingReview.rating,
                comment: editingReview.comment,
                created_at: editingReview.created_at,
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BuyerReviews;

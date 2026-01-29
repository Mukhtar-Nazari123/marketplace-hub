import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/reviews/StarRating';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Star, 
  MessageSquare, 
  Trash2,
  Search,
  Package,
  Calendar,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  product_id: string;
  buyer_id: string;
  buyer?: {
    full_name: string;
    avatar_url?: string;
    email: string;
  };
  product?: {
    name: string;
    seller_id: string;
  };
}

type Language = 'en' | 'fa' | 'ps';

const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

const AdminReviews = () => {
  const { t, isRTL, language } = useLanguage();
  const lang = language as Language;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = async () => {
    try {
      // Fetch reviews
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, product_id, buyer_id')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      // Fetch buyer profiles
      const buyerIds = [...new Set(reviewsData.map(r => r.buyer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, email')
        .in('user_id', buyerIds);

      const productIds = [...new Set(reviewsData.map(r => r.product_id))];
      const { data: products } = await supabase
        .from('products_with_translations')
        .select('id, name, seller_id')
        .in('id', productIds);

      const formattedReviews = reviewsData.map((review: any) => {
        const buyer = profiles?.find(p => p.user_id === review.buyer_id);
        const product = products?.find(p => p.id === review.product_id);
        return {
          ...review,
          buyer: buyer ? { full_name: buyer.full_name, avatar_url: buyer.avatar_url, email: buyer.email } : undefined,
          product: product ? { name: product.name, seller_id: product.seller_id } : undefined,
        };
      });

      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error(getLabel(lang, 'Error fetching reviews', 'خطا در دریافت نظرات', 'د نظرونو راوړلو کې تېروتنه'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async () => {
    if (!reviewToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewToDelete.id);

      if (error) throw error;

      setReviews(prev => prev.filter(r => r.id !== reviewToDelete.id));
      toast.success(getLabel(lang, 'Review deleted', 'نظر حذف شد', 'نظر حذف شو'));
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(getLabel(lang, 'Error deleting review', 'خطا در حذف نظر', 'د نظر په حذفولو کې تېروتنه'));
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.buyer?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    
    return matchesSearch && matchesRating;
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
    : 0;
  const lowRatingCount = reviews.filter(r => r.rating <= 2).length;

  if (loading) {
    return (
      <AdminLayout 
        title={getLabel(lang, 'Review Management', 'مدیریت نظرات', 'د نظرونو مدیریت')} 
        description={getLabel(lang, 'Monitor and manage user reviews', 'نظارت و مدیریت نظرات کاربران', 'د کاروونکو نظرونه وڅارئ او اداره کړئ')}
      >
        <div className="space-y-6">
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
      </AdminLayout>
    );
  }

  return (
      <AdminLayout 
        title={getLabel(lang, 'Review Management', 'مدیریت نظرات', 'د نظرونو مدیریت')} 
        description={getLabel(lang, 'Monitor and manage user reviews', 'نظارت و مدیریت نظرات کاربران', 'د کاروونکو نظرونه وڅارئ او اداره کړئ')}
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
                    {getLabel(lang, 'Total Reviews', 'کل نظرات', 'ټول نظرونه')}
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
                    {getLabel(lang, 'Average Rating', 'میانگین امتیاز', 'اوسط درجه')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lowRatingCount}</p>
                  <p className="text-sm text-muted-foreground">
                    {getLabel(lang, 'Low Ratings (1-2★)', 'نظرات کم امتیاز', 'ټیټ درجې (۱-۲★)')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Reviews List */}
        <Card>
          <CardHeader>
            <div className={cn("flex flex-col sm:flex-row gap-4 justify-between", isRTL && "sm:flex-row-reverse")}>
              <CardTitle className="text-lg">
                {getLabel(lang, 'All Reviews', 'همه نظرات', 'ټول نظرونه')}
              </CardTitle>
              <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
                <div className="relative w-full sm:w-64">
                  <Search className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                    isRTL ? "right-3" : "left-3"
                  )} />
                  <Input
                    placeholder={getLabel(lang, 'Search...', 'جستجو...', 'لټون...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(isRTL ? "pr-10" : "pl-10")}
                  />
                </div>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder={getLabel(lang, 'Rating', 'امتیاز', 'درجه')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{getLabel(lang, 'All', 'همه', 'ټول')}</SelectItem>
                    <SelectItem value="5">5 ★</SelectItem>
                    <SelectItem value="4">4 ★</SelectItem>
                    <SelectItem value="3">3 ★</SelectItem>
                    <SelectItem value="2">2 ★</SelectItem>
                    <SelectItem value="1">1 ★</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || ratingFilter !== 'all'
                    ? getLabel(lang, 'No reviews found', 'نظری یافت نشد', 'هیڅ نظر ونه موندل شو')
                    : getLabel(lang, 'No reviews yet', 'هنوز نظری ثبت نشده', 'تر اوسه هیڅ نظر نشته')
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
                        review.rating <= 2 && "border-destructive/30 bg-destructive/5",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      {/* Avatar */}
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                        <div className={cn("flex items-start justify-between gap-2", isRTL && "flex-row-reverse")}>
                          <div>
                            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                              <span className="font-medium text-sm">
                                {review.buyer?.full_name || getLabel(lang, 'User', 'کاربر', 'کاروونکی')}
                              </span>
                              {review.rating <= 2 && (
                                <Badge variant="destructive" className="text-xs">
                                  {getLabel(lang, 'Low Rating', 'کم امتیاز', 'ټیټه درجه')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {review.buyer?.email}
                            </p>
                          </div>
                          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(review.created_at), 'MMM d, yyyy')}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setReviewToDelete(review);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className={cn("flex items-center gap-2 mt-2", isRTL && "flex-row-reverse")}>
                          <Package className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {review.product?.name || getLabel(lang, 'Product', 'محصول', 'محصول')}
                          </span>
                        </div>

                        <div className="mt-2">
                          <StarRating rating={review.rating} readonly size="sm" />
                        </div>

                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {getLabel(lang, 'Delete Review', 'حذف نظر', 'نظر حذف کړئ')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getLabel(lang, 
                'Are you sure you want to delete this review? This action cannot be undone.',
                'آیا از حذف این نظر اطمینان دارید؟ این عمل قابل بازگشت نیست.',
                'ایا تاسو ډاډه یاست چې دا نظر حذف کړئ؟ دا عمل نشي بیرته راګرځیدلی.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRTL ? "flex-row-reverse gap-2" : ""}>
            <AlertDialogCancel disabled={isDeleting}>
              {getLabel(lang, 'Cancel', 'انصراف', 'لغوه')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting 
                ? getLabel(lang, 'Deleting...', 'در حال حذف...', 'حذفیږي...') 
                : getLabel(lang, 'Delete', 'حذف', 'حذف')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminReviews;

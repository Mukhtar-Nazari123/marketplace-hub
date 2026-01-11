import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  RefreshCw,
  Clock,
  Edit,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage, formatDate } from '@/lib/i18n';
import { getDealStatus, type DealStatus } from '@/hooks/useDealCountdown';

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  status: string;
  images: string[];
  is_deal: boolean;
  deal_start_at: string | null;
  deal_end_at: string | null;
}

const AdminDeals = () => {
  const { t, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [isDeal, setIsDeal] = useState(false);
  const [dealStartAt, setDealStartAt] = useState('');
  const [dealEndAt, setDealEndAt] = useState('');

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, currency, status, images, is_deal, deal_start_at, deal_end_at')
        .eq('status', 'active')
        .order('is_deal', { ascending: false })
        .order('deal_end_at', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(isRTL ? 'خطا در بارگذاری محصولات' : 'Error loading products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
    }
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const getDealStatusBadge = (product: Product) => {
    const status = getDealStatus(product.is_deal, product.deal_start_at, product.deal_end_at);
    
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">{isRTL ? 'فعال' : 'Active'}</Badge>;
      case 'upcoming':
        return <Badge className="bg-info text-info-foreground">{isRTL ? 'آینده' : 'Upcoming'}</Badge>;
      case 'expired':
        if (product.is_deal) {
          return <Badge className="bg-destructive text-destructive-foreground">{isRTL ? 'منقضی' : 'Expired'}</Badge>;
        }
        return <Badge variant="outline">{isRTL ? 'غیرفعال' : 'Inactive'}</Badge>;
      default:
        return <Badge variant="outline">{isRTL ? 'غیرفعال' : 'Inactive'}</Badge>;
    }
  };

  const formatLocalDateTime = (isoString: string | null): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Format for datetime-local input
    return date.toISOString().slice(0, 16);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeal(product.is_deal);
    setDealStartAt(formatLocalDateTime(product.deal_start_at));
    setDealEndAt(formatLocalDateTime(product.deal_end_at));
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedProduct) return;

    if (isDeal) {
      if (!dealStartAt || !dealEndAt) {
        toast.error(isRTL ? 'لطفا تاریخ شروع و پایان را وارد کنید' : 'Please enter start and end dates');
        return;
      }
      if (new Date(dealEndAt) <= new Date(dealStartAt)) {
        toast.error(isRTL ? 'تاریخ پایان باید بعد از تاریخ شروع باشد' : 'End date must be after start date');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_deal: isDeal,
          deal_start_at: isDeal ? new Date(dealStartAt).toISOString() : null,
          deal_end_at: isDeal ? new Date(dealEndAt).toISOString() : null,
        })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      toast.success(isRTL ? 'تنظیمات تخفیف با موفقیت ذخیره شد' : 'Deal settings saved successfully');
      setIsEditDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error(isRTL ? 'خطا در ذخیره تنظیمات' : 'Error saving settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickEnableDeal = async (product: Product) => {
    // Quick enable: 24 hours from now
    const now = new Date();
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_deal: true,
          deal_start_at: now.toISOString(),
          deal_end_at: endDate.toISOString(),
        })
        .eq('id', product.id);

      if (error) throw error;

      toast.success(isRTL ? 'تخفیف ۲۴ ساعته فعال شد' : '24-hour deal enabled');
      fetchProducts();
    } catch (error) {
      console.error('Error enabling deal:', error);
      toast.error(isRTL ? 'خطا در فعال‌سازی تخفیف' : 'Error enabling deal');
    }
  };

  const disableDeal = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_deal: false,
          deal_start_at: null,
          deal_end_at: null,
        })
        .eq('id', product.id);

      if (error) throw error;

      toast.success(isRTL ? 'تخفیف غیرفعال شد' : 'Deal disabled');
      fetchProducts();
    } catch (error) {
      console.error('Error disabling deal:', error);
      toast.error(isRTL ? 'خطا در غیرفعال‌سازی تخفیف' : 'Error disabling deal');
    }
  };

  const activeDealsCount = products.filter(p => {
    const status = getDealStatus(p.is_deal, p.deal_start_at, p.deal_end_at);
    return status === 'active';
  }).length;

  const upcomingDealsCount = products.filter(p => {
    const status = getDealStatus(p.is_deal, p.deal_start_at, p.deal_end_at);
    return status === 'upcoming';
  }).length;

  const searchIconClass = isRTL ? 'right-3' : 'left-3';
  const inputPaddingClass = isRTL ? 'pr-9' : 'pl-9';
  const iconMarginClass = isRTL ? 'ml-2' : 'mr-2';

  return (
    <AdminLayout 
      title={isRTL ? 'مدیریت تخفیف‌های روزانه' : 'Today\'s Deals Management'} 
      description={isRTL ? 'تنظیم تایمر تخفیف برای محصولات' : 'Configure countdown timers for deal products'}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isRTL ? 'تخفیف‌های فعال' : 'Active Deals'}
              </CardTitle>
              <Zap className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDealsCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isRTL ? 'تخفیف‌های آینده' : 'Upcoming Deals'}
              </CardTitle>
              <Clock className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingDealsCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isRTL ? 'کل محصولات فعال' : 'Total Active Products'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>{isRTL ? 'محصولات' : 'Products'}</CardTitle>
                <CardDescription>
                  {isRTL ? 'تنظیم تخفیف برای محصولات' : 'Configure deals for products'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchProducts} className="hover-scale">
                <RefreshCw className={`h-4 w-4 ${iconMarginClass}`} />
                {isRTL ? 'بروزرسانی' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative flex-1">
                <Search className={`absolute ${searchIconClass} top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground`} />
                <Input
                  placeholder={isRTL ? 'جستجوی محصول...' : 'Search products...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={inputPaddingClass}
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? 'محصول' : 'Product'}</TableHead>
                    <TableHead>{isRTL ? 'قیمت' : 'Price'}</TableHead>
                    <TableHead>{isRTL ? 'وضعیت تخفیف' : 'Deal Status'}</TableHead>
                    <TableHead>{isRTL ? 'شروع' : 'Start'}</TableHead>
                    <TableHead>{isRTL ? 'پایان' : 'End'}</TableHead>
                    <TableHead className={isRTL ? 'text-left' : 'text-right'}>{isRTL ? 'عملیات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-40 animate-pulse rounded bg-muted" /></TableCell>
                        <TableCell><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableCell>
                        <TableCell><div className="h-6 w-16 animate-pulse rounded bg-muted" /></TableCell>
                        <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                        <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                        <TableCell><div className="h-8 w-8 animate-pulse rounded bg-muted" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {isRTL ? 'محصولی یافت نشد' : 'No products found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.images?.[0] && (
                              <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            )}
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.currency === 'USD' ? '$' : ''}{product.price.toLocaleString()} {product.currency === 'AFN' ? 'AFN' : ''}
                        </TableCell>
                        <TableCell>{getDealStatusBadge(product)}</TableCell>
                        <TableCell>
                          {product.deal_start_at 
                            ? formatDate(new Date(product.deal_start_at), isRTL ? 'fa' : 'en')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {product.deal_end_at 
                            ? formatDate(new Date(product.deal_end_at), isRTL ? 'fa' : 'en')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className={`flex gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                            {!product.is_deal && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => quickEnableDeal(product)}
                              >
                                <Zap className={`h-4 w-4 ${iconMarginClass}`} />
                                {isRTL ? '۲۴ ساعته' : '24h Deal'}
                              </Button>
                            )}
                            {product.is_deal && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => disableDeal(product)}
                              >
                                {isRTL ? 'غیرفعال' : 'Disable'}
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'تنظیمات تخفیف' : 'Deal Settings'}</DialogTitle>
              <DialogDescription>
                {selectedProduct?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is-deal">{isRTL ? 'فعال کردن تخفیف' : 'Enable Deal'}</Label>
                <Switch
                  id="is-deal"
                  checked={isDeal}
                  onCheckedChange={setIsDeal}
                />
              </div>
              
              {isDeal && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="deal-start">{isRTL ? 'تاریخ و ساعت شروع' : 'Start Date & Time'}</Label>
                    <Input
                      id="deal-start"
                      type="datetime-local"
                      value={dealStartAt}
                      onChange={(e) => setDealStartAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deal-end">{isRTL ? 'تاریخ و ساعت پایان' : 'End Date & Time'}</Label>
                    <Input
                      id="deal-end"
                      type="datetime-local"
                      value={dealEndAt}
                      onChange={(e) => setDealEndAt(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                {isRTL ? 'انصراف' : 'Cancel'}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? (isRTL ? 'در حال ذخیره...' : 'Saving...') : (isRTL ? 'ذخیره' : 'Save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDeals;

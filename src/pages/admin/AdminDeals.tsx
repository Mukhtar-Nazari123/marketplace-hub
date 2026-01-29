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
import { useLanguage, formatDate, type Language } from '@/lib/i18n';
import { getDealStatus, type DealStatus } from '@/hooks/useDealCountdown';

interface Product {
  id: string;
  name: string;
  price_afn: number;
  status: string;
  images: string[];
  is_deal: boolean;
  deal_start_at: string | null;
  deal_end_at: string | null;
}

// Trilingual helper
const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

const AdminDeals = () => {
  const { t, direction, language } = useLanguage();
  const lang = language as Language;
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
        .from('products_with_translations')
        .select('id, name, price_afn, status, images, is_deal, deal_start_at, deal_end_at')
        .eq('status', 'active')
        .order('is_deal', { ascending: false })
        .order('deal_end_at', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setProducts((data || []).map(p => ({ ...p, name: p.name || 'Untitled' })) as Product[]);
      setFilteredProducts((data || []).map(p => ({ ...p, name: p.name || 'Untitled' })) as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(getLabel(lang, 'Error loading products', 'خطا در بارگذاری محصولات', 'د محصولاتو په پورته کولو کې تېروتنه'));
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
        return <Badge className="bg-success text-success-foreground">{getLabel(lang, 'Active', 'فعال', 'فعال')}</Badge>;
      case 'upcoming':
        return <Badge className="bg-info text-info-foreground">{getLabel(lang, 'Upcoming', 'آینده', 'راتلونکی')}</Badge>;
      case 'expired':
        if (product.is_deal) {
          return <Badge className="bg-destructive text-destructive-foreground">{getLabel(lang, 'Expired', 'منقضی', 'پای ته رسېدلی')}</Badge>;
        }
        return <Badge variant="outline">{getLabel(lang, 'Inactive', 'غیرفعال', 'غیر فعال')}</Badge>;
      default:
        return <Badge variant="outline">{getLabel(lang, 'Inactive', 'غیرفعال', 'غیر فعال')}</Badge>;
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
        toast.error(getLabel(lang, 'Please enter start and end dates', 'لطفا تاریخ شروع و پایان را وارد کنید', 'مهرباني وکړئ د پیل او پای نیټې ولیکئ'));
        return;
      }
      if (new Date(dealEndAt) <= new Date(dealStartAt)) {
        toast.error(getLabel(lang, 'End date must be after start date', 'تاریخ پایان باید بعد از تاریخ شروع باشد', 'د پای نیټه باید د پیل نیټې وروسته وي'));
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

      toast.success(getLabel(lang, 'Deal settings saved successfully', 'تنظیمات تخفیف با موفقیت ذخیره شد', 'د تخفیف ترتیبات په بریالیتوب سره خوندي شوې'));
      setIsEditDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error(getLabel(lang, 'Error saving settings', 'خطا در ذخیره تنظیمات', 'د ترتیباتو په خوندي کولو کې تېروتنه'));
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

      toast.success(getLabel(lang, '24-hour deal enabled', 'تخفیف ۲۴ ساعته فعال شد', 'د ۲۴ ساعتو تخفیف فعال شو'));
      fetchProducts();
    } catch (error) {
      console.error('Error enabling deal:', error);
      toast.error(getLabel(lang, 'Error enabling deal', 'خطا در فعال‌سازی تخفیف', 'د تخفیف په فعالولو کې تېروتنه'));
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

      toast.success(getLabel(lang, 'Deal disabled', 'تخفیف غیرفعال شد', 'تخفیف غیر فعال شو'));
      fetchProducts();
    } catch (error) {
      console.error('Error disabling deal:', error);
      toast.error(getLabel(lang, 'Error disabling deal', 'خطا در غیرفعال‌سازی تخفیف', 'د تخفیف په غیر فعالولو کې تېروتنه'));
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
      title={getLabel(lang, "Today's Deals Management", 'مدیریت تخفیف‌های روزانه', 'د ورځني تخفیفونو مدیریت')} 
      description={getLabel(lang, 'Configure countdown timers for deal products', 'تنظیم تایمر تخفیف برای محصولات', 'د تخفیف محصولاتو لپاره شمېرنه ترتیب کړئ')}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {getLabel(lang, 'Active Deals', 'تخفیف‌های فعال', 'فعال تخفیفونه')}
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
                {getLabel(lang, 'Upcoming Deals', 'تخفیف‌های آینده', 'راتلونکي تخفیفونه')}
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
                {getLabel(lang, 'Total Active Products', 'کل محصولات فعال', 'ټول فعال محصولات')}
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
                <CardTitle>{getLabel(lang, 'Products', 'محصولات', 'محصولات')}</CardTitle>
                <CardDescription>
                  {getLabel(lang, 'Configure deals for products', 'تنظیم تخفیف برای محصولات', 'د محصولاتو لپاره تخفیف ترتیب کړئ')}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchProducts} className="hover-scale">
                <RefreshCw className={`h-4 w-4 ${iconMarginClass}`} />
                {getLabel(lang, 'Refresh', 'بروزرسانی', 'تازه کول')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative flex-1">
                <Search className={`absolute ${searchIconClass} top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground`} />
                <Input
                  placeholder={getLabel(lang, 'Search products...', 'جستجوی محصول...', 'محصول وپلټئ...')}
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
                    <TableHead>{getLabel(lang, 'Product', 'محصول', 'محصول')}</TableHead>
                    <TableHead>{getLabel(lang, 'Price', 'قیمت', 'بیه')}</TableHead>
                    <TableHead>{getLabel(lang, 'Deal Status', 'وضعیت تخفیف', 'د تخفیف حالت')}</TableHead>
                    <TableHead>{getLabel(lang, 'Start', 'شروع', 'پیل')}</TableHead>
                    <TableHead>{getLabel(lang, 'End', 'پایان', 'پای')}</TableHead>
                    <TableHead className={isRTL ? 'text-left' : 'text-right'}>{getLabel(lang, 'Actions', 'عملیات', 'عملیات')}</TableHead>
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
                        {getLabel(lang, 'No products found', 'محصولی یافت نشد', 'هیڅ محصول ونه موندل شو')}
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
                          {product.price_afn.toLocaleString()} AFN
                        </TableCell>
                        <TableCell>{getDealStatusBadge(product)}</TableCell>
                        <TableCell>
                          {product.deal_start_at 
                            ? formatDate(new Date(product.deal_start_at), lang)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {product.deal_end_at 
                            ? formatDate(new Date(product.deal_end_at), lang)
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
                                {getLabel(lang, '24h Deal', '۲۴ ساعته', 'د ۲۴ ساعتو')}
                              </Button>
                            )}
                            {product.is_deal && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => disableDeal(product)}
                              >
                                {getLabel(lang, 'Disable', 'غیرفعال', 'غیر فعال')}
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
              <DialogTitle>{getLabel(lang, 'Deal Settings', 'تنظیمات تخفیف', 'د تخفیف ترتیبات')}</DialogTitle>
              <DialogDescription>
                {selectedProduct?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is-deal">{getLabel(lang, 'Enable Deal', 'فعال کردن تخفیف', 'تخفیف فعالول')}</Label>
                <Switch
                  id="is-deal"
                  checked={isDeal}
                  onCheckedChange={setIsDeal}
                />
              </div>
              
              {isDeal && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="deal-start">{getLabel(lang, 'Start Date & Time', 'تاریخ و ساعت شروع', 'د پیل نیټه او وخت')}</Label>
                    <Input
                      id="deal-start"
                      type="datetime-local"
                      value={dealStartAt}
                      onChange={(e) => setDealStartAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deal-end">{getLabel(lang, 'End Date & Time', 'تاریخ و ساعت پایان', 'د پای نیټه او وخت')}</Label>
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
                {getLabel(lang, 'Cancel', 'انصراف', 'لغوه کول')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? getLabel(lang, 'Saving...', 'در حال ذخیره...', 'خوندي کیږي...') 
                  : getLabel(lang, 'Save', 'ذخیره', 'خوندي کول')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDeals;

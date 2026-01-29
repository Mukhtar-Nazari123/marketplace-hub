import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage, formatDate, formatCurrency } from '@/lib/i18n';

interface Product {
  id: string;
  name: string;
  slug: string;
  price_afn: number;
  compare_price_afn: number | null;
  status: string;
  seller_id: string;
  category_id: string | null;
  images: string[];
  created_at: string;
  rejection_reason: string | null;
}

const getCurrencySymbol = (): string => {
  return '؋';
};

const formatPriceWithCurrency = (price: number, isRTL: boolean): string => {
  const symbol = getCurrencySymbol();
  const formattedPrice = price.toLocaleString(isRTL ? 'fa-IR' : 'en-US');
  return isRTL ? `${formattedPrice} ${symbol}` : `AFN ${formattedPrice}`;
};

const AdminProducts = () => {
  const { t, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products_with_translations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData = (data || []).map(p => ({ ...p, name: p.name || 'Untitled', description: p.description || '' })) as Product[];
      setProducts(mappedData);
      setFilteredProducts(mappedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(t.admin.products.loadError);
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

    if (statusFilter !== 'all') {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, statusFilter, products]);

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground">{t.admin.products.statuses.active}</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">{t.admin.products.statuses.pending}</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground">{t.admin.products.statuses.rejected}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{t.admin.products.statuses.draft}</Badge>;
      case 'archived':
        return <Badge variant="outline">{t.admin.products.statuses.archived}</Badge>;
      default:
        return null;
    }
  };

  const handleApprove = async (productId: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'active' })
        .eq('id', productId);

      if (error) throw error;

      toast.success(t.admin.products.approveSuccess);
      fetchProducts();
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error(t.admin.products.approveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProduct || !rejectionReason.trim()) {
      toast.error(t.admin.products.enterRejectionReason);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedProduct.id);

      if (error) throw error;

      toast.success(t.admin.products.rejectSuccess);
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast.error(t.admin.products.rejectError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct.id);

      if (error) throw error;

      toast.success(isRTL ? 'محصول با موفقیت حذف شد' : 'Product deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(isRTL ? 'خطا در حذف محصول' : 'Error deleting product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const searchIconClass = isRTL ? 'right-3' : 'left-3';
  const inputPaddingClass = isRTL ? 'pr-9' : 'pl-9';
  const iconMarginClass = isRTL ? 'ml-2' : 'mr-2';

  return (
    <AdminLayout title={t.admin.products.title} description={t.admin.products.description}>
      <div className="space-y-6 animate-fade-in">
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>{t.admin.products.productsTitle}</CardTitle>
                <CardDescription>
                  {t.admin.products.totalProducts.replace('{count}', String(filteredProducts.length))}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchProducts} className="hover-scale">
                <RefreshCw className={`h-4 w-4 ${iconMarginClass}`} />
                {t.admin.products.refresh}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className={`absolute ${searchIconClass} top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground`} />
                <Input
                  placeholder={t.admin.products.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={inputPaddingClass}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className={`h-4 w-4 ${iconMarginClass}`} />
                  <SelectValue placeholder={t.admin.products.filterByStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.admin.products.allStatuses}</SelectItem>
                  <SelectItem value="pending">{t.admin.products.statuses.pending}</SelectItem>
                  <SelectItem value="active">{t.admin.products.statuses.active}</SelectItem>
                  <SelectItem value="rejected">{t.admin.products.statuses.rejected}</SelectItem>
                  <SelectItem value="draft">{t.admin.products.statuses.draft}</SelectItem>
                  <SelectItem value="archived">{t.admin.products.statuses.archived}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.admin.products.product}</TableHead>
                    <TableHead>{t.admin.products.price}</TableHead>
                    <TableHead>{t.admin.products.status}</TableHead>
                    <TableHead>{t.admin.products.addedDate}</TableHead>
                    <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t.admin.products.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                        </TableCell>
                        <TableCell>
                          <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {t.admin.products.noProducts}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="font-medium">{product.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {product.compare_price_afn && product.compare_price_afn > product.price_afn ? (
                              <>
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatPriceWithCurrency(Number(product.compare_price_afn), isRTL)}
                                </span>
                                <span className="font-semibold text-amber-500">
                                  {formatPriceWithCurrency(Number(product.price_afn), isRTL)}
                                </span>
                              </>
                            ) : (
                              <span className="font-medium">{formatPriceWithCurrency(Number(product.price_afn), isRTL)}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell>
                          {formatDate(new Date(product.created_at), direction === 'rtl' ? 'fa' : 'en')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                              <DropdownMenuLabel>{t.admin.products.actions}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => navigate(`/admin/products/${product.id}`)}>
                                <Eye className={`h-4 w-4 ${iconMarginClass}`} />
                                {t.admin.products.viewDetails}
                              </DropdownMenuItem>
                              {product.status === 'pending' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleApprove(product.id)}
                                    className="text-success"
                                  >
                                    <CheckCircle className={`h-4 w-4 ${iconMarginClass}`} />
                                    {t.admin.products.approve}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setIsRejectDialogOpen(true);
                                    }}
                                    className="text-destructive"
                                  >
                                    <XCircle className={`h-4 w-4 ${iconMarginClass}`} />
                                    {t.admin.products.reject}
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className={`h-4 w-4 ${iconMarginClass}`} />
                                {isRTL ? 'حذف' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.admin.products.rejectProduct}</DialogTitle>
              <DialogDescription>
                {t.admin.products.enterRejectionReason}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder={t.admin.products.rejectionReasonPlaceholder}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectDialogOpen(false);
                  setRejectionReason('');
                }}
              >
                {t.admin.products.cancel}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isSubmitting || !rejectionReason.trim()}
              >
                {isSubmitting ? t.admin.products.rejecting : t.admin.products.rejectProduct}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'حذف محصول' : 'Delete Product'}</DialogTitle>
              <DialogDescription>
                {isRTL
                  ? `آیا مطمئن هستید که می‌خواهید "${selectedProduct?.name}" را حذف کنید؟ این عمل قابل بازگشت نیست.`
                  : `Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedProduct(null);
                }}
              >
                {isRTL ? 'انصراف' : 'Cancel'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? (isRTL ? 'در حال حذف...' : 'Deleting...') : (isRTL ? 'حذف' : 'Delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;

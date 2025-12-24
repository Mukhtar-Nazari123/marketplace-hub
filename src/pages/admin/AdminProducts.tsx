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
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  status: string;
  seller_id: string;
  category_id: string | null;
  images: string[];
  created_at: string;
  rejection_reason: string | null;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('فشل في تحميل المنتجات');
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
        return <Badge className="bg-success text-success-foreground">نشط</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">قيد المراجعة</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground">مرفوض</Badge>;
      case 'draft':
        return <Badge variant="secondary">مسودة</Badge>;
      case 'archived':
        return <Badge variant="outline">أرشيف</Badge>;
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

      toast.success('تمت الموافقة على المنتج');
      fetchProducts();
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error('فشل في الموافقة على المنتج');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProduct || !rejectionReason.trim()) {
      toast.error('يرجى إدخال سبب الرفض');
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

      toast.success('تم رفض المنتج');
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast.error('فشل في رفض المنتج');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="إدارة المنتجات" description="مراجعة وإدارة جميع المنتجات">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>المنتجات</CardTitle>
                <CardDescription>
                  إجمالي {filteredProducts.length} منتج
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchProducts}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="البحث بالاسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="archived">أرشيف</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإضافة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
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
                        لا يوجد منتجات
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="font-medium">{product.name}</div>
                        </TableCell>
                        <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell>
                          {format(new Date(product.created_at), 'dd MMM yyyy', {
                            locale: ar,
                          })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              {product.status === 'pending' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleApprove(product.id)}
                                    className="text-success"
                                  >
                                    <CheckCircle className="ml-2 h-4 w-4" />
                                    الموافقة
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setIsRejectDialogOpen(true);
                                    }}
                                    className="text-destructive"
                                  >
                                    <XCircle className="ml-2 h-4 w-4" />
                                    رفض
                                  </DropdownMenuItem>
                                </>
                              )}
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
              <DialogTitle>رفض المنتج</DialogTitle>
              <DialogDescription>
                يرجى إدخال سبب رفض المنتج
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="سبب الرفض..."
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
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isSubmitting || !rejectionReason.trim()}
              >
                {isSubmitting ? 'جاري الرفض...' : 'رفض المنتج'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;

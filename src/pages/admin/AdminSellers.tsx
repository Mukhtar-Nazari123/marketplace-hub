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
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

interface SellerVerification {
  id: string;
  seller_id: string;
  business_name: string | null;
  business_type: string | null;
  phone: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
}

const AdminSellers = () => {
  const [verifications, setVerifications] = useState<SellerVerification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<SellerVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<SellerVerification | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('seller_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVerifications(data || []);
      setFilteredVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('فشل في تحميل طلبات التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  useEffect(() => {
    let filtered = [...verifications];

    if (searchQuery) {
      filtered = filtered.filter(
        (v) =>
          v.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.phone?.includes(searchQuery)
      );
    }

    setFilteredVerifications(filtered);
  }, [searchQuery, verifications]);

  const getStatusBadge = (status: SellerVerification['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground">موافق عليه</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">قيد المراجعة</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground">مرفوض</Badge>;
      case 'suspended':
        return <Badge variant="outline">معلق</Badge>;
      default:
        return null;
    }
  };

  const handleApprove = async (id: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('seller_verifications')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success('تمت الموافقة على البائع');
      fetchVerifications();
    } catch (error) {
      console.error('Error approving seller:', error);
      toast.error('فشل في الموافقة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !rejectionReason.trim()) {
      toast.error('يرجى إدخال سبب الرفض');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('seller_verifications')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedVerification.id);

      if (error) throw error;

      toast.success('تم رفض طلب البائع');
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedVerification(null);
      fetchVerifications();
    } catch (error) {
      console.error('Error rejecting seller:', error);
      toast.error('فشل في الرفض');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="التحقق من البائعين" description="مراجعة طلبات التحقق من البائعين">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>طلبات التحقق</CardTitle>
                <CardDescription>
                  إجمالي {filteredVerifications.length} طلب
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchVerifications}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-sm">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="البحث باسم الشركة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الشركة</TableHead>
                    <TableHead>نوع النشاط</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredVerifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        لا يوجد طلبات تحقق
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVerifications.map((verification) => (
                      <TableRow key={verification.id}>
                        <TableCell className="font-medium">
                          {verification.business_name || 'غير محدد'}
                        </TableCell>
                        <TableCell>{verification.business_type || '-'}</TableCell>
                        <TableCell>{verification.phone || '-'}</TableCell>
                        <TableCell>{getStatusBadge(verification.status)}</TableCell>
                        <TableCell>
                          {format(new Date(verification.created_at), 'dd MMM yyyy', {
                            locale: ar,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {verification.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-success hover:text-success"
                                  onClick={() => handleApprove(verification.id)}
                                  disabled={isSubmitting}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setSelectedVerification(verification);
                                    setIsRejectDialogOpen(true);
                                  }}
                                  disabled={isSubmitting}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
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

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>رفض طلب التحقق</DialogTitle>
              <DialogDescription>
                يرجى إدخال سبب رفض طلب التحقق
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
                {isSubmitting ? 'جاري الرفض...' : 'رفض الطلب'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSellers;

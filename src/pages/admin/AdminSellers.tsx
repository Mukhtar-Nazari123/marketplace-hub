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
import { toast } from 'sonner';
import { useLanguage, formatDate } from '@/lib/i18n';

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
  const { t, direction } = useLanguage();
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
      toast.error(t.admin.sellers.loadError);
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
        return <Badge className="bg-success text-success-foreground">{t.admin.sellers.statuses.approved}</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">{t.admin.sellers.statuses.pending}</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground">{t.admin.sellers.statuses.rejected}</Badge>;
      case 'suspended':
        return <Badge variant="outline">{t.admin.sellers.statuses.suspended}</Badge>;
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

      toast.success(t.admin.sellers.approveSuccess);
      fetchVerifications();
    } catch (error) {
      console.error('Error approving seller:', error);
      toast.error(t.admin.sellers.approveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification || !rejectionReason.trim()) {
      toast.error(t.admin.sellers.enterRejectionReason);
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

      toast.success(t.admin.sellers.rejectSuccess);
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedVerification(null);
      fetchVerifications();
    } catch (error) {
      console.error('Error rejecting seller:', error);
      toast.error(t.admin.sellers.rejectError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRTL = direction === 'rtl';
  const searchIconClass = isRTL ? 'right-3' : 'left-3';
  const inputPaddingClass = isRTL ? 'pr-9' : 'pl-9';

  return (
    <AdminLayout title={t.admin.sellers.title} description={t.admin.sellers.description}>
      <div className="space-y-6 animate-fade-in">
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>{t.admin.sellers.verificationsTitle}</CardTitle>
                <CardDescription>
                  {t.admin.sellers.totalRequests.replace('{count}', String(filteredVerifications.length))}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchVerifications} className="hover-scale">
                <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t.admin.sellers.refresh}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-sm">
                <Search className={`absolute ${searchIconClass} top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground`} />
                <Input
                  placeholder={t.admin.sellers.searchPlaceholder}
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
                    <TableHead>{t.admin.sellers.companyName}</TableHead>
                    <TableHead>{t.admin.sellers.businessType}</TableHead>
                    <TableHead>{t.admin.sellers.phone}</TableHead>
                    <TableHead>{t.admin.sellers.status}</TableHead>
                    <TableHead>{t.admin.sellers.date}</TableHead>
                    <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t.admin.sellers.actions}</TableHead>
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
                        {t.admin.sellers.noVerifications}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVerifications.map((verification) => (
                      <TableRow key={verification.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          {verification.business_name || t.admin.sellers.unspecified}
                        </TableCell>
                        <TableCell>{verification.business_type || '-'}</TableCell>
                        <TableCell>{verification.phone || '-'}</TableCell>
                        <TableCell>{getStatusBadge(verification.status)}</TableCell>
                        <TableCell>
                          {formatDate(new Date(verification.created_at), direction === 'rtl' ? 'fa' : 'en')}
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
              <DialogTitle>{t.admin.sellers.rejectVerification}</DialogTitle>
              <DialogDescription>
                {t.admin.sellers.enterRejectionReason}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder={t.admin.sellers.rejectionReasonPlaceholder}
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
                {t.admin.sellers.cancel}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isSubmitting || !rejectionReason.trim()}
              >
                {isSubmitting ? t.admin.sellers.rejecting : t.admin.sellers.rejectRequest}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminSellers;

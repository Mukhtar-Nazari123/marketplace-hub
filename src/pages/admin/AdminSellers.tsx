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

interface SellerData {
  user_id: string;
  full_name: string;
  email: string;
  created_at: string;
  verification_id: string | null;
  business_name: string | null;
  business_type: string | null;
  phone: string | null;
  status: string;
  rejection_reason: string | null;
}

const AdminSellers = () => {
  const { t, direction } = useLanguage();
  const [sellers, setSellers] = useState<SellerData[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<SellerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<SellerData | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSellers = async () => {
    setIsLoading(true);
    try {
      // Get all sellers from user_roles
      const { data: sellerRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, created_at')
        .eq('role', 'seller');

      if (rolesError) throw rolesError;

      if (!sellerRoles || sellerRoles.length === 0) {
        setSellers([]);
        setFilteredSellers([]);
        setIsLoading(false);
        return;
      }

      const userIds = sellerRoles.map(r => r.user_id);

      // Get profiles for these sellers
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Get verifications for these sellers
      const { data: verifications, error: verificationsError } = await supabase
        .from('seller_verifications')
        .select('*')
        .in('seller_id', userIds);

      if (verificationsError) throw verificationsError;

      // Combine the data
      const combinedData: SellerData[] = sellerRoles.map(role => {
        const profile = profiles?.find(p => p.user_id === role.user_id);
        const verification = verifications?.find(v => v.seller_id === role.user_id);

        return {
          user_id: role.user_id,
          full_name: profile?.full_name || 'Unknown',
          email: profile?.email || 'Unknown',
          created_at: role.created_at,
          verification_id: verification?.id || null,
          business_name: verification?.business_name || null,
          business_type: verification?.business_type || null,
          phone: verification?.phone || null,
          status: verification?.status || 'pending',
          rejection_reason: verification?.rejection_reason || null,
        };
      });

      setSellers(combinedData);
      setFilteredSellers(combinedData);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast.error(t.admin.sellers.loadError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    let filtered = [...sellers];

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.phone?.includes(searchQuery)
      );
    }

    setFilteredSellers(filtered);
  }, [searchQuery, sellers]);

  const getStatusBadge = (status: string) => {
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
        return <Badge className="bg-warning text-warning-foreground">{t.admin.sellers.statuses.pending}</Badge>;
    }
  };

  const handleApprove = async (seller: SellerData) => {
    setIsSubmitting(true);
    try {
      if (seller.verification_id) {
        // Update existing verification
        const { error } = await supabase
          .from('seller_verifications')
          .update({ status: 'approved', reviewed_at: new Date().toISOString() })
          .eq('id', seller.verification_id);

        if (error) throw error;
      } else {
        // Create new verification record with approved status
        const { error } = await supabase
          .from('seller_verifications')
          .insert({ 
            seller_id: seller.user_id, 
            status: 'approved',
            reviewed_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast.success(t.admin.sellers.approveSuccess);
      fetchSellers();
    } catch (error) {
      console.error('Error approving seller:', error);
      toast.error(t.admin.sellers.approveError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSeller || !rejectionReason.trim()) {
      toast.error(t.admin.sellers.enterRejectionReason);
      return;
    }

    setIsSubmitting(true);
    try {
      if (selectedSeller.verification_id) {
        // Update existing verification
        const { error } = await supabase
          .from('seller_verifications')
          .update({
            status: 'rejected',
            rejection_reason: rejectionReason,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', selectedSeller.verification_id);

        if (error) throw error;
      } else {
        // Create new verification record with rejected status
        const { error } = await supabase
          .from('seller_verifications')
          .insert({ 
            seller_id: selectedSeller.user_id, 
            status: 'rejected',
            rejection_reason: rejectionReason,
            reviewed_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast.success(t.admin.sellers.rejectSuccess);
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedSeller(null);
      fetchSellers();
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
                  {t.admin.sellers.totalRequests.replace('{count}', String(filteredSellers.length))}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchSellers} className="hover-scale">
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
                    <TableHead>{isRTL ? 'نام' : 'Name'}</TableHead>
                    <TableHead>{isRTL ? 'ایمیل' : 'Email'}</TableHead>
                    <TableHead>{t.admin.sellers.companyName}</TableHead>
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
                  ) : filteredSellers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {t.admin.sellers.noVerifications}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSellers.map((seller) => (
                      <TableRow key={seller.user_id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          {seller.full_name}
                        </TableCell>
                        <TableCell>{seller.email}</TableCell>
                        <TableCell>{seller.business_name || t.admin.sellers.unspecified}</TableCell>
                        <TableCell>{getStatusBadge(seller.status)}</TableCell>
                        <TableCell>
                          {formatDate(new Date(seller.created_at), direction === 'rtl' ? 'fa' : 'en')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {seller.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-success hover:text-success"
                                  onClick={() => handleApprove(seller)}
                                  disabled={isSubmitting}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setSelectedSeller(seller);
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
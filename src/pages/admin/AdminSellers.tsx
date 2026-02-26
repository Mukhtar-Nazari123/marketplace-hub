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
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Truck,
  RotateCcw,
  Image,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage, formatDate } from '@/lib/i18n';

interface SellerVerificationData {
  id: string;
  seller_id: string;
  status: string;
  business_name: string | null;
  business_type: string | null;
  business_description: string | null;
  phone: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  store_logo: string | null;
  store_banner: string | null;
  shipping_policy: string | null;
  return_policy: string | null;
  store_visible: boolean | null;
  address: any;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface SellerData {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  verification: SellerVerificationData | null;
}

type Language = 'en' | 'fa' | 'ps';

const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

const AdminSellers = () => {
  const { t, direction, isRTL, language } = useLanguage();
  const lang = language as Language;
  const [sellers, setSellers] = useState<SellerData[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<SellerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<SellerData | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
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
        .select('user_id, full_name, email, avatar_url')
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
          avatar_url: profile?.avatar_url || null,
          created_at: role.created_at,
          verification: verification || null,
        };
      });

      // Sort by newest first
      combinedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
          s.verification?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.verification?.phone?.includes(searchQuery)
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
      if (seller.verification?.id) {
        const { error } = await supabase
          .from('seller_verifications')
          .update({ status: 'approved', reviewed_at: new Date().toISOString() })
          .eq('id', seller.verification.id);

        if (error) throw error;
      } else {
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
      setIsViewDialogOpen(false);
      setSelectedSeller(null);
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
      if (selectedSeller.verification?.id) {
        const { error } = await supabase
          .from('seller_verifications')
          .update({
            status: 'rejected',
            rejection_reason: rejectionReason,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', selectedSeller.verification.id);

        if (error) throw error;
      } else {
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
      setIsViewDialogOpen(false);
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

  const handleViewSeller = (seller: SellerData) => {
    setSelectedSeller(seller);
    setIsViewDialogOpen(true);
  };

  const searchIconClass = isRTL ? 'right-3' : 'left-3';
  const inputPaddingClass = isRTL ? 'pr-9' : 'pl-9';
  const iconMargin = isRTL ? 'ml-2' : 'mr-2';

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value || getLabel(lang, 'Not specified', 'مشخص نشده', 'مشخص شوی نه دی')}</p>
      </div>
    </div>
  );

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
                <RefreshCw className={`h-4 w-4 ${iconMargin}`} />
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
                    <TableHead>{getLabel(lang, 'Name', 'نام', 'نوم')}</TableHead>
                    <TableHead>{getLabel(lang, 'Email', 'ایمیل', 'بریښنالیک')}</TableHead>
                    <TableHead>{getLabel(lang, 'Company Name', 'نام شرکت', 'د شرکت نوم')}</TableHead>
                    <TableHead>{getLabel(lang, 'Status', 'وضعیت', 'حالت')}</TableHead>
                    <TableHead>{getLabel(lang, 'Date', 'تاریخ', 'نیټه')}</TableHead>
                    <TableHead className={isRTL ? 'text-left' : 'text-right'}>{getLabel(lang, 'Actions', 'عملیات', 'کړنې')}</TableHead>
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
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={seller.avatar_url || ''} />
                              <AvatarFallback>{seller.full_name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {seller.full_name}
                          </div>
                        </TableCell>
                        <TableCell>{seller.email}</TableCell>
                        <TableCell>{seller.verification?.business_name || t.admin.sellers.unspecified}</TableCell>
                        <TableCell>{getStatusBadge(seller.verification?.status || 'pending')}</TableCell>
                        <TableCell>
                          {formatDate(new Date(seller.created_at), direction === 'rtl' ? 'fa' : 'en')}
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                            {seller.verification?.status === 'pending' && (
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
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewSeller(seller)}
                            >
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

        {/* View Seller Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh]" dir={isRTL ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                {getLabel(lang, 'Seller Details', 'جزئیات فروشنده', 'د پلورونکي توضیحات')}
              </DialogTitle>
              <DialogDescription>
                {getLabel(lang, 'View complete seller information', 'مشاهده اطلاعات کامل فروشنده', 'د پلورونکي بشپړ معلومات وګورئ')}
              </DialogDescription>
            </DialogHeader>
            
            {selectedSeller && (
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-6">
                   {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {getLabel(lang, 'Status:', 'وضعیت:', 'حالت:')}
                    </span>
                    {getStatusBadge(selectedSeller.verification?.status || 'pending')}
                  </div>

                  {/* Personal Information */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {getLabel(lang, 'Personal Information', 'اطلاعات شخصی', 'شخصي معلومات')}
                    </h4>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={selectedSeller.avatar_url || ''} />
                            <AvatarFallback className="text-lg">
                              {selectedSeller.full_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold">{selectedSeller.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{selectedSeller.email}</p>
                          </div>
                        </div>
                        <InfoRow icon={Phone} label={getLabel(lang, 'Phone', 'تلفن', 'تلیفون')} value={selectedSeller.verification?.phone} />
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  {/* Store / Company Details */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {getLabel(lang, 'Store / Company Details', 'اطلاعات فروشگاه / شرکت', 'د پلورنځي / شرکت توضیحات')}
                    </h4>
                    <Card>
                      <CardContent className="pt-4 space-y-2">
                        <InfoRow icon={Store} label={getLabel(lang, 'Store Name', 'نام فروشگاه', 'د پلورنځي نوم')} value={selectedSeller.verification?.business_name} />
                        <InfoRow icon={Building2} label={getLabel(lang, 'Business Type', 'نوع کسب‌وکار', 'د سوداګرۍ ډول')} value={selectedSeller.verification?.business_type} />
                        <InfoRow icon={FileText} label={getLabel(lang, 'Business Description', 'توضیحات کسب‌وکار', 'د سوداګرۍ توضیحات')} value={selectedSeller.verification?.business_description} />
                        <InfoRow icon={Mail} label={getLabel(lang, 'Contact Email', 'ایمیل تماس', 'د اړیکې بریښنالیک')} value={selectedSeller.verification?.contact_email} />
                        <InfoRow icon={Phone} label={getLabel(lang, 'Contact Phone', 'تلفن تماس', 'د اړیکې تلیفون')} value={selectedSeller.verification?.contact_phone} />
                        <InfoRow 
                          icon={MapPin} 
                          label={getLabel(lang, 'Address', 'آدرس', 'پته')} 
                          value={selectedSeller.verification?.address 
                            ? (typeof selectedSeller.verification.address === 'object' 
                              ? JSON.stringify(selectedSeller.verification.address) 
                              : selectedSeller.verification.address)
                            : null
                          } 
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Store Logo and Banner */}
                  {(selectedSeller.verification?.store_logo || selectedSeller.verification?.store_banner) && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          {getLabel(lang, 'Logo & Banner', 'لوگو و بنر', 'لوګو او بینر')}
                        </h4>
                        <Card>
                          <CardContent className="pt-4 space-y-4">
                            {selectedSeller.verification?.store_logo && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">{getLabel(lang, 'Store Logo', 'لوگو فروشگاه', 'د پلورنځي لوګو')}</p>
                                <img 
                                  src={selectedSeller.verification.store_logo} 
                                  alt="Store Logo" 
                                  className="h-20 w-20 object-cover rounded-lg border"
                                />
                              </div>
                            )}
                            {selectedSeller.verification?.store_banner && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-2">{getLabel(lang, 'Store Banner', 'بنر فروشگاه', 'د پلورنځي بینر')}</p>
                                <img 
                                  src={selectedSeller.verification.store_banner} 
                                  alt="Store Banner" 
                                  className="w-full h-32 object-cover rounded-lg border"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Policies */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {getLabel(lang, 'Policies', 'سیاست‌ها', 'پالیسۍ')}
                    </h4>
                    <Card>
                      <CardContent className="pt-4 space-y-2">
                        <InfoRow icon={Truck} label={getLabel(lang, 'Shipping Policy', 'سیاست ارسال', 'د لیږلو پالیسي')} value={selectedSeller.verification?.shipping_policy} />
                        <InfoRow icon={RotateCcw} label={getLabel(lang, 'Return Policy', 'سیاست بازگشت', 'د بیرته ورکولو پالیسي')} value={selectedSeller.verification?.return_policy} />
                        <div className="flex items-center gap-3 py-2">
                          <Store className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">{getLabel(lang, 'Store Visibility', 'قابلیت رؤیت فروشگاه', 'د پلورنځي لیدلو وړتیا')}</p>
                            <Badge variant={selectedSeller.verification?.store_visible ? 'default' : 'secondary'}>
                              {selectedSeller.verification?.store_visible 
                                ? getLabel(lang, 'Visible', 'قابل مشاهده', 'لیدلی شي')
                                : getLabel(lang, 'Hidden', 'مخفی', 'پټ')
                              }
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Rejection Reason (if rejected) */}
                  {selectedSeller.verification?.status === 'rejected' && selectedSeller.verification?.rejection_reason && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-3 text-destructive flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          {getLabel(lang, 'Rejection Reason', 'دلیل رد', 'د ردولو دلیل')}
                        </h4>
                        <Card className="border-destructive/50">
                          <CardContent className="pt-4">
                            <p className="text-sm">{selectedSeller.verification.rejection_reason}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              {selectedSeller?.verification?.status === 'pending' && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsRejectDialogOpen(true);
                    }}
                    disabled={isSubmitting}
                  >
                    <XCircle className={`h-4 w-4 ${iconMargin}`} />
                    {getLabel(lang, 'Reject', 'رد کردن', 'ردول')}
                  </Button>
                  <Button
                    variant="default"
                    className="bg-success text-success-foreground hover:bg-success/90"
                    onClick={() => selectedSeller && handleApprove(selectedSeller)}
                    disabled={isSubmitting}
                  >
                    <CheckCircle className={`h-4 w-4 ${iconMargin}`} />
                    {isSubmitting ? getLabel(lang, 'Approving...', 'در حال تأیید...', 'تایید کېږي...') : getLabel(lang, 'Approve', 'تأیید', 'تایید')}
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                {getLabel(lang, 'Close', 'بستن', 'بندول')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
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
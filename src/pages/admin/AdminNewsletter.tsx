import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  useNewsletterSubscribers,
  useUpdateSubscriberStatus,
  useDeleteSubscriber,
  exportSubscribersToCSV,
} from '@/hooks/useNewsletter';
import { useLanguage, Language } from '@/lib/i18n';
import {
  Search,
  Download,
  MoreHorizontal,
  Mail,
  Users,
  UserCheck,
  UserX,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { format } from 'date-fns';

const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

const AdminNewsletter = () => {
  const { language } = useLanguage();
  const lang = language as Language;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<string | null>(null);

  const { data: subscribers, isLoading } = useNewsletterSubscribers();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateSubscriberStatus();
  const { mutate: deleteSubscriber, isPending: isDeleting } = useDeleteSubscriber();

  const filteredSubscribers = subscribers?.filter((sub) => {
    const matchesSearch = sub.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const activeCount = subscribers?.filter((s) => s.status === 'active').length || 0;
  const unsubscribedCount = subscribers?.filter((s) => s.status === 'unsubscribed').length || 0;

  const handleExport = () => {
    if (filteredSubscribers.length > 0) {
      exportSubscribersToCSV(filteredSubscribers);
    }
  };

  const handleDelete = () => {
    if (subscriberToDelete) {
      deleteSubscriber(subscriberToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSubscriberToDelete(null);
        },
      });
    }
  };

  const handleToggleStatus = (id: string, currentStatus: 'active' | 'unsubscribed') => {
    updateStatus({
      id,
      status: currentStatus === 'active' ? 'unsubscribed' : 'active',
    });
  };

  return (
    <AdminLayout
      title={getLabel(lang, 'Newsletter Subscribers', 'اعضای خبرنامه', 'د خبرپاڼې غړي')}
      description={getLabel(lang, 'Manage newsletter subscribers', 'مدیریت اعضای خبرنامه', 'د خبرپاڼې غړو اداره کول')}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {getLabel(lang, 'Total Subscribers', 'کل اعضا', 'ټول غړي')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscribers?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {getLabel(lang, 'Active', 'اعضای فعال', 'فعال غړي')}
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {getLabel(lang, 'Unsubscribed', 'لغو عضویت', 'غړیتوب لغوه شوی')}
              </CardTitle>
              <UserX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{unsubscribedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={getLabel(lang, 'Search emails...', 'جستجوی ایمیل...', 'بریښنالیک لټون...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {statusFilter === 'all'
                        ? getLabel(lang, 'All', 'همه', 'ټول')
                        : statusFilter === 'active'
                        ? getLabel(lang, 'Active', 'فعال', 'فعال')
                        : getLabel(lang, 'Unsubscribed', 'لغو شده', 'لغوه شوی')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      {getLabel(lang, 'All', 'همه', 'ټول')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                      {getLabel(lang, 'Active', 'فعال', 'فعال')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('unsubscribed')}>
                      {getLabel(lang, 'Unsubscribed', 'لغو شده', 'لغوه شوی')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button onClick={handleExport} disabled={filteredSubscribers.length === 0}>
                <Download className="h-4 w-4 me-2" />
                {getLabel(lang, 'Export CSV', 'خروجی CSV', 'CSV صادرول')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {getLabel(lang, 'No subscribers found', 'هیچ عضوی یافت نشد', 'هیڅ غړی ونه موندل شو')}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{getLabel(lang, 'Email', 'ایمیل', 'بریښنالیک')}</TableHead>
                      <TableHead>{getLabel(lang, 'Status', 'وضعیت', 'حالت')}</TableHead>
                      <TableHead>{getLabel(lang, 'Subscribed', 'تاریخ عضویت', 'د غړیتوب نیټه')}</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={subscriber.status === 'active' ? 'default' : 'secondary'}
                            className={
                              subscriber.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                            }
                          >
                            {subscriber.status === 'active'
                              ? getLabel(lang, 'Active', 'فعال', 'فعال')
                              : getLabel(lang, 'Unsubscribed', 'لغو شده', 'لغوه شوی')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(subscriber.subscribed_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={isUpdating || isDeleting}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(subscriber.id, subscriber.status)}
                              >
                                {subscriber.status === 'active' ? (
                                  <>
                                    <ToggleLeft className="h-4 w-4 me-2" />
                                    {getLabel(lang, 'Deactivate', 'غیرفعال کردن', 'غیر فعال کول')}
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="h-4 w-4 me-2" />
                                    {getLabel(lang, 'Activate', 'فعال کردن', 'فعال کول')}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSubscriberToDelete(subscriber.id);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 me-2" />
                                {getLabel(lang, 'Delete', 'حذف', 'حذف کول')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              {getLabel(lang, 'Delete Subscriber', 'حذف عضو', 'غړی حذف کول')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getLabel(
                lang,
                'Are you sure you want to delete this subscriber? This action cannot be undone.',
                'آیا مطمئن هستید که می‌خواهید این عضو را حذف کنید؟ این عمل قابل بازگشت نیست.',
                'ایا تاسو ډاډه یاست چې غواړئ دا غړی حذف کړئ؟ دا عمل بیرته نشي راوستل کیدی.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{getLabel(lang, 'Cancel', 'انصراف', 'لغوه کول')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {getLabel(lang, 'Delete', 'حذف', 'حذف کول')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminNewsletter;

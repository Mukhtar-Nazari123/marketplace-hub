import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Mail,
  Phone,
  User,
  Calendar,
  Globe,
  MapPin,
  Search,
  Eye,
  Reply,
  Trash2,
  RefreshCw,
  MessageCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  user_id: string | null;
  user_role: string;
  locale: string;
  ip_address: string | null;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  replied_by: string | null;
  created_at: string;
  updated_at: string;
}

const AdminContactMessages = () => {
  const { t, isRTL } = useLanguage();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (roleFilter !== 'all') {
        query = query.eq('user_role', roleFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages((data as ContactMessage[]) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'دریافت پیام‌ها ناموفق بود' : 'Failed to fetch messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, roleFilter]);

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);

    // Mark as read if new
    if (message.status === 'new') {
      try {
        await supabase
          .from('contact_messages')
          .update({ status: 'read' })
          .eq('id', message.id);
        
        setMessages(prev => 
          prev.map(m => m.id === message.id ? { ...m, status: 'read' } : m)
        );
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    }
  };

  const handleReplyClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyText(message.admin_reply || '');
    setIsReplyDialogOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({
          admin_reply: replyText,
          status: 'replied',
          replied_at: new Date().toISOString(),
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;

      toast({
        title: isRTL ? 'موفق' : 'Success',
        description: isRTL ? 'پاسخ ذخیره شد' : 'Reply saved successfully',
      });

      setMessages(prev =>
        prev.map(m =>
          m.id === selectedMessage.id
            ? { ...m, admin_reply: replyText, status: 'replied', replied_at: new Date().toISOString() }
            : m
        )
      );
      setIsReplyDialogOpen(false);
      setReplyText('');
    } catch (error) {
      console.error('Error saving reply:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'ذخیره پاسخ ناموفق بود' : 'Failed to save reply',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (messageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, status: newStatus } : m))
      );

      toast({
        title: isRTL ? 'موفق' : 'Success',
        description: isRTL ? 'وضعیت به‌روز شد' : 'Status updated',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'به‌روزرسانی وضعیت ناموفق بود' : 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', selectedMessage.id);

      if (error) throw error;

      toast({
        title: isRTL ? 'موفق' : 'Success',
        description: isRTL ? 'پیام حذف شد' : 'Message deleted',
      });

      setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
      setIsDeleteDialogOpen(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'حذف پیام ناموفق بود' : 'Failed to delete message',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: string }> = {
      new: { variant: 'default', icon: <MessageCircle size={12} />, label: isRTL ? 'جدید' : 'New' },
      read: { variant: 'secondary', icon: <Eye size={12} />, label: isRTL ? 'خوانده شده' : 'Read' },
      replied: { variant: 'outline', icon: <CheckCircle size={12} />, label: isRTL ? 'پاسخ داده شده' : 'Replied' },
      closed: { variant: 'destructive', icon: <XCircle size={12} />, label: isRTL ? 'بسته شده' : 'Closed' },
    };

    const config = statusConfig[status] || statusConfig.new;
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { className: string; label: string }> = {
      guest: { className: 'bg-gray-100 text-gray-800', label: isRTL ? 'مهمان' : 'Guest' },
      buyer: { className: 'bg-blue-100 text-blue-800', label: isRTL ? 'خریدار' : 'Buyer' },
      seller: { className: 'bg-green-100 text-green-800', label: isRTL ? 'فروشنده' : 'Seller' },
      admin: { className: 'bg-purple-100 text-purple-800', label: isRTL ? 'ادمین' : 'Admin' },
    };

    const config = roleConfig[role] || roleConfig.guest;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredMessages = messages.filter(
    m =>
      m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
    closed: messages.filter(m => m.status === 'closed').length,
  };

  return (
    <AdminLayout title={isRTL ? 'پیام‌های تماس' : 'Contact Messages'} description={isRTL ? 'مدیریت پیام‌های دریافتی از فرم تماس' : 'Manage contact form submissions'}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{isRTL ? 'پیام‌های تماس' : 'Contact Messages'}</h1>
            <p className="text-muted-foreground">
              {isRTL ? 'مدیریت پیام‌های دریافتی از فرم تماس' : 'Manage contact form submissions'}
            </p>
          </div>
          <Button onClick={fetchMessages} variant="outline" className="gap-2">
            <RefreshCw size={16} />
            {isRTL ? 'بازنشانی' : 'Refresh'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">{isRTL ? 'کل پیام‌ها' : 'Total'}</div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              <div className="text-sm text-muted-foreground">{isRTL ? 'جدید' : 'New'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.read}</div>
              <div className="text-sm text-muted-foreground">{isRTL ? 'خوانده شده' : 'Read'}</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
              <div className="text-sm text-muted-foreground">{isRTL ? 'پاسخ داده شده' : 'Replied'}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.closed}</div>
              <div className="text-sm text-muted-foreground">{isRTL ? 'بسته شده' : 'Closed'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder={isRTL ? 'جستجو در پیام‌ها...' : 'Search messages...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={isRTL ? 'وضعیت' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'همه' : 'All'}</SelectItem>
                  <SelectItem value="new">{isRTL ? 'جدید' : 'New'}</SelectItem>
                  <SelectItem value="read">{isRTL ? 'خوانده شده' : 'Read'}</SelectItem>
                  <SelectItem value="replied">{isRTL ? 'پاسخ داده شده' : 'Replied'}</SelectItem>
                  <SelectItem value="closed">{isRTL ? 'بسته شده' : 'Closed'}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={isRTL ? 'نقش کاربر' : 'User Role'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'همه' : 'All'}</SelectItem>
                  <SelectItem value="guest">{isRTL ? 'مهمان' : 'Guest'}</SelectItem>
                  <SelectItem value="buyer">{isRTL ? 'خریدار' : 'Buyer'}</SelectItem>
                  <SelectItem value="seller">{isRTL ? 'فروشنده' : 'Seller'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Messages Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="animate-spin text-primary" size={24} />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {isRTL ? 'پیامی یافت نشد' : 'No messages found'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? 'فرستنده' : 'Sender'}</TableHead>
                    <TableHead>{isRTL ? 'موضوع' : 'Subject'}</TableHead>
                    <TableHead>{isRTL ? 'نقش' : 'Role'}</TableHead>
                    <TableHead>{isRTL ? 'وضعیت' : 'Status'}</TableHead>
                    <TableHead>{isRTL ? 'تاریخ' : 'Date'}</TableHead>
                    <TableHead className="text-center">{isRTL ? 'عملیات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map(message => (
                    <TableRow key={message.id} className={message.status === 'new' ? 'bg-blue-50/50' : ''}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{message.full_name}</div>
                          <div className="text-sm text-muted-foreground">{message.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">{message.subject}</div>
                      </TableCell>
                      <TableCell>{getRoleBadge(message.user_role)}</TableCell>
                      <TableCell>{getStatusBadge(message.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(message.created_at), 'yyyy-MM-dd HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewMessage(message)}
                            title={isRTL ? 'مشاهده' : 'View'}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReplyClick(message)}
                            title={isRTL ? 'پاسخ' : 'Reply'}
                          >
                            <Reply size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedMessage(message);
                              setIsDeleteDialogOpen(true);
                            }}
                            title={isRTL ? 'حذف' : 'Delete'}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Message Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isRTL ? 'جزئیات پیام' : 'Message Details'}</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-muted-foreground" />
                    <span className="font-medium">{selectedMessage.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-muted-foreground" />
                    <span>{selectedMessage.email}</span>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-muted-foreground" />
                      <span>{selectedMessage.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-muted-foreground" />
                    <span>{selectedMessage.locale === 'fa' ? 'فارسی' : 'English'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span>{format(new Date(selectedMessage.created_at), 'yyyy-MM-dd HH:mm')}</span>
                  </div>
                  {selectedMessage.ip_address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span className="text-sm">{selectedMessage.ip_address}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {getRoleBadge(selectedMessage.user_role)}
                  {getStatusBadge(selectedMessage.status)}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">{isRTL ? 'موضوع' : 'Subject'}</h4>
                  <p>{selectedMessage.subject}</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">{isRTL ? 'پیام' : 'Message'}</h4>
                  <p className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{selectedMessage.message}</p>
                </div>

                {selectedMessage.admin_reply && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2 text-green-600">{isRTL ? 'پاسخ ادمین' : 'Admin Reply'}</h4>
                    <p className="whitespace-pre-wrap bg-green-50 p-4 rounded-lg border border-green-200">
                      {selectedMessage.admin_reply}
                    </p>
                    {selectedMessage.replied_at && (
                      <div className="text-sm text-muted-foreground mt-2">
                        {isRTL ? 'پاسخ داده شده در:' : 'Replied at:'}{' '}
                        {format(new Date(selectedMessage.replied_at), 'yyyy-MM-dd HH:mm')}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-4 flex gap-2">
                  <Select
                    value={selectedMessage.status}
                    onValueChange={status => {
                      handleStatusChange(selectedMessage.id, status);
                      setSelectedMessage({ ...selectedMessage, status });
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{isRTL ? 'جدید' : 'New'}</SelectItem>
                      <SelectItem value="read">{isRTL ? 'خوانده شده' : 'Read'}</SelectItem>
                      <SelectItem value="replied">{isRTL ? 'پاسخ داده شده' : 'Replied'}</SelectItem>
                      <SelectItem value="closed">{isRTL ? 'بسته شده' : 'Closed'}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleReplyClick(selectedMessage)} className="gap-2">
                    <Reply size={16} />
                    {isRTL ? 'پاسخ' : 'Reply'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reply Dialog */}
        <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isRTL ? 'پاسخ به پیام' : 'Reply to Message'}</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'پاسخ به' : 'Replying to'}: <strong>{selectedMessage.full_name}</strong> ({selectedMessage.email})
                </div>
                <Textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={isRTL ? 'پاسخ خود را بنویسید...' : 'Write your reply...'}
                  rows={6}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                {isRTL ? 'انصراف' : 'Cancel'}
              </Button>
              <Button onClick={handleSubmitReply} disabled={isSubmitting || !replyText.trim()}>
                {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : null}
                {isRTL ? 'ذخیره پاسخ' : 'Save Reply'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{isRTL ? 'حذف پیام' : 'Delete Message'}</AlertDialogTitle>
              <AlertDialogDescription>
                {isRTL
                  ? 'آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟ این عمل قابل بازگشت نیست.'
                  : 'Are you sure you want to delete this message? This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{isRTL ? 'انصراف' : 'Cancel'}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMessage}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : null}
                {isRTL ? 'حذف' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminContactMessages;

import { useState, useEffect } from 'react';
import { useLanguage, Language } from '@/lib/i18n';
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

const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

const AdminContactMessages = () => {
  const { t, isRTL, language } = useLanguage();
  const lang = language as Language;
  
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
        title: getLabel(lang, 'Error', 'خطا', 'تېروتنه'),
        description: getLabel(lang, 'Failed to fetch messages', 'دریافت پیام‌ها ناموفق بود', 'پیغامونه راوړل ناکام شول'),
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
        title: getLabel(lang, 'Success', 'موفق', 'بریالیتوب'),
        description: getLabel(lang, 'Reply saved successfully', 'پاسخ ذخیره شد', 'ځواب بریالی خوندی شو'),
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
        title: getLabel(lang, 'Error', 'خطا', 'تېروتنه'),
        description: getLabel(lang, 'Failed to save reply', 'ذخیره پاسخ ناموفق بود', 'ځواب خوندي کول ناکام شول'),
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
        title: getLabel(lang, 'Success', 'موفق', 'بریالیتوب'),
        description: getLabel(lang, 'Status updated', 'وضعیت به‌روز شد', 'حالت تازه شو'),
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: getLabel(lang, 'Error', 'خطا', 'تېروتنه'),
        description: getLabel(lang, 'Failed to update status', 'به‌روزرسانی وضعیت ناموفق بود', 'حالت تازه کول ناکام شول'),
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
        title: getLabel(lang, 'Success', 'موفق', 'بریالیتوب'),
        description: getLabel(lang, 'Message deleted', 'پیام حذف شد', 'پیغام ړنګ شو'),
      });

      setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
      setIsDeleteDialogOpen(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: getLabel(lang, 'Error', 'خطا', 'تېروتنه'),
        description: getLabel(lang, 'Failed to delete message', 'حذف پیام ناموفق بود', 'پیغام ړنګول ناکام شول'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: string }> = {
      new: { variant: 'default', icon: <MessageCircle size={12} />, label: getLabel(lang, 'New', 'جدید', 'نوی') },
      read: { variant: 'secondary', icon: <Eye size={12} />, label: getLabel(lang, 'Read', 'خوانده شده', 'لوستل شوی') },
      replied: { variant: 'outline', icon: <CheckCircle size={12} />, label: getLabel(lang, 'Replied', 'پاسخ داده شده', 'ځواب شوی') },
      closed: { variant: 'destructive', icon: <XCircle size={12} />, label: getLabel(lang, 'Closed', 'بسته شده', 'تړل شوی') },
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
      guest: { className: 'bg-muted text-muted-foreground', label: getLabel(lang, 'Guest', 'مهمان', 'میلمه') },
      buyer: { className: 'bg-primary/10 text-primary', label: getLabel(lang, 'Buyer', 'خریدار', 'پیرودونکی') },
      seller: { className: 'bg-success/10 text-success', label: getLabel(lang, 'Seller', 'فروشنده', 'پلورونکی') },
      admin: { className: 'bg-accent text-accent-foreground', label: getLabel(lang, 'Admin', 'ادمین', 'اډمین') },
    };

    const config = roleConfig[role] || roleConfig.guest;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getLocaleName = (locale: string) => {
    const localeMap: Record<string, string> = {
      en: 'English',
      fa: 'فارسی',
      ps: 'پښتو',
    };
    return localeMap[locale] || locale;
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
    <AdminLayout 
      title={getLabel(lang, 'Contact Messages', 'پیام‌های تماس', 'د اړیکو پیغامونه')} 
      description={getLabel(lang, 'Manage contact form submissions', 'مدیریت پیام‌های دریافتی از فرم تماس', 'د اړیکو فورم پیغامونه اداره کړئ')}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{getLabel(lang, 'Contact Messages', 'پیام‌های تماس', 'د اړیکو پیغامونه')}</h1>
            <p className="text-muted-foreground">
              {getLabel(lang, 'Manage contact form submissions', 'مدیریت پیام‌های دریافتی از فرم تماس', 'د اړیکو فورم پیغامونه اداره کړئ')}
            </p>
          </div>
          <Button onClick={fetchMessages} variant="outline" className="gap-2">
            <RefreshCw size={16} />
            {getLabel(lang, 'Refresh', 'بازنشانی', 'تازه کول')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">{getLabel(lang, 'Total', 'کل پیام‌ها', 'ټول')}</div>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{stats.new}</div>
              <div className="text-sm text-muted-foreground">{getLabel(lang, 'New', 'جدید', 'نوی')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.read}</div>
              <div className="text-sm text-muted-foreground">{getLabel(lang, 'Read', 'خوانده شده', 'لوستل شوی')}</div>
            </CardContent>
          </Card>
          <Card className="border-success/20 bg-success/5">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-success">{stats.replied}</div>
              <div className="text-sm text-muted-foreground">{getLabel(lang, 'Replied', 'پاسخ داده شده', 'ځواب شوی')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.closed}</div>
              <div className="text-sm text-muted-foreground">{getLabel(lang, 'Closed', 'بسته شده', 'تړل شوی')}</div>
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
                  placeholder={getLabel(lang, 'Search messages...', 'جستجو در پیام‌ها...', 'پیغامونه ولټوئ...')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={getLabel(lang, 'Status', 'وضعیت', 'حالت')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{getLabel(lang, 'All', 'همه', 'ټول')}</SelectItem>
                  <SelectItem value="new">{getLabel(lang, 'New', 'جدید', 'نوی')}</SelectItem>
                  <SelectItem value="read">{getLabel(lang, 'Read', 'خوانده شده', 'لوستل شوی')}</SelectItem>
                  <SelectItem value="replied">{getLabel(lang, 'Replied', 'پاسخ داده شده', 'ځواب شوی')}</SelectItem>
                  <SelectItem value="closed">{getLabel(lang, 'Closed', 'بسته شده', 'تړل شوی')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={getLabel(lang, 'User Role', 'نقش کاربر', 'د کاروونکي رول')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{getLabel(lang, 'All', 'همه', 'ټول')}</SelectItem>
                  <SelectItem value="guest">{getLabel(lang, 'Guest', 'مهمان', 'میلمه')}</SelectItem>
                  <SelectItem value="buyer">{getLabel(lang, 'Buyer', 'خریدار', 'پیرودونکی')}</SelectItem>
                  <SelectItem value="seller">{getLabel(lang, 'Seller', 'فروشنده', 'پلورونکی')}</SelectItem>
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
                {getLabel(lang, 'No messages found', 'پیامی یافت نشد', 'هیڅ پیغام ونه موندل شو')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{getLabel(lang, 'Sender', 'فرستنده', 'لیږونکی')}</TableHead>
                    <TableHead>{getLabel(lang, 'Subject', 'موضوع', 'موضوع')}</TableHead>
                    <TableHead>{getLabel(lang, 'Role', 'نقش', 'رول')}</TableHead>
                    <TableHead>{getLabel(lang, 'Status', 'وضعیت', 'حالت')}</TableHead>
                    <TableHead>{getLabel(lang, 'Date', 'تاریخ', 'نیټه')}</TableHead>
                    <TableHead className="text-center">{getLabel(lang, 'Actions', 'عملیات', 'کړنې')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map(message => (
                    <TableRow key={message.id} className={message.status === 'new' ? 'bg-primary/5' : ''}>
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
                            title={getLabel(lang, 'View', 'مشاهده', 'لید')}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleReplyClick(message)}
                            title={getLabel(lang, 'Reply', 'پاسخ', 'ځواب')}
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
                            title={getLabel(lang, 'Delete', 'حذف', 'ړنګول')}
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
              <DialogTitle>{getLabel(lang, 'Message Details', 'جزئیات پیام', 'د پیغام توضیحات')}</DialogTitle>
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
                    <span>{getLocaleName(selectedMessage.locale)}</span>
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
                  <h4 className="font-medium mb-2">{getLabel(lang, 'Subject', 'موضوع', 'موضوع')}</h4>
                  <p>{selectedMessage.subject}</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">{getLabel(lang, 'Message', 'پیام', 'پیغام')}</h4>
                  <p className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">{selectedMessage.message}</p>
                </div>

                {selectedMessage.admin_reply && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2 text-success">{getLabel(lang, 'Admin Reply', 'پاسخ ادمین', 'د اډمین ځواب')}</h4>
                    <p className="whitespace-pre-wrap bg-success/10 p-4 rounded-lg border border-success/20">
                      {selectedMessage.admin_reply}
                    </p>
                    {selectedMessage.replied_at && (
                      <div className="text-sm text-muted-foreground mt-2">
                        {getLabel(lang, 'Replied at:', 'پاسخ داده شده در:', 'ځواب شوی په:')}{' '}
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
                      <SelectItem value="new">{getLabel(lang, 'New', 'جدید', 'نوی')}</SelectItem>
                      <SelectItem value="read">{getLabel(lang, 'Read', 'خوانده شده', 'لوستل شوی')}</SelectItem>
                      <SelectItem value="replied">{getLabel(lang, 'Replied', 'پاسخ داده شده', 'ځواب شوی')}</SelectItem>
                      <SelectItem value="closed">{getLabel(lang, 'Closed', 'بسته شده', 'تړل شوی')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleReplyClick(selectedMessage)} className="gap-2">
                    <Reply size={16} />
                    {getLabel(lang, 'Reply', 'پاسخ', 'ځواب')}
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
              <DialogTitle>{getLabel(lang, 'Reply to Message', 'پاسخ به پیام', 'پیغام ته ځواب')}</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {getLabel(lang, 'Replying to', 'پاسخ به', 'ځواب ورکول')}: <strong>{selectedMessage.full_name}</strong> ({selectedMessage.email})
                </div>
                <Textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={getLabel(lang, 'Write your reply...', 'پاسخ خود را بنویسید...', 'خپل ځواب ولیکئ...')}
                  rows={6}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                {getLabel(lang, 'Cancel', 'انصراف', 'لغوه کړئ')}
              </Button>
              <Button onClick={handleSubmitReply} disabled={isSubmitting || !replyText.trim()}>
                {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : null}
                {getLabel(lang, 'Save Reply', 'ذخیره پاسخ', 'ځواب خوندي کړئ')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{getLabel(lang, 'Delete Message', 'حذف پیام', 'پیغام ړنګول')}</AlertDialogTitle>
              <AlertDialogDescription>
                {getLabel(
                  lang,
                  'Are you sure you want to delete this message? This action cannot be undone.',
                  'آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟ این عمل قابل بازگشت نیست.',
                  'ایا تاسو ډاډه یاست چې دا پیغام ړنګول غواړئ؟ دا کړنه بیرته نشي کېدلی.'
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{getLabel(lang, 'Cancel', 'انصراف', 'لغوه کړئ')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteMessage}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : null}
                {getLabel(lang, 'Delete', 'حذف', 'ړنګول')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminContactMessages;

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { usePrivacyPolicies, PrivacyPolicy } from '@/hooks/usePrivacyPolicies';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus, Edit, Trash2, Eye, Send, History, RotateCcw, FileText, Loader2, Globe,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Language = 'en' | 'fa' | 'ps';
const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

const AdminPrivacyPolicy = () => {
  const { language, isRTL } = useLanguage();
  const lang = language as Language;
  const { user } = useAuth();
  const {
    policies, isLoading, createPolicy, updatePolicy, publishPolicy, rollbackPolicy, deletePolicy, versionsQuery,
  } = usePrivacyPolicies();

  const [editingPolicy, setEditingPolicy] = useState<PrivacyPolicy | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [changeSummary, setChangeSummary] = useState('');
  const [contentTab, setContentTab] = useState('en');

  // Form state
  const [form, setForm] = useState({
    title_en: '', title_fa: '', title_ps: '',
    slug: 'privacy-policy',
    content_en: '', content_fa: '', content_ps: '',
    meta_title_en: '', meta_title_fa: '', meta_title_ps: '',
    meta_description_en: '', meta_description_fa: '', meta_description_ps: '',
    platform_type: 'both',
    policy_type: 'general',
  });

  const resetForm = () => {
    setForm({
      title_en: '', title_fa: '', title_ps: '',
      slug: 'privacy-policy',
      content_en: '', content_fa: '', content_ps: '',
      meta_title_en: '', meta_title_fa: '', meta_title_ps: '',
      meta_description_en: '', meta_description_fa: '', meta_description_ps: '',
      platform_type: 'both', policy_type: 'general',
    });
  };

  const openCreate = () => { resetForm(); setEditingPolicy(null); setIsCreateOpen(true); };

  const openEdit = (policy: PrivacyPolicy) => {
    setForm({
      title_en: policy.title_en || '', title_fa: policy.title_fa || '', title_ps: policy.title_ps || '',
      slug: policy.slug, content_en: policy.content_en || '', content_fa: policy.content_fa || '',
      content_ps: policy.content_ps || '', meta_title_en: policy.meta_title_en || '',
      meta_title_fa: policy.meta_title_fa || '', meta_title_ps: policy.meta_title_ps || '',
      meta_description_en: policy.meta_description_en || '', meta_description_fa: policy.meta_description_fa || '',
      meta_description_ps: policy.meta_description_ps || '',
      platform_type: policy.platform_type, policy_type: policy.policy_type,
    });
    setEditingPolicy(policy);
    setIsCreateOpen(true);
  };

  const handleSave = async () => {
    if (editingPolicy) {
      await updatePolicy.mutateAsync({ id: editingPolicy.id, ...form } as any);
    } else {
      await createPolicy.mutateAsync(form as any);
    }
    setIsCreateOpen(false);
  };

  const handlePublish = async () => {
    if (!selectedPolicyId) return;
    await publishPolicy.mutateAsync({ id: selectedPolicyId, changeSummary });
    setIsPublishOpen(false);
    setChangeSummary('');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deletePolicy.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const { data: versions = [] } = selectedPolicyId ? versionsQuery(selectedPolicyId) : { data: [] };

  const policyTypeLabel = (type: string) => getLabel(lang,
    type === 'general' ? 'General' : type === 'vendor' ? 'Vendor' : 'Mobile App',
    type === 'general' ? 'عمومی' : type === 'vendor' ? 'فروشنده' : 'اپلیکیشن',
    type === 'general' ? 'عمومي' : type === 'vendor' ? 'پلورونکی' : 'موبایل ایپ',
  );

  const platformLabel = (type: string) => getLabel(lang,
    type === 'web' ? 'Web' : type === 'mobile' ? 'Mobile' : 'Both',
    type === 'web' ? 'وب' : type === 'mobile' ? 'موبایل' : 'هر دو',
    type === 'web' ? 'ویب' : type === 'mobile' ? 'موبایل' : 'دواړه',
  );

  return (
    <AdminLayout
      title={getLabel(lang, 'Privacy Policies', 'سیاست حریم خصوصی', 'د محرمیت تګلاره')}
      description={getLabel(lang, 'Manage privacy policy content', 'مدیریت محتوای سیاست حریم خصوصی', 'د محرمیت تګلاره منځپانګه مدیریت کړئ')}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div>
            <h2 className="text-2xl font-bold">
              {getLabel(lang, 'Privacy Policies', 'سیاست‌های حریم خصوصی', 'د محرمیت تګلارې')}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {getLabel(lang, `Total ${policies.length} policies`, `مجموع ${policies.length} سیاست`, `ټول ${policies.length} تګلارې`)}
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {getLabel(lang, 'Add Policy', 'افزودن سیاست', 'تګلاره اضافه کړئ')}
          </Button>
        </div>

        {/* Policies List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : policies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">{getLabel(lang, 'No policies yet', 'هنوز سیاستی وجود ندارد', 'تر اوسه تګلاره نشته')}</h3>
              <p className="text-muted-foreground mb-4">{getLabel(lang, 'Create your first privacy policy', 'اولین سیاست حریم خصوصی خود را ایجاد کنید', 'خپله لومړۍ محرمیت تګلاره جوړه کړئ')}</p>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                {getLabel(lang, 'Create Policy', 'ایجاد سیاست', 'تګلاره جوړه کړئ')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {policies.map((policy) => (
              <Card key={policy.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : ''}>
                      <CardTitle className="text-lg">
                        {lang === 'fa' ? (policy.title_fa || policy.title_en) : lang === 'ps' ? (policy.title_ps || policy.title_en) : policy.title_en}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {getLabel(lang, 'Version', 'نسخه', 'نسخه')} {policy.version} •{' '}
                        {policy.published_at && format(new Date(policy.published_at), 'PPP')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={policy.is_active && !policy.is_draft ? 'default' : 'secondary'}>
                        {policy.is_draft
                          ? getLabel(lang, 'Draft', 'پیش‌نویس', 'مسوده')
                          : policy.is_active
                            ? getLabel(lang, 'Published', 'منتشر شده', 'خپور شوی')
                            : getLabel(lang, 'Inactive', 'غیرفعال', 'غیرفعال')
                        }
                      </Badge>
                      <Badge variant="outline">{policyTypeLabel(policy.policy_type)}</Badge>
                      <Badge variant="outline">
                        <Globe className="h-3 w-3 mr-1" />
                        {platformLabel(policy.platform_type)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Button variant="outline" size="sm" onClick={() => openEdit(policy)}>
                      <Edit className="h-4 w-4 mr-1" />
                      {getLabel(lang, 'Edit', 'ویرایش', 'سمون')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedPolicyId(policy.id); setIsPreviewOpen(true); }}>
                      <Eye className="h-4 w-4 mr-1" />
                      {getLabel(lang, 'Preview', 'پیش‌نمایش', 'مخکتنه')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedPolicyId(policy.id); setIsPublishOpen(true); }}>
                      <Send className="h-4 w-4 mr-1" />
                      {getLabel(lang, 'Publish', 'انتشار', 'خپرول')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedPolicyId(policy.id); setIsVersionsOpen(true); }}>
                      <History className="h-4 w-4 mr-1" />
                      {getLabel(lang, 'Versions', 'نسخه‌ها', 'نسخې')}
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteId(policy.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy
                ? getLabel(lang, 'Edit Policy', 'ویرایش سیاست', 'تګلاره سمول')
                : getLabel(lang, 'Create Policy', 'ایجاد سیاست', 'تګلاره جوړول')
              }
            </DialogTitle>
            <DialogDescription>
              {getLabel(lang, 'Fill in policy details for all languages', 'جزئیات سیاست را برای همه زبان‌ها پر کنید', 'د ټولو ژبو لپاره د تګلارې جزئیات ډک کړئ')}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-2">
              {/* Settings Row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{getLabel(lang, 'Slug', 'اسلاگ', 'سلګ')}</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
                <div>
                  <Label>{getLabel(lang, 'Policy Type', 'نوع سیاست', 'د تګلارې ډول')}</Label>
                  <Select value={form.policy_type} onValueChange={(v) => setForm({ ...form, policy_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{getLabel(lang, 'General', 'عمومی', 'عمومي')}</SelectItem>
                      <SelectItem value="vendor">{getLabel(lang, 'Vendor', 'فروشنده', 'پلورونکی')}</SelectItem>
                      <SelectItem value="mobile_app">{getLabel(lang, 'Mobile App', 'اپلیکیشن', 'موبایل ایپ')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{getLabel(lang, 'Platform', 'پلتفرم', 'پلتفارم')}</Label>
                  <Select value={form.platform_type} onValueChange={(v) => setForm({ ...form, platform_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">{getLabel(lang, 'Web', 'وب', 'ویب')}</SelectItem>
                      <SelectItem value="mobile">{getLabel(lang, 'Mobile', 'موبایل', 'موبایل')}</SelectItem>
                      <SelectItem value="both">{getLabel(lang, 'Both', 'هر دو', 'دواړه')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Content Tabs */}
              <Tabs value={contentTab} onValueChange={setContentTab}>
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="fa">فارسی</TabsTrigger>
                  <TabsTrigger value="ps">پښتو</TabsTrigger>
                </TabsList>

                {['en', 'fa', 'ps'].map((tabLang) => (
                  <TabsContent key={tabLang} value={tabLang} className="space-y-4 mt-4">
                    <div>
                      <Label>{getLabel(lang, 'Title', 'عنوان', 'سرلیک')}</Label>
                      <Input
                        value={(form as any)[`title_${tabLang}`]}
                        onChange={(e) => setForm({ ...form, [`title_${tabLang}`]: e.target.value })}
                        dir={tabLang === 'en' ? 'ltr' : 'rtl'}
                      />
                    </div>
                    <div>
                      <Label>{getLabel(lang, 'Content', 'محتوا', 'منځپانګه')}</Label>
                      <RichTextEditor
                        value={(form as any)[`content_${tabLang}`]}
                        onChange={(val) => setForm({ ...form, [`content_${tabLang}`]: val })}
                        placeholder={getLabel(lang, 'Write policy content...', 'محتوای سیاست را بنویسید...', 'د تګلارې منځپانګه ولیکئ...')}
                        minRows={12}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{getLabel(lang, 'Meta Title (SEO)', 'عنوان متا', 'متا سرلیک')}</Label>
                        <Input
                          value={(form as any)[`meta_title_${tabLang}`]}
                          onChange={(e) => setForm({ ...form, [`meta_title_${tabLang}`]: e.target.value })}
                          dir={tabLang === 'en' ? 'ltr' : 'rtl'}
                          maxLength={60}
                        />
                      </div>
                      <div>
                        <Label>{getLabel(lang, 'Meta Description (SEO)', 'توضیح متا', 'متا تشریح')}</Label>
                        <Input
                          value={(form as any)[`meta_description_${tabLang}`]}
                          onChange={(e) => setForm({ ...form, [`meta_description_${tabLang}`]: e.target.value })}
                          dir={tabLang === 'en' ? 'ltr' : 'rtl'}
                          maxLength={160}
                        />
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              {getLabel(lang, 'Cancel', 'انصراف', 'لغوه')}
            </Button>
            <Button onClick={handleSave} disabled={createPolicy.isPending || updatePolicy.isPending}>
              {(createPolicy.isPending || updatePolicy.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {getLabel(lang, 'Save Draft', 'ذخیره پیش‌نویس', 'مسوده خوندي کړئ')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{getLabel(lang, 'Preview', 'پیش‌نمایش', 'مخکتنه')}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh]">
            {(() => {
              const p = policies.find((p) => p.id === selectedPolicyId);
              if (!p) return null;
              const content = lang === 'fa' ? (p.content_fa || p.content_en) : lang === 'ps' ? (p.content_ps || p.content_en) : p.content_en;
              const title = lang === 'fa' ? (p.title_fa || p.title_en) : lang === 'ps' ? (p.title_ps || p.title_en) : p.title_en;
              return (
                <div className={`prose max-w-none dark:prose-invert ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                  <h1>{title}</h1>
                  <p className="text-muted-foreground text-sm">
                    {getLabel(lang, 'Version', 'نسخه', 'نسخه')} {p.version} •{' '}
                    {p.published_at && format(new Date(p.published_at), 'PPP')}
                  </p>
                  <div className="whitespace-pre-wrap">{content}</div>
                </div>
              );
            })()}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog */}
      <Dialog open={isPublishOpen} onOpenChange={setIsPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getLabel(lang, 'Publish Policy', 'انتشار سیاست', 'تګلاره خپرول')}</DialogTitle>
            <DialogDescription>
              {getLabel(lang, 'This will create a new version and make the policy active.', 'این یک نسخه جدید ایجاد کرده و سیاست را فعال می‌کند.', 'دا به یوه نوې نسخه جوړه کړي او تګلاره فعاله کړي.')}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>{getLabel(lang, 'Change Summary (optional)', 'خلاصه تغییرات (اختیاری)', 'د بدلون لنډیز (اختیاري)')}</Label>
            <Textarea value={changeSummary} onChange={(e) => setChangeSummary(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPublishOpen(false)}>
              {getLabel(lang, 'Cancel', 'انصراف', 'لغوه')}
            </Button>
            <Button onClick={handlePublish} disabled={publishPolicy.isPending}>
              {publishPolicy.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Send className="h-4 w-4 mr-2" />
              {getLabel(lang, 'Publish', 'انتشار', 'خپرول')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Versions Dialog */}
      <Dialog open={isVersionsOpen} onOpenChange={setIsVersionsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{getLabel(lang, 'Version History', 'تاریخچه نسخه‌ها', 'د نسخو تاریخچه')}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {versions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {getLabel(lang, 'No versions yet', 'هنوز نسخه‌ای وجود ندارد', 'تر اوسه نسخه نشته')}
              </p>
            ) : (
              <div className="space-y-3">
                {versions.map((v) => (
                  <Card key={v.id}>
                    <CardContent className="p-4">
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div>
                          <p className="font-medium">
                            {getLabel(lang, 'Version', 'نسخه', 'نسخه')} {v.version}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(v.created_at), 'PPP p')}
                          </p>
                          {v.change_summary && (
                            <p className="text-sm mt-1">{v.change_summary}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (selectedPolicyId) {
                              await rollbackPolicy.mutateAsync({ policyId: selectedPolicyId, versionId: v.id });
                              setIsVersionsOpen(false);
                            }
                          }}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          {getLabel(lang, 'Rollback', 'بازگردانی', 'بیرته راوستل')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getLabel(lang, 'Delete Policy?', 'حذف سیاست؟', 'تګلاره حذف کړئ؟')}</AlertDialogTitle>
            <AlertDialogDescription>
              {getLabel(lang, 'This action cannot be undone.', 'این عمل قابل بازگشت نیست.', 'دا عمل بیرته نشي اخیستل.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{getLabel(lang, 'Cancel', 'انصراف', 'لغوه')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {getLabel(lang, 'Delete', 'حذف', 'حذف')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminPrivacyPolicy;

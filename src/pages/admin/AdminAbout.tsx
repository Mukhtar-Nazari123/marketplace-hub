import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage, Language } from '@/lib/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import ImageUpload from '@/components/admin/ImageUpload';
import { toast } from 'sonner';
import {
  useAdminAboutSections,
  useAdminAboutValues,
  useAdminAboutTeamMembers,
  useAdminAboutAwards,
  useUpdateAboutSection,
  useCreateAboutValue,
  useUpdateAboutValue,
  useDeleteAboutValue,
  useCreateAboutTeamMember,
  useUpdateAboutTeamMember,
  useDeleteAboutTeamMember,
  useCreateAboutAward,
  useUpdateAboutAward,
  useDeleteAboutAward,
  AboutSection,
  AboutValue,
  AboutTeamMember,
  AboutAward,
} from '@/hooks/useAboutContent';
import { 
  FileText, Edit, Trash2, Plus, Save, Target, Eye, Heart, Award, 
  Users, CheckCircle, History, Star, Sparkles, GripVertical 
} from 'lucide-react';

// Trilingual helper
const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

const ICONS = [
  { name: 'Target', icon: Target },
  { name: 'Eye', icon: Eye },
  { name: 'Heart', icon: Heart },
  { name: 'Award', icon: Award },
  { name: 'Users', icon: Users },
  { name: 'CheckCircle', icon: CheckCircle },
  { name: 'History', icon: History },
  { name: 'Star', icon: Star },
  { name: 'Sparkles', icon: Sparkles },
];

const AdminAbout = () => {
  const { language, isRTL } = useLanguage();
  const lang = language as Language;

  return (
    <AdminLayout 
      title={getLabel(lang, 'About Page Management', 'مدیریت صفحه درباره ما', 'د زموږ په اړه پاڼه مدیریت')}
      description={getLabel(lang, 'Edit About page content', 'ویرایش محتوای صفحه درباره ما', 'د زموږ په اړه پاڼې منځپانګه سمول')}
    >
      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sections">{getLabel(lang, 'Sections', 'بخش‌ها', 'برخې')}</TabsTrigger>
          <TabsTrigger value="values">{getLabel(lang, 'Values', 'ارزش‌ها', 'ارزښتونه')}</TabsTrigger>
          <TabsTrigger value="team">{getLabel(lang, 'Team', 'تیم', 'ټیم')}</TabsTrigger>
          <TabsTrigger value="awards">{getLabel(lang, 'Awards', 'جوایز', 'جوایز')}</TabsTrigger>
        </TabsList>

        <TabsContent value="sections">
          <SectionsTab lang={lang} isRTL={isRTL} />
        </TabsContent>

        <TabsContent value="values">
          <ValuesTab lang={lang} isRTL={isRTL} />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab lang={lang} isRTL={isRTL} />
        </TabsContent>

        <TabsContent value="awards">
          <AwardsTab lang={lang} isRTL={isRTL} />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

// Sections Tab
const SectionsTab = ({ lang, isRTL }: { lang: Language; isRTL: boolean }) => {
  const { data: sections, isLoading } = useAdminAboutSections();
  const updateSection = useUpdateAboutSection();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AboutSection>>({});

  const handleEdit = (section: AboutSection) => {
    setEditingId(section.id);
    setFormData(section);
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      await updateSection.mutateAsync({ id: editingId, ...formData });
      toast.success(getLabel(lang, 'Section updated', 'بخش به‌روزرسانی شد', 'برخه تازه شوه'));
      setEditingId(null);
    } catch (error) {
      toast.error(getLabel(lang, 'Update failed', 'خطا در به‌روزرسانی', 'تازه کول ناکام شول'));
    }
  };

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>;
  }

  return (
    <div className="space-y-4">
      {sections?.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg capitalize">{section.section_key}</CardTitle>
                <CardDescription>
                  {lang === 'ps' ? section.title_ps || section.title_en : lang === 'fa' ? section.title_fa : section.title_en}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={section.is_active}
                  onCheckedChange={(checked) => 
                    updateSection.mutate({ id: section.id, is_active: checked })
                  }
                />
                <Button variant="ghost" size="icon" onClick={() => handleEdit(section)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {editingId === section.id && (
            <CardContent className="space-y-4 border-t pt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Title (English)', 'عنوان (انگلیسی)', 'سرلیک (انګلیسي)')}</Label>
                  <Input
                    value={formData.title_en || ''}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Title (Persian)', 'عنوان (فارسی)', 'سرلیک (فارسي)')}</Label>
                  <Input
                    value={formData.title_fa || ''}
                    onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })}
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Title (Pashto)', 'عنوان (پشتو)', 'سرلیک (پښتو)')}</Label>
                  <Input
                    value={formData.title_ps || ''}
                    onChange={(e) => setFormData({ ...formData, title_ps: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Description (English)', 'توضیحات (انگلیسی)', 'تشریح (انګلیسي)')}</Label>
                  <Textarea
                    value={formData.description_en || ''}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Description (Persian)', 'توضیحات (فارسی)', 'تشریح (فارسي)')}</Label>
                  <Textarea
                    value={formData.description_fa || ''}
                    onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })}
                    dir="rtl"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Description (Pashto)', 'توضیحات (پشتو)', 'تشریح (پښتو)')}</Label>
                  <Textarea
                    value={formData.description_ps || ''}
                    onChange={(e) => setFormData({ ...formData, description_ps: e.target.value })}
                    dir="rtl"
                    rows={3}
                  />
                </div>
              </div>
              {section.section_key === 'history' && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>{getLabel(lang, 'Full Content (English)', 'محتوای کامل (انگلیسی)', 'بشپړ منځپانګه (انګلیسي)')}</Label>
                    <Textarea
                      value={formData.content_en || ''}
                      onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{getLabel(lang, 'Full Content (Persian)', 'محتوای کامل (فارسی)', 'بشپړ منځپانګه (فارسي)')}</Label>
                    <Textarea
                      value={formData.content_fa || ''}
                      onChange={(e) => setFormData({ ...formData, content_fa: e.target.value })}
                      dir="rtl"
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{getLabel(lang, 'Full Content (Pashto)', 'محتوای کامل (پشتو)', 'بشپړ منځپانګه (پښتو)')}</Label>
                    <Textarea
                      value={formData.content_ps || ''}
                      onChange={(e) => setFormData({ ...formData, content_ps: e.target.value })}
                      dir="rtl"
                      rows={5}
                    />
                  </div>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Icon', 'آیکون', 'آیکون')}</Label>
                  <Select
                    value={formData.icon || ''}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={getLabel(lang, 'Select icon', 'انتخاب آیکون', 'آیکون غوره کړئ')} />
                    </SelectTrigger>
                    <SelectContent>
                      {ICONS.map(({ name, icon: Icon }) => (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {section.section_key === 'history' && (
                  <div className="space-y-2">
                    <Label>{getLabel(lang, 'Start Year', 'سال شروع', 'پیل کال')}</Label>
                    <Input
                      type="number"
                      value={formData.start_year || ''}
                      onChange={(e) => setFormData({ ...formData, start_year: parseInt(e.target.value) || null })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Priority', 'اولویت', 'لومړیتوب')}</Label>
                  <Input
                    type="number"
                    value={formData.priority || 0}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={updateSection.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {getLabel(lang, 'Save', 'ذخیره', 'خوندي کړئ')}
                </Button>
                <Button variant="outline" onClick={() => setEditingId(null)}>
                  {getLabel(lang, 'Cancel', 'انصراف', 'لغوه کول')}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

// Values Tab
const ValuesTab = ({ lang, isRTL }: { lang: Language; isRTL: boolean }) => {
  const { data: values, isLoading } = useAdminAboutValues();
  const createValue = useCreateAboutValue();
  const updateValue = useUpdateAboutValue();
  const deleteValue = useDeleteAboutValue();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<AboutValue | null>(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_fa: '',
    title_ps: '',
    description_en: '',
    description_fa: '',
    description_ps: '',
    icon: 'CheckCircle',
    priority: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_fa: '',
      title_ps: '',
      description_en: '',
      description_fa: '',
      description_ps: '',
      icon: 'CheckCircle',
      priority: 0,
      is_active: true,
    });
    setEditingValue(null);
  };

  const handleEdit = (value: AboutValue) => {
    setEditingValue(value);
    setFormData({
      title_en: value.title_en,
      title_fa: value.title_fa || '',
      title_ps: value.title_ps || '',
      description_en: value.description_en || '',
      description_fa: value.description_fa || '',
      description_ps: value.description_ps || '',
      icon: value.icon,
      priority: value.priority,
      is_active: value.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingValue) {
        await updateValue.mutateAsync({ id: editingValue.id, ...formData });
        toast.success(getLabel(lang, 'Value updated', 'ارزش به‌روزرسانی شد', 'ارزښت تازه شو'));
      } else {
        await createValue.mutateAsync(formData);
        toast.success(getLabel(lang, 'Value added', 'ارزش اضافه شد', 'ارزښت اضافه شو'));
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(getLabel(lang, 'Error', 'خطا', 'تېروتنه'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(getLabel(lang, 'Are you sure?', 'آیا مطمئن هستید؟', 'ایا تاسو ډاډه یاست؟'))) return;
    try {
      await deleteValue.mutateAsync(id);
      toast.success(getLabel(lang, 'Deleted', 'حذف شد', 'ړنګ شو'));
    } catch (error) {
      toast.error(getLabel(lang, 'Error', 'خطا', 'تېروتنه'));
    }
  };

  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />{getLabel(lang, 'Add Value', 'افزودن ارزش', 'ارزښت اضافه کړئ')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingValue 
                  ? getLabel(lang, 'Edit Value', 'ویرایش ارزش', 'ارزښت سمول')
                  : getLabel(lang, 'Add Value', 'افزودن ارزش', 'ارزښت اضافه کړئ')
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Title (English)', 'عنوان (انگلیسی)', 'سرلیک (انګلیسي)')}</Label>
                  <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Title (Persian)', 'عنوان (فارسی)', 'سرلیک (فارسي)')}</Label>
                  <Input value={formData.title_fa} onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })} dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Title (Pashto)', 'عنوان (پشتو)', 'سرلیک (پښتو)')}</Label>
                  <Input value={formData.title_ps} onChange={(e) => setFormData({ ...formData, title_ps: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Description (English)', 'توضیحات (انگلیسی)', 'تشریح (انګلیسي)')}</Label>
                  <Textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Description (Persian)', 'توضیحات (فارسی)', 'تشریح (فارسي)')}</Label>
                  <Textarea value={formData.description_fa} onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })} dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Description (Pashto)', 'توضیحات (پشتو)', 'تشریح (پښتو)')}</Label>
                  <Textarea value={formData.description_ps} onChange={(e) => setFormData({ ...formData, description_ps: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Icon', 'آیکون', 'آیکون')}</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICONS.map(({ name, icon: Icon }) => (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center gap-2"><Icon className="h-4 w-4" /><span>{name}</span></div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Priority', 'اولویت', 'لومړیتوب')}</Label>
                  <Input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Active', 'فعال', 'فعال')}</Label>
                  <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">{getLabel(lang, 'Save', 'ذخیره', 'خوندي کړئ')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {values?.map((value) => {
          const IconComponent = ICONS.find(i => i.name === value.icon)?.icon || CheckCircle;
          const title = lang === 'ps' && value.title_ps ? value.title_ps : lang === 'fa' && value.title_fa ? value.title_fa : value.title_en;
          const description = lang === 'ps' && value.description_ps ? value.description_ps : lang === 'fa' && value.description_fa ? value.description_fa : value.description_en;
          return (
            <Card key={value.id} className={!value.is_active ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{title}</CardTitle>
                      <CardDescription className="text-xs">{description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(value)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(value.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Team Tab
const TeamTab = ({ lang, isRTL }: { lang: Language; isRTL: boolean }) => {
  const { data: members, isLoading } = useAdminAboutTeamMembers();
  const createMember = useCreateAboutTeamMember();
  const updateMember = useUpdateAboutTeamMember();
  const deleteMember = useDeleteAboutTeamMember();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AboutTeamMember | null>(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_fa: '',
    name_ps: '',
    role_en: '',
    role_fa: '',
    role_ps: '',
    description_en: '',
    description_fa: '',
    description_ps: '',
    photo_url: '',
    priority: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_fa: '',
      name_ps: '',
      role_en: '',
      role_fa: '',
      role_ps: '',
      description_en: '',
      description_fa: '',
      description_ps: '',
      photo_url: '',
      priority: 0,
      is_active: true,
    });
    setEditingMember(null);
  };

  const handleEdit = (member: AboutTeamMember) => {
    setEditingMember(member);
    setFormData({
      name_en: member.name_en,
      name_fa: member.name_fa || '',
      name_ps: member.name_ps || '',
      role_en: member.role_en,
      role_fa: member.role_fa || '',
      role_ps: member.role_ps || '',
      description_en: member.description_en || '',
      description_fa: member.description_fa || '',
      description_ps: member.description_ps || '',
      photo_url: member.photo_url || '',
      priority: member.priority,
      is_active: member.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingMember) {
        await updateMember.mutateAsync({ id: editingMember.id, ...formData });
        toast.success(getLabel(lang, 'Team member updated', 'عضو تیم به‌روزرسانی شد', 'د ټیم غړی تازه شو'));
      } else {
        await createMember.mutateAsync(formData);
        toast.success(getLabel(lang, 'Team member added', 'عضو تیم اضافه شد', 'د ټیم غړی اضافه شو'));
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(getLabel(lang, 'Error', 'خطا', 'تېروتنه'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(getLabel(lang, 'Are you sure?', 'آیا مطمئن هستید؟', 'ایا تاسو ډاډه یاست؟'))) return;
    try {
      await deleteMember.mutateAsync(id);
      toast.success(getLabel(lang, 'Deleted', 'حذف شد', 'ړنګ شو'));
    } catch (error) {
      toast.error(getLabel(lang, 'Error', 'خطا', 'تېروتنه'));
    }
  };

  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />{getLabel(lang, 'Add Member', 'افزودن عضو', 'غړی اضافه کړئ')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMember 
                  ? getLabel(lang, 'Edit Member', 'ویرایش عضو', 'غړی سمول')
                  : getLabel(lang, 'Add Member', 'افزودن عضو', 'غړی اضافه کړئ')
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Name (English)', 'نام (انگلیسی)', 'نوم (انګلیسي)')}</Label>
                  <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Name (Persian)', 'نام (فارسی)', 'نوم (فارسي)')}</Label>
                  <Input value={formData.name_fa} onChange={(e) => setFormData({ ...formData, name_fa: e.target.value })} dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Name (Pashto)', 'نام (پشتو)', 'نوم (پښتو)')}</Label>
                  <Input value={formData.name_ps} onChange={(e) => setFormData({ ...formData, name_ps: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Role (English)', 'نقش (انگلیسی)', 'رول (انګلیسي)')}</Label>
                  <Input value={formData.role_en} onChange={(e) => setFormData({ ...formData, role_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Role (Persian)', 'نقش (فارسی)', 'رول (فارسي)')}</Label>
                  <Input value={formData.role_fa} onChange={(e) => setFormData({ ...formData, role_fa: e.target.value })} dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Role (Pashto)', 'نقش (پشتو)', 'رول (پښتو)')}</Label>
                  <Input value={formData.role_ps} onChange={(e) => setFormData({ ...formData, role_ps: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Description (English)', 'توضیحات (انگلیسی)', 'تشریح (انګلیسي)')}</Label>
                  <Textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Description (Persian)', 'توضیحات (فارسی)', 'تشریح (فارسي)')}</Label>
                  <Textarea value={formData.description_fa} onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })} dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Description (Pashto)', 'توضیحات (پشتو)', 'تشریح (پښتو)')}</Label>
                  <Textarea value={formData.description_ps} onChange={(e) => setFormData({ ...formData, description_ps: e.target.value })} dir="rtl" />
                </div>
              </div>
              <ImageUpload
                label={getLabel(lang, 'Photo', 'تصویر', 'انځور')}
                value={formData.photo_url}
                onChange={(url) => setFormData({ ...formData, photo_url: url })}
                bucket="site-assets"
                folder="team-photos"
                placeholder={getLabel(lang, 'Select team member photo', 'تصویر عضو تیم را انتخاب کنید', 'د ټیم غړي انځور غوره کړئ')}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Priority', 'اولویت', 'لومړیتوب')}</Label>
                  <Input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Active', 'فعال', 'فعال')}</Label>
                  <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">{getLabel(lang, 'Save', 'ذخیره', 'خوندي کړئ')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {members?.map((member) => {
          const name = lang === 'ps' && member.name_ps ? member.name_ps : lang === 'fa' && member.name_fa ? member.name_fa : member.name_en;
          const role = lang === 'ps' && member.role_ps ? member.role_ps : lang === 'fa' && member.role_fa ? member.role_fa : member.role_en;
          return (
            <Card key={member.id} className={!member.is_active ? 'opacity-50' : ''}>
              <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.name_en} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Users className="h-16 w-16 text-muted-foreground" /></div>
                )}
              </div>
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{name}</CardTitle>
                    <CardDescription>{role}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Awards Tab
const AwardsTab = ({ lang, isRTL }: { lang: Language; isRTL: boolean }) => {
  const { data: awards, isLoading } = useAdminAboutAwards();
  const createAward = useCreateAboutAward();
  const updateAward = useUpdateAboutAward();
  const deleteAward = useDeleteAboutAward();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<AboutAward | null>(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_fa: '',
    title_ps: '',
    description_en: '',
    description_fa: '',
    description_ps: '',
    year: new Date().getFullYear(),
    icon_or_image: 'Star',
    priority: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_fa: '',
      title_ps: '',
      description_en: '',
      description_fa: '',
      description_ps: '',
      year: new Date().getFullYear(),
      icon_or_image: 'Star',
      priority: 0,
      is_active: true,
    });
    setEditingAward(null);
  };

  const handleEdit = (award: AboutAward) => {
    setEditingAward(award);
    setFormData({
      title_en: award.title_en,
      title_fa: award.title_fa || '',
      title_ps: award.title_ps || '',
      description_en: award.description_en || '',
      description_fa: award.description_fa || '',
      description_ps: award.description_ps || '',
      year: award.year || new Date().getFullYear(),
      icon_or_image: award.icon_or_image || 'Star',
      priority: award.priority,
      is_active: award.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingAward) {
        await updateAward.mutateAsync({ id: editingAward.id, ...formData });
        toast.success(getLabel(lang, 'Award updated', 'جایزه به‌روزرسانی شد', 'جایزه تازه شوه'));
      } else {
        await createAward.mutateAsync(formData);
        toast.success(getLabel(lang, 'Award added', 'جایزه اضافه شد', 'جایزه اضافه شوه'));
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(getLabel(lang, 'Error', 'خطا', 'تېروتنه'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(getLabel(lang, 'Are you sure?', 'آیا مطمئن هستید؟', 'ایا تاسو ډاډه یاست؟'))) return;
    try {
      await deleteAward.mutateAsync(id);
      toast.success(getLabel(lang, 'Deleted', 'حذف شد', 'ړنګ شو'));
    } catch (error) {
      toast.error(getLabel(lang, 'Error', 'خطا', 'تېروتنه'));
    }
  };

  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />{getLabel(lang, 'Add Award', 'افزودن جایزه', 'جایزه اضافه کړئ')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAward 
                  ? getLabel(lang, 'Edit Award', 'ویرایش جایزه', 'جایزه سمول')
                  : getLabel(lang, 'Add Award', 'افزودن جایزه', 'جایزه اضافه کړئ')
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Title (English)', 'عنوان (انگلیسی)', 'سرلیک (انګلیسي)')}</Label>
                  <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Title (Persian)', 'عنوان (فارسی)', 'سرلیک (فارسي)')}</Label>
                  <Input value={formData.title_fa} onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })} dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Title (Pashto)', 'عنوان (پشتو)', 'سرلیک (پښتو)')}</Label>
                  <Input value={formData.title_ps} onChange={(e) => setFormData({ ...formData, title_ps: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Description (English)', 'توضیحات (انگلیسی)', 'تشریح (انګلیسي)')}</Label>
                  <Textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Description (Persian)', 'توضیحات (فارسی)', 'تشریح (فارسي)')}</Label>
                  <Textarea value={formData.description_fa} onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })} dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Description (Pashto)', 'توضیحات (پشتو)', 'تشریح (پښتو)')}</Label>
                  <Textarea value={formData.description_ps} onChange={(e) => setFormData({ ...formData, description_ps: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Icon', 'آیکون', 'آیکون')}</Label>
                  <Select value={formData.icon_or_image} onValueChange={(value) => setFormData({ ...formData, icon_or_image: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICONS.map(({ name, icon: Icon }) => (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center gap-2"><Icon className="h-4 w-4" /><span>{name}</span></div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Year', 'سال', 'کال')}</Label>
                  <Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })} />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Priority', 'اولویت', 'لومړیتوب')}</Label>
                  <Input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                <Label>{getLabel(lang, 'Active', 'فعال', 'فعال')}</Label>
              </div>
              <Button onClick={handleSave} className="w-full">{getLabel(lang, 'Save', 'ذخیره', 'خوندي کړئ')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {awards?.map((award) => {
          const IconComponent = ICONS.find(i => i.name === award.icon_or_image)?.icon || Star;
          const title = lang === 'ps' && award.title_ps ? award.title_ps : lang === 'fa' && award.title_fa ? award.title_fa : award.title_en;
          return (
            <Card key={award.id} className={!award.is_active ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{title}</CardTitle>
                      {award.year && <CardDescription>{award.year}</CardDescription>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(award)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(award.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminAbout;

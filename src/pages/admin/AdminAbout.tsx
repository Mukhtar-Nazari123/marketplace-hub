import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
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
  const { t, isRTL } = useLanguage();

  return (
    <AdminLayout 
      title={isRTL ? 'مدیریت صفحه درباره ما' : 'About Page Management'}
      description={isRTL ? 'ویرایش محتوای صفحه درباره ما' : 'Edit About page content'}
    >
      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sections">{isRTL ? 'بخش‌ها' : 'Sections'}</TabsTrigger>
          <TabsTrigger value="values">{isRTL ? 'ارزش‌ها' : 'Values'}</TabsTrigger>
          <TabsTrigger value="team">{isRTL ? 'تیم' : 'Team'}</TabsTrigger>
          <TabsTrigger value="awards">{isRTL ? 'جوایز' : 'Awards'}</TabsTrigger>
        </TabsList>

        <TabsContent value="sections">
          <SectionsTab isRTL={isRTL} />
        </TabsContent>

        <TabsContent value="values">
          <ValuesTab isRTL={isRTL} />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab isRTL={isRTL} />
        </TabsContent>

        <TabsContent value="awards">
          <AwardsTab isRTL={isRTL} />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

// Sections Tab
const SectionsTab = ({ isRTL }: { isRTL: boolean }) => {
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
      toast.success(isRTL ? 'بخش به‌روزرسانی شد' : 'Section updated');
      setEditingId(null);
    } catch (error) {
      toast.error(isRTL ? 'خطا در به‌روزرسانی' : 'Update failed');
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
                <CardDescription>{isRTL ? section.title_fa : section.title_en}</CardDescription>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isRTL ? 'عنوان (انگلیسی)' : 'Title (English)'}</Label>
                  <Input
                    value={formData.title_en || ''}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'عنوان (فارسی)' : 'Title (Persian)'}</Label>
                  <Input
                    value={formData.title_fa || ''}
                    onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isRTL ? 'توضیحات (انگلیسی)' : 'Description (English)'}</Label>
                  <Textarea
                    value={formData.description_en || ''}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'توضیحات (فارسی)' : 'Description (Persian)'}</Label>
                  <Textarea
                    value={formData.description_fa || ''}
                    onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })}
                    dir="rtl"
                    rows={3}
                  />
                </div>
              </div>
              {section.section_key === 'history' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'محتوای کامل (انگلیسی)' : 'Full Content (English)'}</Label>
                    <Textarea
                      value={formData.content_en || ''}
                      onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'محتوای کامل (فارسی)' : 'Full Content (Persian)'}</Label>
                    <Textarea
                      value={formData.content_fa || ''}
                      onChange={(e) => setFormData({ ...formData, content_fa: e.target.value })}
                      dir="rtl"
                      rows={5}
                    />
                  </div>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{isRTL ? 'آیکون' : 'Icon'}</Label>
                  <Select
                    value={formData.icon || ''}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? 'انتخاب آیکون' : 'Select icon'} />
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
                    <Label>{isRTL ? 'سال شروع' : 'Start Year'}</Label>
                    <Input
                      type="number"
                      value={formData.start_year || ''}
                      onChange={(e) => setFormData({ ...formData, start_year: parseInt(e.target.value) || null })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{isRTL ? 'اولویت' : 'Priority'}</Label>
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
                  {isRTL ? 'ذخیره' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setEditingId(null)}>
                  {isRTL ? 'انصراف' : 'Cancel'}
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
const ValuesTab = ({ isRTL }: { isRTL: boolean }) => {
  const { data: values, isLoading } = useAdminAboutValues();
  const createValue = useCreateAboutValue();
  const updateValue = useUpdateAboutValue();
  const deleteValue = useDeleteAboutValue();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<AboutValue | null>(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_fa: '',
    description_en: '',
    description_fa: '',
    icon: 'CheckCircle',
    priority: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_fa: '',
      description_en: '',
      description_fa: '',
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
      description_en: value.description_en || '',
      description_fa: value.description_fa || '',
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
        toast.success(isRTL ? 'ارزش به‌روزرسانی شد' : 'Value updated');
      } else {
        await createValue.mutateAsync(formData);
        toast.success(isRTL ? 'ارزش اضافه شد' : 'Value added');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(isRTL ? 'خطا' : 'Error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'آیا مطمئن هستید؟' : 'Are you sure?')) return;
    try {
      await deleteValue.mutateAsync(id);
      toast.success(isRTL ? 'حذف شد' : 'Deleted');
    } catch (error) {
      toast.error(isRTL ? 'خطا' : 'Error');
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
            <Button><Plus className="h-4 w-4 mr-2" />{isRTL ? 'افزودن ارزش' : 'Add Value'}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingValue ? (isRTL ? 'ویرایش ارزش' : 'Edit Value') : (isRTL ? 'افزودن ارزش' : 'Add Value')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isRTL ? 'عنوان (انگلیسی)' : 'Title (English)'}</Label>
                  <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'عنوان (فارسی)' : 'Title (Persian)'}</Label>
                  <Input value={formData.title_fa} onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isRTL ? 'توضیحات (انگلیسی)' : 'Description (English)'}</Label>
                  <Textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'توضیحات (فارسی)' : 'Description (Persian)'}</Label>
                  <Textarea value={formData.description_fa} onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{isRTL ? 'آیکون' : 'Icon'}</Label>
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
                  <Label>{isRTL ? 'اولویت' : 'Priority'}</Label>
                  <Input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'فعال' : 'Active'}</Label>
                  <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">{isRTL ? 'ذخیره' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {values?.map((value) => {
          const IconComponent = ICONS.find(i => i.name === value.icon)?.icon || CheckCircle;
          return (
            <Card key={value.id} className={!value.is_active ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{isRTL ? value.title_fa : value.title_en}</CardTitle>
                      <CardDescription className="text-xs">{isRTL ? value.description_fa : value.description_en}</CardDescription>
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
const TeamTab = ({ isRTL }: { isRTL: boolean }) => {
  const { data: members, isLoading } = useAdminAboutTeamMembers();
  const createMember = useCreateAboutTeamMember();
  const updateMember = useUpdateAboutTeamMember();
  const deleteMember = useDeleteAboutTeamMember();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AboutTeamMember | null>(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_fa: '',
    role_en: '',
    role_fa: '',
    description_en: '',
    description_fa: '',
    photo_url: '',
    priority: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_fa: '',
      role_en: '',
      role_fa: '',
      description_en: '',
      description_fa: '',
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
      role_en: member.role_en,
      role_fa: member.role_fa || '',
      description_en: member.description_en || '',
      description_fa: member.description_fa || '',
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
        toast.success(isRTL ? 'عضو تیم به‌روزرسانی شد' : 'Team member updated');
      } else {
        await createMember.mutateAsync(formData);
        toast.success(isRTL ? 'عضو تیم اضافه شد' : 'Team member added');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(isRTL ? 'خطا' : 'Error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'آیا مطمئن هستید؟' : 'Are you sure?')) return;
    try {
      await deleteMember.mutateAsync(id);
      toast.success(isRTL ? 'حذف شد' : 'Deleted');
    } catch (error) {
      toast.error(isRTL ? 'خطا' : 'Error');
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
            <Button><Plus className="h-4 w-4 mr-2" />{isRTL ? 'افزودن عضو' : 'Add Member'}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMember ? (isRTL ? 'ویرایش عضو' : 'Edit Member') : (isRTL ? 'افزودن عضو' : 'Add Member')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isRTL ? 'نام (انگلیسی)' : 'Name (English)'}</Label>
                  <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'نام (فارسی)' : 'Name (Persian)'}</Label>
                  <Input value={formData.name_fa} onChange={(e) => setFormData({ ...formData, name_fa: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isRTL ? 'نقش (انگلیسی)' : 'Role (English)'}</Label>
                  <Input value={formData.role_en} onChange={(e) => setFormData({ ...formData, role_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'نقش (فارسی)' : 'Role (Persian)'}</Label>
                  <Input value={formData.role_fa} onChange={(e) => setFormData({ ...formData, role_fa: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isRTL ? 'توضیحات (انگلیسی)' : 'Description (English)'}</Label>
                  <Textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'توضیحات (فارسی)' : 'Description (Persian)'}</Label>
                  <Textarea value={formData.description_fa} onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })} dir="rtl" />
                </div>
              </div>
              <ImageUpload
                label={isRTL ? 'تصویر' : 'Photo'}
                value={formData.photo_url}
                onChange={(url) => setFormData({ ...formData, photo_url: url })}
                bucket="site-assets"
                folder="team-photos"
                placeholder={isRTL ? 'تصویر عضو تیم را انتخاب کنید' : 'Select team member photo'}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isRTL ? 'اولویت' : 'Priority'}</Label>
                  <Input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'فعال' : 'Active'}</Label>
                  <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">{isRTL ? 'ذخیره' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {members?.map((member) => (
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
                  <CardTitle className="text-base">{isRTL ? member.name_fa : member.name_en}</CardTitle>
                  <CardDescription>{isRTL ? member.role_fa : member.role_en}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Awards Tab
const AwardsTab = ({ isRTL }: { isRTL: boolean }) => {
  const { data: awards, isLoading } = useAdminAboutAwards();
  const createAward = useCreateAboutAward();
  const updateAward = useUpdateAboutAward();
  const deleteAward = useDeleteAboutAward();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<AboutAward | null>(null);
  const [formData, setFormData] = useState({
    title_en: '',
    title_fa: '',
    description_en: '',
    description_fa: '',
    year: new Date().getFullYear(),
    icon_or_image: 'Star',
    priority: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_fa: '',
      description_en: '',
      description_fa: '',
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
      description_en: award.description_en || '',
      description_fa: award.description_fa || '',
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
        toast.success(isRTL ? 'جایزه به‌روزرسانی شد' : 'Award updated');
      } else {
        await createAward.mutateAsync(formData);
        toast.success(isRTL ? 'جایزه اضافه شد' : 'Award added');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(isRTL ? 'خطا' : 'Error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'آیا مطمئن هستید؟' : 'Are you sure?')) return;
    try {
      await deleteAward.mutateAsync(id);
      toast.success(isRTL ? 'حذف شد' : 'Deleted');
    } catch (error) {
      toast.error(isRTL ? 'خطا' : 'Error');
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
            <Button><Plus className="h-4 w-4 mr-2" />{isRTL ? 'افزودن جایزه' : 'Add Award'}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAward ? (isRTL ? 'ویرایش جایزه' : 'Edit Award') : (isRTL ? 'افزودن جایزه' : 'Add Award')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isRTL ? 'عنوان (انگلیسی)' : 'Title (English)'}</Label>
                  <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'عنوان (فارسی)' : 'Title (Persian)'}</Label>
                  <Input value={formData.title_fa} onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isRTL ? 'توضیحات (انگلیسی)' : 'Description (English)'}</Label>
                  <Textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'توضیحات (فارسی)' : 'Description (Persian)'}</Label>
                  <Textarea value={formData.description_fa} onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })} dir="rtl" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{isRTL ? 'آیکون' : 'Icon'}</Label>
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
                  <Label>{isRTL ? 'سال' : 'Year'}</Label>
                  <Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })} />
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'اولویت' : 'Priority'}</Label>
                  <Input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                <Label>{isRTL ? 'فعال' : 'Active'}</Label>
              </div>
              <Button onClick={handleSave} className="w-full">{isRTL ? 'ذخیره' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {awards?.map((award) => {
          const IconComponent = ICONS.find(i => i.name === award.icon_or_image)?.icon || Star;
          return (
            <Card key={award.id} className={!award.is_active ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{isRTL ? award.title_fa : award.title_en}</CardTitle>
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

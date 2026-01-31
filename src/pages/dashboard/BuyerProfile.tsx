import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import type { Json } from '@/integrations/supabase/types';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Camera,
  Shield,
  Globe,
  Palette,
  Save,
  X,
  Check,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Tag,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface Address {
  id: string;
  title: string;
  fullAddress: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

const BuyerProfile = () => {
  const { user } = useAuth();
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { toast } = useToast();

  // Helper for trilingual support
  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  // Personal Info State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({});
  const [isSavingAddresses, setIsSavingAddresses] = useState(false);

  // Preferences State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setFullName(user.user_metadata?.full_name || '');
      fetchProfile();
    }
    // Check current theme
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setFullName(data.full_name || '');
      setAvatarUrl(data.avatar_url || '');
      setPhone(data.phone || '');
      const savedAddresses = data.addresses as unknown as Address[] | null;
      if (savedAddresses && Array.isArray(savedAddresses)) {
        setAddresses(savedAddresses);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          phone: phone,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: getLabel('Success', 'موفقیت', 'بریالیتوب'),
        description: getLabel('Profile saved successfully', 'پروفایل با موفقیت ذخیره شد', 'پروفایل په بریالیتوب سره خوندي شو'),
      });
      setIsEditingProfile(false);
    } catch {
      toast({
        title: getLabel('Error', 'خطا', 'تېروتنه'),
        description: getLabel('Failed to save profile', 'خطا در ذخیره پروفایل', 'د پروفایل خوندي کولو کې تېروتنه'),
        variant: 'destructive',
      });
    } finally {
    setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: getLabel('Error', 'خطا', 'تېروتنه'),
        description: getLabel('Please select an image file', 'لطفاً یک فایل تصویر انتخاب کنید', 'مهرباني وکړئ یو انځور فایل وټاکئ'),
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: getLabel('Error', 'خطا', 'تېروتنه'),
        description: getLabel('Image must be less than 5MB', 'حجم تصویر باید کمتر از ۵ مگابایت باشد', 'انځور باید له ۵ میګابایټ څخه کم وي'),
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatars/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      // Update avatar URL in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: getLabel('Success', 'موفقیت', 'بریالیتوب'),
        description: getLabel('Profile photo uploaded successfully', 'تصویر پروفایل با موفقیت آپلود شد', 'د پروفایل انځور په بریالیتوب سره اپلوډ شو'),
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: getLabel('Error', 'خطا', 'تېروتنه'),
        description: getLabel('Failed to upload image', 'خطا در آپلود تصویر', 'د انځور اپلوډ کولو کې تېروتنه'),
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: getLabel('Error', 'خطا', 'تېروتنه'),
        description: getLabel('Passwords do not match', 'رمزهای عبور مطابقت ندارند', 'پاسورډونه سره سمون نه خوري'),
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({
        title: getLabel('Success', 'موفقیت', 'بریالیتوب'),
        description: getLabel('Password changed successfully', 'رمز عبور با موفقیت تغییر کرد', 'پاسورډ په بریالیتوب سره بدل شو'),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast({
        title: getLabel('Error', 'خطا', 'تېروتنه'),
        description: getLabel('Failed to change password', 'خطا در تغییر رمز عبور', 'د پاسورډ بدلولو کې تېروتنه'),
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    setIsChangingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;

      toast({
        title: getLabel('Success', 'موفقیت', 'بریالیتوب'),
        description: getLabel('Confirmation email sent to new address', 'ایمیل تأیید به آدرس جدید ارسال شد', 'تایید بریښنالیک نوې پتې ته واستول شو'),
      });
      setNewEmail('');
    } catch {
      toast({
        title: getLabel('Error', 'خطا', 'تېروتنه'),
        description: getLabel('Failed to change email', 'خطا در تغییر ایمیل', 'د بریښنالیک بدلولو کې تېروتنه'),
        variant: 'destructive',
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  };

  const saveAddressesToDb = async (updatedAddresses: Address[]) => {
    if (!user) return;
    setIsSavingAddresses(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ addresses: updatedAddresses as unknown as Json })
        .eq('user_id', user.id);
      if (error) throw error;
    } catch (err) {
      console.error('Error saving addresses:', err);
      toast({
        title: getLabel('Error', 'خطا', 'تېروتنه'),
        description: getLabel('Failed to save address', 'خطا در ذخیره آدرس', 'د پتې خوندي کولو کې تېروتنه'),
        variant: 'destructive',
      });
    } finally {
      setIsSavingAddresses(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.title || !newAddress.fullAddress) return;
    
    const address: Address = {
      id: Date.now().toString(),
      title: newAddress.title,
      fullAddress: newAddress.fullAddress,
      city: newAddress.city || '',
      postalCode: newAddress.postalCode || '',
      isDefault: addresses.length === 0,
    };
    
    const updatedAddresses = [...addresses, address];
    setAddresses(updatedAddresses);
    setNewAddress({});
    setIsAddingAddress(false);
    await saveAddressesToDb(updatedAddresses);
    toast({
      title: getLabel('Success', 'موفقیت', 'بریالیتوب'),
      description: getLabel('Address added', 'آدرس اضافه شد', 'پته اضافه شوه'),
    });
  };

  const handleDeleteAddress = async (id: string) => {
    const updatedAddresses = addresses.filter(a => a.id !== id);
    setAddresses(updatedAddresses);
    await saveAddressesToDb(updatedAddresses);
    toast({
      title: getLabel('Deleted', 'حذف شد', 'لرې شو'),
      description: getLabel('Address removed', 'آدرس حذف شد', 'پته لرې شوه'),
    });
  };

  const handleSetDefaultAddress = async (id: string) => {
    const updatedAddresses = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    setAddresses(updatedAddresses);
    await saveAddressesToDb(updatedAddresses);
  };

  const personalInfoText = getLabel('Personal Information', 'اطلاعات شخصی', 'شخصي معلومات');
  const securityText = getLabel('Account Security', 'امنیت حساب', 'د حساب امنیت');
  const addressesText = getLabel('Addresses', 'آدرس‌ها', 'پتې');
  const preferencesText = getLabel('Preferences', 'تنظیمات', 'غوره توبونه');

  return (
    <DashboardLayout 
      title={getLabel('My Profile', 'پروفایل من', 'زما پروفایل')} 
      description={getLabel('Manage your account information', 'مدیریت اطلاعات حساب', 'د خپل حساب معلومات اداره کړئ')}
      allowedRoles={['buyer', 'admin', 'seller', 'moderator']}
    >
      <div className={`max-w-4xl mx-auto space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger 
              value="personal" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 rounded-lg flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{personalInfoText}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 rounded-lg flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{securityText}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="addresses"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 rounded-lg flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">{addressesText}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preferences"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300 rounded-lg flex items-center gap-2"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">{preferencesText}</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="animate-fade-in">
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {personalInfoText}
                    </CardTitle>
                    <CardDescription>
                      {getLabel('Manage your profile information', 'اطلاعات پروفایل خود را مدیریت کنید', 'د خپل پروفایل معلومات اداره کړئ')}
                    </CardDescription>
                  </div>
                  {!isEditingProfile ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditingProfile(true)}
                      className="transition-all hover:scale-105"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {getLabel('Edit', 'ویرایش', 'سمون')}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsEditingProfile(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="transition-all hover:scale-105"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isSavingProfile ? getLabel('Saving...', 'ذخیره...', 'خوندي کول...') : getLabel('Save', 'ذخیره', 'خوندي کړئ')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                        {fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditingProfile && (
                      <button 
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        {isUploadingAvatar ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                        ) : (
                          <Camera className="h-6 w-6 text-white" />
                        )}
                      </button>
                    )}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{fullName || getLabel('No name set', 'نام وارد نشده', 'نوم ندی ثبت شوی')}</h3>
                    <p className="text-muted-foreground">{email}</p>
                    <Badge variant="secondary" className="mt-2">
                      {getLabel('Buyer', 'خریدار', 'پېرودونکی')}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {getLabel('Full Name', 'نام کامل', 'بشپړ نوم')}
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditingProfile}
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {getLabel('Email', 'ایمیل', 'بریښنالیک')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {getLabel('Phone', 'تلفن', 'تلیفون')}
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditingProfile}
                      placeholder={isRTL ? '+93 7XX XXX XXX' : '+93 7XX XXX XXX'}
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                      dir="ltr"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 animate-fade-in">
            {/* Change Password */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  {getLabel('Change Password', 'تغییر رمز عبور', 'پاسورډ بدل کړئ')}
                </CardTitle>
                <CardDescription>
                  {getLabel('Choose a new password', 'رمز عبور جدید انتخاب کنید', 'نوی پاسورډ وټاکئ')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{getLabel('Current Password', 'رمز عبور فعلی', 'اوسنی پاسورډ')}</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{getLabel('New Password', 'رمز عبور جدید', 'نوی پاسورډ')}</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPassword && <PasswordStrengthIndicator password={newPassword} language={language} />}
                </div>
                <div className="space-y-2">
                  <Label>{getLabel('Confirm New Password', 'تکرار رمز عبور جدید', 'نوی پاسورډ تایید کړئ')}</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-destructive">
                      {getLabel('Passwords do not match', 'رمزها مطابقت ندارند', 'پاسورډونه سره سمون نه خوري')}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={isChangingPassword || !newPassword || newPassword !== confirmPassword}
                  className="transition-all hover:scale-105"
                >
                  {isChangingPassword ? getLabel('Changing...', 'در حال تغییر...', 'بدلول...') : getLabel('Change Password', 'تغییر رمز عبور', 'پاسورډ بدل کړئ')}
                </Button>
              </CardContent>
            </Card>

            {/* Change Email */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {getLabel('Change Email', 'تغییر ایمیل', 'بریښنالیک بدل کړئ')}
                </CardTitle>
                <CardDescription>
                  {getLabel('Enter your new email address', 'ایمیل جدید وارد کنید', 'خپل نوی بریښنالیک پته دننه کړئ')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{getLabel('Current Email', 'ایمیل فعلی', 'اوسنی بریښنالیک')}</Label>
                  <Input value={email} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label>{getLabel('New Email', 'ایمیل جدید', 'نوی بریښنالیک')}</Label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder={getLabel('New email address', 'ایمیل جدید', 'نوی بریښنالیک پته')}
                  />
                </div>
                <Button 
                  onClick={handleChangeEmail} 
                  disabled={isChangingEmail || !newEmail}
                  className="transition-all hover:scale-105"
                >
                  {isChangingEmail ? getLabel('Changing...', 'در حال تغییر...', 'بدلول...') : getLabel('Change Email', 'تغییر ایمیل', 'بریښنالیک بدل کړئ')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="animate-fade-in">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {addressesText}
                    </CardTitle>
                    <CardDescription>
                      {getLabel('Manage your saved addresses', 'آدرس‌های ذخیره شده را مدیریت کنید', 'خپلې خوندي شوې پتې اداره کړئ')}
                    </CardDescription>
                  </div>
                  <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="transition-all hover:scale-105">
                        <Plus className="h-4 w-4 mr-2" />
                        {getLabel('Add Address', 'افزودن آدرس', 'پته اضافه کړئ')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="animate-scale-in">
                      <DialogHeader>
                        <DialogTitle>{getLabel('Add New Address', 'افزودن آدرس جدید', 'نوې پته اضافه کړئ')}</DialogTitle>
                        <DialogDescription>
                          {getLabel('Enter address details', 'اطلاعات آدرس را وارد کنید', 'د پتې توضیحات دننه کړئ')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>{getLabel('Title', 'عنوان', 'سرلیک')}</Label>
                          <Input
                            value={newAddress.title || ''}
                            onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                            placeholder={getLabel('e.g., Home', 'مثال: خانه', 'لکه: کور')}
                            dir={isRTL ? 'rtl' : 'ltr'}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{getLabel('Full Address', 'آدرس کامل', 'بشپړه پته')}</Label>
                          <Input
                            value={newAddress.fullAddress || ''}
                            onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })}
                            dir={isRTL ? 'rtl' : 'ltr'}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{getLabel('City', 'شهر', 'ښار')}</Label>
                            <Input
                              value={newAddress.city || ''}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              dir={isRTL ? 'rtl' : 'ltr'}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{getLabel('Postal Code', 'کد پستی', 'پوستي کوډ')}</Label>
                            <Input
                              value={newAddress.postalCode || ''}
                              onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
                        <Button variant="outline" onClick={() => setIsAddingAddress(false)}>
                          {getLabel('Cancel', 'انصراف', 'لغوه کړئ')}
                        </Button>
                        <Button onClick={handleAddAddress}>
                          {getLabel('Save', 'ذخیره', 'خوندي کړئ')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {addresses.map((address, index) => (
                    <div
                      key={address.id}
                      className={`relative p-4 rounded-xl border transition-all duration-300 hover:shadow-md hover:border-primary/30 ${
                        address.isDefault ? 'border-primary/50 bg-primary/5' : 'border-border'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {address.isDefault && (
                        <Badge className="absolute top-2 right-2" variant="default">
                          {getLabel('Default', 'پیش‌فرض', 'اصلي')}
                        </Badge>
                      )}
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        {address.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-1">{address.fullAddress}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.city} - {address.postalCode}
                      </p>
                      <div className={`flex gap-2 mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {!address.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {getLabel('Set Default', 'پیش‌فرض', 'اصلي کړئ')}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="animate-fade-in">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  {preferencesText}
                </CardTitle>
                <CardDescription>
                  {getLabel('Customize appearance and language settings', 'تنظیمات ظاهری و زبان را سفارشی کنید', 'د بڼې او ژبې تنظیمات تنظیم کړئ')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 transition-all hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{getLabel('Language', 'زبان', 'ژبه')}</p>
                      <p className="text-sm text-muted-foreground">
                        {getLabel('Choose display language', 'زبان نمایش را انتخاب کنید', 'د ښودلو ژبه وټاکئ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={language === 'en' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLanguage('en')}
                      className="transition-all"
                    >
                      English
                    </Button>
                    <Button
                      variant={language === 'fa' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLanguage('fa')}
                      className="transition-all"
                    >
                      دری
                    </Button>
                    <Button
                      variant={language === 'ps' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLanguage('ps')}
                      className="transition-all"
                    >
                      پښتو
                    </Button>
                  </div>
                </div>

                {/* Theme */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 transition-all hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium">{getLabel('Theme', 'تم', 'بڼه')}</p>
                      <p className="text-sm text-muted-foreground">
                        {isDarkMode ? getLabel('Dark Mode', 'حالت تاریک', 'تیاره بڼه') : getLabel('Light Mode', 'حالت روشن', 'روښانه بڼه')}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={handleThemeToggle}
                    className="data-[state=checked]:bg-primary transition-all"
                  />
                </div>

                <Separator />

                {/* Notifications */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 transition-all hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{getLabel('Email Notifications', 'اعلان‌های ایمیلی', 'بریښنالیک خبرتیاوې')}</p>
                      <p className="text-sm text-muted-foreground">
                        {getLabel('Receive order notifications', 'دریافت اعلان برای سفارشات', 'د امرونو خبرتیاوې ترلاسه کړئ')}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                    className="data-[state=checked]:bg-primary transition-all"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 transition-all hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{getLabel('Marketing Emails', 'ایمیل‌های تبلیغاتی', 'بازاریابي بریښنالیکونه')}</p>
                      <p className="text-sm text-muted-foreground">
                        {getLabel('Receive special offers', 'دریافت پیشنهادات ویژه', 'ځانګړي وړاندیزونه ترلاسه کړئ')}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                    className="data-[state=checked]:bg-primary transition-all"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BuyerProfile;

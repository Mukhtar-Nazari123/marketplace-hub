import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { ProfileStepper } from '@/components/seller/ProfileStepper';
import { PersonalInfoStep } from '@/components/seller/steps/PersonalInfoStep';
import { StoreDetailsStep } from '@/components/seller/steps/StoreDetailsStep';
import { PoliciesStep } from '@/components/seller/steps/PoliciesStep';
import { ReviewStep } from '@/components/seller/steps/ReviewStep';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Personal Info', titleFa: 'اطلاعات شخصی' },
  { id: 2, title: 'Store Details', titleFa: 'اطلاعات فروشگاه' },
  { id: 3, title: 'Policies', titleFa: 'سیاست‌ها' },
  { id: 4, title: 'Review', titleFa: 'بررسی نهایی' }
];

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

interface StoreDetails {
  businessName: string;
  storeLogo: string;
  storeBanner: string;
  businessDescription: string;
  businessType: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

interface Policies {
  returnPolicy: string;
  shippingPolicy: string;
  storeVisible: boolean;
}

const SellerProfileComplete = () => {
  const { user, role, loading: authLoading } = useAuth();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: ''
  });

  const [storeDetails, setStoreDetails] = useState<StoreDetails>({
    businessName: '',
    storeLogo: '',
    storeBanner: '',
    businessDescription: '',
    businessType: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });

  const [policies, setPolicies] = useState<Policies>({
    returnPolicy: '',
    shippingPolicy: '',
    storeVisible: true
  });

  // Load existing data
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setPersonalInfo(prev => ({
          ...prev,
          fullName: profile.full_name || '',
          email: profile.email || user.email || '',
          avatarUrl: profile.avatar_url || ''
        }));
      } else {
        setPersonalInfo(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }

      // Load seller verification data
      const { data: verification } = await supabase
        .from('seller_verifications')
        .select('*')
        .eq('seller_id', user.id)
        .maybeSingle();

      if (verification) {
        setPersonalInfo(prev => ({
          ...prev,
          phone: verification.phone || ''
        }));
        
        const address = verification.address as { street?: string } | null;
        setStoreDetails({
          businessName: verification.business_name || '',
          storeLogo: verification.store_logo || '',
          storeBanner: verification.store_banner || '',
          businessDescription: verification.business_description || '',
          businessType: verification.business_type || '',
          contactEmail: verification.contact_email || '',
          contactPhone: verification.contact_phone || '',
          address: address?.street || ''
        });

        setPolicies({
          returnPolicy: verification.return_policy || '',
          shippingPolicy: verification.shipping_policy || '',
          storeVisible: verification.store_visible ?? true
        });

        // Resume from saved step
        if (verification.completion_step && verification.completion_step > 0) {
          setCurrentStep(Math.min(verification.completion_step + 1, 4));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (role !== 'seller') {
        navigate('/');
      } else {
        loadData();
      }
    }
  }, [user, role, authLoading, navigate, loadData]);

  // Auto-save progress
  const saveProgress = useCallback(async (step: number) => {
    if (!user || saving) return;

    setSaving(true);
    try {
      // Update profile
      await supabase
        .from('profiles')
        .update({
          full_name: personalInfo.fullName,
          avatar_url: personalInfo.avatarUrl
        })
        .eq('user_id', user.id);

      // Update seller verification
      await supabase
        .from('seller_verifications')
        .update({
          phone: personalInfo.phone,
          business_name: storeDetails.businessName,
          store_logo: storeDetails.storeLogo,
          store_banner: storeDetails.storeBanner,
          business_description: storeDetails.businessDescription,
          business_type: storeDetails.businessType,
          contact_email: storeDetails.contactEmail,
          contact_phone: storeDetails.contactPhone,
          address: { street: storeDetails.address },
          return_policy: policies.returnPolicy,
          shipping_policy: policies.shippingPolicy,
          store_visible: policies.storeVisible,
          completion_step: step
        })
        .eq('seller_id', user.id);

    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSaving(false);
    }
  }, [user, saving, personalInfo, storeDetails, policies]);

  const handleNext = async () => {
    await saveProgress(currentStep);
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      // Mark profile as completed
      const { error } = await supabase
        .from('seller_verifications')
        .update({
          phone: personalInfo.phone,
          business_name: storeDetails.businessName,
          store_logo: storeDetails.storeLogo,
          store_banner: storeDetails.storeBanner,
          business_description: storeDetails.businessDescription,
          business_type: storeDetails.businessType,
          contact_email: storeDetails.contactEmail,
          contact_phone: storeDetails.contactPhone,
          address: { street: storeDetails.address },
          return_policy: policies.returnPolicy,
          shipping_policy: policies.shippingPolicy,
          store_visible: policies.storeVisible,
          profile_completed: true,
          completion_step: 4,
          status: 'pending' // Ensure status is pending for admin review
        })
        .eq('seller_id', user.id);

      if (error) throw error;

      // Update profile
      await supabase
        .from('profiles')
        .update({
          full_name: personalInfo.fullName,
          avatar_url: personalInfo.avatarUrl
        })
        .eq('user_id', user.id);

      toast({
        title: isRTL ? 'پروفایل ارسال شد' : 'Profile Submitted',
        description: isRTL 
          ? 'درخواست شما برای بررسی ارسال شد. به زودی نتیجه به شما اطلاع داده می‌شود.' 
          : 'Your request has been submitted for review. You will be notified soon.'
      });

      navigate('/dashboard/seller/pending');
    } catch (error) {
      console.error('Error submitting profile:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'خطا در ارسال پروفایل. لطفاً دوباره تلاش کنید.' : 'Failed to submit profile. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", isRTL && "rtl")}>
      <TopBar />
      <Header />
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress indicator */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <ProfileStepper 
                steps={STEPS} 
                currentStep={currentStep} 
                onStepClick={handleStepClick}
              />
            </CardContent>
          </Card>

          {/* Step content */}
          <Card>
            <CardContent className="pt-6">
              {saving && (
                <div className={cn(
                  "absolute top-4 text-xs text-muted-foreground flex items-center gap-1",
                  isRTL ? "left-4" : "right-4"
                )}>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {isRTL ? 'در حال ذخیره...' : 'Saving...'}
                </div>
              )}

              {currentStep === 1 && (
                <PersonalInfoStep
                  data={personalInfo}
                  onUpdate={(data) => setPersonalInfo(prev => ({ ...prev, ...data }))}
                  onNext={handleNext}
                />
              )}

              {currentStep === 2 && (
                <StoreDetailsStep
                  data={storeDetails}
                  onUpdate={(data) => setStoreDetails(prev => ({ ...prev, ...data }))}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 3 && (
                <PoliciesStep
                  data={policies}
                  onUpdate={(data) => setPolicies(prev => ({ ...prev, ...data }))}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 4 && (
                <ReviewStep
                  personalInfo={personalInfo}
                  storeDetails={storeDetails}
                  policies={policies}
                  onEditStep={setCurrentStep}
                  onBack={handleBack}
                  onSubmit={handleSubmit}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SellerProfileComplete;

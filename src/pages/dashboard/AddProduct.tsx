import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useSellerStatus } from '@/hooks/useSellerStatus';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductStepper } from '@/components/products/add/ProductStepper';
import { CategoryStep } from '@/components/products/add/CategoryStep';
import { BasicInfoStep } from '@/components/products/add/BasicInfoStep';
import { MediaStep } from '@/components/products/add/MediaStep';
import { PricingStep } from '@/components/products/add/PricingStep';
import { ReviewStep } from '@/components/products/add/ReviewStep';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Save, Send, FileText } from 'lucide-react';
import { generateSKU } from '@/lib/skuGenerator';
import { cn } from '@/lib/utils';

export type CurrencyType = 'AFN' | 'USD';

export interface ProductFormData {
  // Category
  categoryId: string;
  categoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  
  // Basic Info
  name: string;
  shortDescription: string;
  description: string;
  brand: string;
  
  // Category-specific attributes
  attributes: Record<string, string | boolean | string[]>;
  
  // Media
  images: File[];
  imageUrls: string[];
  video: File | null;
  videoUrl: string;
  
  // Pricing & Inventory
  price: number;
  priceUSD: number;
  discountPrice: number | null;
  discountPriceUSD: number | null;
  currency: CurrencyType;
  quantity: number;
  stockPerSize?: Record<string, number>;
  deliveryFee: number;
}

const initialFormData: ProductFormData = {
  categoryId: '',
  categoryName: '',
  subCategoryId: '',
  subCategoryName: '',
  name: '',
  shortDescription: '',
  description: '',
  brand: '',
  attributes: {},
  images: [],
  imageUrls: [],
  video: null,
  videoUrl: '',
  price: 0,
  priceUSD: 0,
  discountPrice: null,
  discountPriceUSD: null,
  currency: 'AFN',
  quantity: 0,
  stockPerSize: {},
  deliveryFee: 0,
};

const STEPS = [
  { id: 1, title: 'Category', titleFa: 'دسته‌بندی' },
  { id: 2, title: 'Basic Info', titleFa: 'اطلاعات پایه' },
  { id: 3, title: 'Media', titleFa: 'رسانه' },
  { id: 4, title: 'Pricing', titleFa: 'قیمت‌گذاری' },
  { id: 5, title: 'Review', titleFa: 'بررسی' },
];

const AddProduct = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { status: sellerStatus } = useSellerStatus();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const isVerifiedSeller = sellerStatus === 'approved';

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.categoryId;
      case 2:
        return !!formData.name && formData.name.length >= 3;
      case 3:
        return formData.images.length > 0 || formData.imageUrls.length > 0;
      case 4:
        return formData.price > 0 && formData.deliveryFee >= 0;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const canProceed = validateStep(currentStep);

  const nextStep = () => {
    if (currentStep < 5 && canProceed) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  const uploadMedia = async (): Promise<{ imageUrls: string[]; videoUrl: string }> => {
    setIsUploading(true);
    const uploadedImageUrls: string[] = [...formData.imageUrls];
    let uploadedVideoUrl = formData.videoUrl;

    try {
      // Upload images - path must start with user ID for RLS policy
      for (const image of formData.images) {
        const fileName = `${user?.id}/products/${Date.now()}-${image.name}`;
        const { data, error } = await supabase.storage
          .from('seller-assets')
          .upload(fileName, image);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('seller-assets')
          .getPublicUrl(fileName);

        uploadedImageUrls.push(urlData.publicUrl);
      }

      // Upload video if exists - path must start with user ID for RLS policy
      if (formData.video) {
        const fileName = `${user?.id}/videos/${Date.now()}-${formData.video.name}`;
        const { data, error } = await supabase.storage
          .from('seller-assets')
          .upload(fileName, formData.video);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('seller-assets')
          .getPublicUrl(fileName);

        uploadedVideoUrl = urlData.publicUrl;
      }

      return { imageUrls: uploadedImageUrls, videoUrl: uploadedVideoUrl };
    } finally {
      setIsUploading(false);
    }
  };

  const saveDraft = async (silent = false) => {
    if (!user) return;

    try {
      const { imageUrls, videoUrl } = formData.images.length > 0 || formData.video
        ? await uploadMedia()
        : { imageUrls: formData.imageUrls, videoUrl: formData.videoUrl };

      // Generate SKU automatically
      const generatedSKU = generateSKU(formData.categoryId, formData.categoryName, formData.name || 'DRAFT');

      const productData = {
        seller_id: user.id,
        name: formData.name || 'Untitled Draft',
        slug: formData.name ? formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() : `draft-${Date.now()}`,
        description: formData.description,
        price: formData.price || 0,
        compare_at_price: formData.discountPrice,
        quantity: formData.quantity,
        sku: generatedSKU,
        category_id: formData.categoryId || null,
        subcategory_id: formData.subCategoryId || null,
        images: imageUrls,
        status: 'draft' as const,
        delivery_fee: formData.deliveryFee || 0,
        metadata: {
          shortDescription: formData.shortDescription,
          brand: formData.brand,
          attributes: formData.attributes,
          videoUrl,
          stockPerSize: formData.stockPerSize,
          categoryName: formData.categoryName,
          subCategoryName: formData.subCategoryName,
          priceUSD: formData.priceUSD,
          discountPriceUSD: formData.discountPriceUSD,
          currency: formData.currency,
        },
      };

      if (draftId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', draftId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single();

        if (error) throw error;
        setDraftId(data.id);
      }

      if (!silent) {
        toast.success(isRTL ? 'پیش‌نویس ذخیره شد' : 'Draft saved');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      if (!silent) {
        toast.error(isRTL ? 'خطا در ذخیره پیش‌نویس' : 'Error saving draft');
      }
    }
  };

  const submitProduct = async (asDraft = false) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const { imageUrls, videoUrl } = formData.images.length > 0 || formData.video
        ? await uploadMedia()
        : { imageUrls: formData.imageUrls, videoUrl: formData.videoUrl };

      if (imageUrls.length === 0) {
        toast.error(isRTL ? 'حداقل یک تصویر لازم است' : 'At least one image is required');
        setIsSubmitting(false);
        return;
      }

      let status = 'draft';
      if (!asDraft) {
        status = isVerifiedSeller ? 'pending' : 'draft';
      }

      // Generate SKU automatically
      const generatedSKU = generateSKU(formData.categoryId, formData.categoryName, formData.name);

      const productData = {
        seller_id: user.id,
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        description: formData.description,
        price: formData.price,
        compare_at_price: formData.discountPrice,
        quantity: formData.quantity,
        sku: generatedSKU,
        category_id: formData.categoryId || null,
        subcategory_id: formData.subCategoryId || null,
        images: imageUrls,
        status: status as 'draft' | 'pending' | 'active',
        delivery_fee: formData.deliveryFee || 0,
        metadata: {
          shortDescription: formData.shortDescription,
          brand: formData.brand,
          attributes: formData.attributes,
          videoUrl,
          stockPerSize: formData.stockPerSize,
          categoryName: formData.categoryName,
          subCategoryName: formData.subCategoryName,
          priceUSD: formData.priceUSD,
          discountPriceUSD: formData.discountPriceUSD,
          currency: formData.currency,
        },
      };

      if (draftId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', draftId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
      }

      if (asDraft) {
        toast.success(isRTL ? 'پیش‌نویس ذخیره شد' : 'Draft saved successfully');
      } else if (isVerifiedSeller) {
        toast.success(isRTL ? 'محصول برای بررسی ارسال شد' : 'Product submitted for review');
      } else {
        toast.info(isRTL ? 'محصول به عنوان پیش‌نویس ذخیره شد. پس از تأیید حساب می‌توانید منتشر کنید.' : 'Product saved as draft. You can publish after account verification.');
      }

      navigate('/dashboard/seller/products');
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error(isRTL ? 'خطا در ارسال محصول' : 'Error submitting product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CategoryStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <MediaStep formData={formData} updateFormData={updateFormData} isUploading={isUploading} />;
      case 4:
        return <PricingStep formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title={isRTL ? 'افزودن محصول' : 'Add Product'}
      description={isRTL ? 'محصول جدید به فروشگاه اضافه کنید' : 'Add a new product to your store'}
      allowedRoles={['seller']}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Seller verification warning */}
        {!isVerifiedSeller && (
          <Card className="p-4 border-warning/50 bg-warning/10">
            <p className="text-sm text-warning-foreground">
              {isRTL
                ? 'حساب شما هنوز تأیید نشده است. می‌توانید محصولات را به عنوان پیش‌نویس ذخیره کنید اما قادر به انتشار نیستید.'
                : 'Your account is not verified yet. You can save products as drafts but cannot publish them.'}
            </p>
          </Card>
        )}

        {/* Stepper */}
        <Card className="p-6">
          <ProductStepper steps={STEPS} currentStep={currentStep} onStepClick={goToStep} />
        </Card>

        {/* Step Content */}
        <Card className="p-6 animate-fade-in">
          {renderStep()}
        </Card>

        {/* Navigation Buttons */}
        <div className={cn(
          "flex gap-4",
          isRTL ? "flex-row-reverse" : "flex-row",
          "justify-between"
        )}>
          <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="gap-2"
              >
                {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                {isRTL ? 'قبلی' : 'Previous'}
              </Button>
            )}
          </div>

          <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
            <Button
              variant="outline"
              onClick={() => saveDraft()}
              disabled={isSubmitting || !formData.name}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isRTL ? 'ذخیره پیش‌نویس' : 'Save Draft'}
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed}
                className="gap-2"
              >
                {isRTL ? 'بعدی' : 'Next'}
                {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => submitProduct(true)}
                  disabled={isSubmitting || isUploading}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {isRTL ? 'ذخیره پیش‌نویس' : 'Save as Draft'}
                </Button>
                <Button
                  onClick={() => submitProduct(false)}
                  disabled={isSubmitting || isUploading || !canProceed}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting
                    ? (isRTL ? 'در حال ارسال...' : 'Submitting...')
                    : isVerifiedSeller
                      ? (isRTL ? 'ارسال برای بررسی' : 'Submit for Review')
                      : (isRTL ? 'ذخیره (نیاز به تأیید)' : 'Save (Needs Verification)')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddProduct;

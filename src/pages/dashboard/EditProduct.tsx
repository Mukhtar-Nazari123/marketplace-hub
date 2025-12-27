import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, Save, Send, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductFormData } from './AddProduct';

const STEPS = [
  { id: 1, title: 'Category', titleFa: 'دسته‌بندی' },
  { id: 2, title: 'Basic Info', titleFa: 'اطلاعات پایه' },
  { id: 3, title: 'Media', titleFa: 'رسانه' },
  { id: 4, title: 'Pricing', titleFa: 'قیمت‌گذاری' },
  { id: 5, title: 'Review', titleFa: 'بررسی' },
];

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
};

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { status: sellerStatus } = useSellerStatus();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const isVerifiedSeller = sellerStatus === 'approved';

  useEffect(() => {
    if (id && user) {
      fetchProduct();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('seller_id', user?.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error(isRTL ? 'محصول یافت نشد' : 'Product not found');
        navigate('/dashboard/seller/products');
        return;
      }

      const metadata = (data.metadata as Record<string, unknown>) || {};
      
      setFormData({
        categoryId: (metadata.categoryId as string) || '',
        categoryName: (metadata.categoryName as string) || '',
        subCategoryId: (metadata.subCategoryId as string) || '',
        subCategoryName: (metadata.subCategoryName as string) || '',
        name: data.name,
        shortDescription: (metadata.shortDescription as string) || '',
        description: data.description || '',
        brand: (metadata.brand as string) || '',
        attributes: (metadata.attributes as Record<string, string | boolean | string[]>) || {},
        images: [],
        imageUrls: data.images || [],
        video: null,
        videoUrl: (metadata.videoUrl as string) || '',
        price: data.price,
        priceUSD: (metadata.priceUSD as number) || 0,
        discountPrice: data.compare_at_price,
        discountPriceUSD: (metadata.discountPriceUSD as number) || null,
        currency: (metadata.currency as 'AFN' | 'USD') || 'AFN',
        quantity: data.quantity,
        stockPerSize: (metadata.stockPerSize as Record<string, number>) || {},
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(isRTL ? 'خطا در دریافت محصول' : 'Error fetching product');
      navigate('/dashboard/seller/products');
    } finally {
      setLoading(false);
    }
  };

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
        return formData.price > 0;
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
      for (const image of formData.images) {
        const fileName = `${user?.id}/products/${Date.now()}-${image.name}`;
        const { error } = await supabase.storage
          .from('seller-assets')
          .upload(fileName, image);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('seller-assets')
          .getPublicUrl(fileName);

        uploadedImageUrls.push(urlData.publicUrl);
      }

      if (formData.video) {
        const fileName = `${user?.id}/videos/${Date.now()}-${formData.video.name}`;
        const { error } = await supabase.storage
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

  const updateProduct = async (asDraft = false) => {
    if (!user || !id) return;

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

      let status = asDraft ? 'draft' : (isVerifiedSeller ? 'pending' : 'draft');

      const productData = {
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        description: formData.description,
        price: formData.price,
        compare_at_price: formData.discountPrice,
        quantity: formData.quantity,
        category_id: null,
        images: imageUrls,
        status,
        metadata: {
          shortDescription: formData.shortDescription,
          brand: formData.brand,
          attributes: formData.attributes,
          videoUrl,
          stockPerSize: formData.stockPerSize,
          categoryId: formData.categoryId,
          categoryName: formData.categoryName,
          subCategoryId: formData.subCategoryId,
          subCategoryName: formData.subCategoryName,
          priceUSD: formData.priceUSD,
          discountPriceUSD: formData.discountPriceUSD,
          currency: formData.currency,
        },
      };

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

      if (error) throw error;

      if (asDraft) {
        toast.success(isRTL ? 'پیش‌نویس ذخیره شد' : 'Draft saved successfully');
      } else if (isVerifiedSeller) {
        toast.success(isRTL ? 'محصول برای بررسی ارسال شد' : 'Product submitted for review');
      } else {
        toast.info(isRTL ? 'محصول به عنوان پیش‌نویس ذخیره شد' : 'Product saved as draft');
      }

      navigate('/dashboard/seller/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(isRTL ? 'خطا در بروزرسانی محصول' : 'Error updating product');
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

  if (loading) {
    return (
      <DashboardLayout
        title={isRTL ? 'ویرایش محصول' : 'Edit Product'}
        description={isRTL ? 'ویرایش محصول' : 'Edit your product'}
        allowedRoles={['seller']}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-6">
            <Skeleton className="h-12 w-full" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={isRTL ? 'ویرایش محصول' : 'Edit Product'}
      description={isRTL ? 'ویرایش محصول' : 'Edit your product'}
      allowedRoles={['seller']}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {!isVerifiedSeller && (
          <Card className="p-4 border-warning/50 bg-warning/10">
            <p className="text-sm text-warning-foreground">
              {isRTL
                ? 'حساب شما هنوز تأیید نشده است. می‌توانید محصولات را به عنوان پیش‌نویس ذخیره کنید.'
                : 'Your account is not verified yet. You can save products as drafts.'}
            </p>
          </Card>
        )}

        <Card className="p-6">
          <ProductStepper steps={STEPS} currentStep={currentStep} onStepClick={goToStep} />
        </Card>

        <Card className="p-6 animate-fade-in">
          {renderStep()}
        </Card>

        <div className={cn(
          "flex gap-4",
          isRTL ? "flex-row-reverse" : "flex-row",
          "justify-between"
        )}>
          <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep} className="gap-2">
                {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                {isRTL ? 'قبلی' : 'Previous'}
              </Button>
            )}
          </div>

          <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
            {currentStep < 5 ? (
              <Button onClick={nextStep} disabled={!canProceed} className="gap-2">
                {isRTL ? 'بعدی' : 'Next'}
                {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => updateProduct(true)}
                  disabled={isSubmitting || isUploading}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {isRTL ? 'ذخیره پیش‌نویس' : 'Save as Draft'}
                </Button>
                <Button
                  onClick={() => updateProduct(false)}
                  disabled={isSubmitting || isUploading || !canProceed}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting
                    ? (isRTL ? 'در حال ارسال...' : 'Submitting...')
                    : isVerifiedSeller
                      ? (isRTL ? 'ارسال برای بررسی' : 'Submit for Review')
                      : (isRTL ? 'ذخیره' : 'Save')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditProduct;

import { useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { ProductFormData } from '@/pages/dashboard/AddProduct';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  GripVertical,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface MediaStepProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
  isUploading: boolean;
}

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export const MediaStep = ({ formData, updateFormData, isUploading }: MediaStepProps) => {
  const { isRTL } = useLanguage();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = formData.images.length + formData.imageUrls.length + files.length;

    if (totalImages > MAX_IMAGES) {
      toast.error(isRTL ? `حداکثر ${MAX_IMAGES} تصویر مجاز است` : `Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(isRTL ? 'فرمت تصویر نامعتبر است' : 'Invalid image format');
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(isRTL ? 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد' : 'Image size must be less than 5MB');
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      updateFormData({ images: [...formData.images, ...validFiles] });
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }

    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, [formData.images, formData.imageUrls.length, isRTL, updateFormData]);

  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error(isRTL ? 'فرمت ویدیو نامعتبر است' : 'Invalid video format');
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error(isRTL ? 'حجم ویدیو نباید بیشتر از ۵۰ مگابایت باشد' : 'Video size must be less than 50MB');
      return;
    }

    updateFormData({ video: file });

    // Reset input
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  }, [isRTL, updateFormData]);

  const removeImage = (index: number, isUrl: boolean) => {
    if (isUrl) {
      updateFormData({ 
        imageUrls: formData.imageUrls.filter((_, i) => i !== index) 
      });
    } else {
      const newImages = [...formData.images];
      newImages.splice(index, 0);
      updateFormData({ images: newImages.filter((_, i) => i !== index) });
      
      const newPreviews = [...imagePreviews];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      setImagePreviews(newPreviews);
    }
  };

  const removeVideo = () => {
    updateFormData({ video: null, videoUrl: '' });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPreviews = [...imagePreviews];
    const newImages = [...formData.images];

    const [draggedPreview] = newPreviews.splice(draggedIndex, 1);
    const [draggedImage] = newImages.splice(draggedIndex, 1);

    newPreviews.splice(index, 0, draggedPreview);
    newImages.splice(index, 0, draggedImage);

    setImagePreviews(newPreviews);
    updateFormData({ images: newImages });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const allImages = [
    ...formData.imageUrls.map(url => ({ type: 'url' as const, src: url })),
    ...imagePreviews.map((preview, index) => ({ type: 'file' as const, src: preview, index })),
  ];

  const hasImages = allImages.length > 0;
  const canAddMore = allImages.length < MAX_IMAGES;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {isRTL ? 'تصاویر و ویدیو محصول' : 'Product Images & Video'}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {isRTL 
            ? 'تصاویر با کیفیت بالا فروش محصول را افزایش می‌دهد'
            : 'High-quality images increase product sales'}
        </p>
      </div>

      {/* Images Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">
            {isRTL ? 'تصاویر محصول' : 'Product Images'} <span className="text-destructive">*</span>
          </Label>
          <span className="text-sm text-muted-foreground">
            {allImages.length}/{MAX_IMAGES}
          </span>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allImages.map((image, index) => (
            <Card
              key={index}
              className={cn(
                "relative aspect-square overflow-hidden group cursor-move",
                draggedIndex === index && "opacity-50",
                index === 0 && "ring-2 ring-primary"
              )}
              draggable={image.type === 'file'}
              onDragStart={() => image.type === 'file' && handleDragStart(image.index!)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <img
                src={image.src}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* First image badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                  {isRTL ? 'اصلی' : 'Main'}
                </div>
              )}

              {/* Drag handle & remove */}
              <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <GripVertical className="w-5 h-5 text-background" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeImage(image.type === 'url' ? index : image.index!, image.type === 'url')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}

          {/* Upload Button */}
          {canAddMore && (
            <Card
              className={cn(
                "aspect-square flex flex-col items-center justify-center cursor-pointer border-dashed",
                "hover:border-primary hover:bg-primary/5 transition-colors"
              )}
              onClick={() => imageInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground text-center px-2">
                    {isRTL ? 'افزودن تصویر' : 'Add Image'}
                  </span>
                </>
              )}
            </Card>
          )}
        </div>

        <input
          ref={imageInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />

        {!hasImages && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {isRTL ? 'حداقل یک تصویر الزامی است' : 'At least one image is required'}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {isRTL 
            ? 'فرمت‌های مجاز: JPG, PNG, WebP - حداکثر ۵ مگابایت - می‌توانید تصاویر را بکشید و مرتب کنید'
            : 'Allowed formats: JPG, PNG, WebP - Max 5MB - Drag images to reorder'}
        </p>
      </div>

      {/* Video Section */}
      <div className="space-y-4 pt-6 border-t">
        <Label className="text-base font-medium">
          {isRTL ? 'ویدیو محصول (اختیاری)' : 'Product Video (Optional)'}
        </Label>

        {formData.video || formData.videoUrl ? (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                <Video className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {formData.video?.name || formData.videoUrl}
                </p>
                {formData.video && (
                  <p className="text-xs text-muted-foreground">
                    {(formData.video.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeVideo}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        ) : (
          <Card
            className={cn(
              "p-8 flex flex-col items-center justify-center cursor-pointer border-dashed",
              "hover:border-primary hover:bg-primary/5 transition-colors"
            )}
            onClick={() => videoInputRef.current?.click()}
          >
            <Video className="w-12 h-12 text-muted-foreground mb-3" />
            <span className="text-sm text-muted-foreground">
              {isRTL ? 'برای آپلود ویدیو کلیک کنید' : 'Click to upload video'}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              MP4, WebM - {isRTL ? 'حداکثر ۵۰ مگابایت' : 'Max 50MB'}
            </span>
          </Card>
        )}

        <input
          ref={videoInputRef}
          type="file"
          accept={ALLOWED_VIDEO_TYPES.join(',')}
          className="hidden"
          onChange={handleVideoSelect}
        />
      </div>
    </div>
  );
};

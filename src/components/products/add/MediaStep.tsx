import { useState, useRef, useCallback, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { ProductFormData } from '@/pages/dashboard/AddProduct';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  GripVertical,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Star
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Simulate upload progress
  useEffect(() => {
    if (isUploading) {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setUploadProgress(0);
    }
  }, [isUploading]);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processImageFiles(files);
    
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, [formData.images, formData.imageUrls.length, isRTL]);

  const processImageFiles = useCallback((files: File[]) => {
    const totalImages = formData.images.length + formData.imageUrls.length + files.length;

    if (totalImages > MAX_IMAGES) {
      toast.error(isRTL ? `حداکثر ${MAX_IMAGES} تصویر مجاز است` : `Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    let hasError = false;

    files.forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(isRTL ? `فرمت ${file.name} نامعتبر است` : `Invalid format for ${file.name}`);
        hasError = true;
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(isRTL ? `حجم ${file.name} بیشتر از ۵ مگابایت است` : `${file.name} exceeds 5MB limit`);
        hasError = true;
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    if (validFiles.length > 0) {
      updateFormData({ images: [...formData.images, ...validFiles] });
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      if (!hasError) {
        toast.success(
          isRTL 
            ? `${validFiles.length} تصویر اضافه شد` 
            : `${validFiles.length} image(s) added`
        );
      }
    }
  }, [formData.images, formData.imageUrls.length, isRTL, updateFormData]);

  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error(isRTL ? 'فرمت ویدیو نامعتبر است (MP4, WebM مجاز است)' : 'Invalid video format (MP4, WebM allowed)');
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error(isRTL ? 'حجم ویدیو نباید بیشتر از ۵۰ مگابایت باشد' : 'Video size must be less than 50MB');
      return;
    }

    updateFormData({ video: file });
    toast.success(isRTL ? 'ویدیو اضافه شد' : 'Video added');

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
      const newImages = formData.images.filter((_, i) => i !== index);
      updateFormData({ images: newImages });
      
      const newPreviews = [...imagePreviews];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      setImagePreviews(newPreviews);
    }
    toast.success(isRTL ? 'تصویر حذف شد' : 'Image removed');
  };

  const removeVideo = () => {
    updateFormData({ video: null, videoUrl: '' });
    toast.success(isRTL ? 'ویدیو حذف شد' : 'Video removed');
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

  // Handle drop zone
  const handleDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDropZoneDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      ALLOWED_IMAGE_TYPES.includes(file.type)
    );
    
    if (files.length > 0) {
      processImageFiles(files);
    }
  };

  const allImages = [
    ...formData.imageUrls.map(url => ({ type: 'url' as const, src: url })),
    ...imagePreviews.map((preview, index) => ({ type: 'file' as const, src: preview, index })),
  ];

  const hasImages = allImages.length > 0;
  const canAddMore = allImages.length < MAX_IMAGES;
  const hasVideo = formData.video || formData.videoUrl;

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

      {/* Upload Progress */}
      {isUploading && (
        <Card className="p-4 border-primary/50 bg-primary/5">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium">
              {isRTL ? 'در حال آپلود...' : 'Uploading...'}
            </span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {isRTL ? 'لطفاً صبر کنید و از صفحه خارج نشوید' : 'Please wait and do not leave this page'}
          </p>
        </Card>
      )}

      {/* Images Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            {isRTL ? 'تصاویر محصول' : 'Product Images'} 
            <span className="text-destructive">*</span>
          </Label>
          <Badge variant={hasImages ? "default" : "secondary"} className="gap-1">
            {hasImages ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {allImages.length}/{MAX_IMAGES}
          </Badge>
        </div>

        {/* Image Grid */}
        <div 
          className={cn(
            "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 border-2 border-dashed rounded-lg transition-colors",
            isDraggingOver && "border-primary bg-primary/5",
            !hasImages && "border-destructive/50"
          )}
          onDragOver={handleDropZoneDragOver}
          onDragLeave={handleDropZoneDragLeave}
          onDrop={handleDropZoneDrop}
        >
          {allImages.map((image, index) => (
            <Card
              key={index}
              className={cn(
                "relative aspect-square overflow-hidden group cursor-move transition-all",
                draggedIndex === index && "opacity-50 scale-95",
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
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {isRTL ? 'اصلی' : 'Main'}
                </div>
              )}

              {/* Drag handle & remove */}
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <GripVertical className="w-5 h-5 text-background" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeImage(image.type === 'url' ? index : image.index!, image.type === 'url')}
                  disabled={isUploading}
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
                "hover:border-primary hover:bg-primary/5 transition-colors",
                isUploading && "pointer-events-none opacity-50"
              )}
              onClick={() => !isUploading && imageInputRef.current?.click()}
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
          disabled={isUploading}
        />

        {!hasImages && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {isRTL ? 'حداقل یک تصویر الزامی است' : 'At least one image is required'}
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p>{isRTL 
              ? 'فرمت‌های مجاز: JPG, PNG, WebP - حداکثر ۵ مگابایت هر تصویر'
              : 'Allowed formats: JPG, PNG, WebP - Max 5MB per image'}</p>
            <p className="mt-1">{isRTL
              ? 'می‌توانید تصاویر را بکشید و مرتب کنید. اولین تصویر به عنوان تصویر اصلی نمایش داده می‌شود.'
              : 'Drag images to reorder. First image will be displayed as the main image.'}
            </p>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="space-y-4 pt-6 border-t">
        <Label className="text-base font-medium flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          {isRTL ? 'ویدیو محصول' : 'Product Video'}
          <Badge variant="outline" className="text-xs font-normal">
            {isRTL ? 'اختیاری' : 'Optional'}
          </Badge>
        </Label>

        {hasVideo ? (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Video className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  {formData.video?.name || (isRTL ? 'ویدیو آپلود شده' : 'Uploaded video')}
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
                disabled={isUploading}
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
              "hover:border-primary hover:bg-primary/5 transition-colors",
              isUploading && "pointer-events-none opacity-50"
            )}
            onClick={() => !isUploading && videoInputRef.current?.click()}
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
          disabled={isUploading}
        />

        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          {isRTL 
            ? 'ویدیو محصول می‌تواند به خریداران در درک بهتر محصول کمک کند'
            : 'Product video can help buyers better understand your product'}
        </p>
      </div>
    </div>
  );
};

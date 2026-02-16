import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { getColorByValue, getLocalizedColorName } from '@/lib/productColors';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check } from 'lucide-react';

interface ColorMedia {
  color_value: string;
  url: string;
}

interface ProductColorSwatchesProps {
  colorMedia: ColorMedia[];
  selectedColor: string | null;
  onColorSelect: (colorValue: string) => void;
}

const ProductColorSwatches = ({ 
  colorMedia, 
  selectedColor, 
  onColorSelect 
}: ProductColorSwatchesProps) => {
  const { language, isRTL } = useLanguage();

  if (colorMedia.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="text-sm text-muted-foreground mb-2">
        {isRTL ? 'رنگ‌های موجود:' : 'Available Colors:'}
      </p>
      <TooltipProvider>
        <div className="flex gap-2 flex-wrap">
          {colorMedia.map((media) => {
            const colorDef = getColorByValue(media.color_value);
            const isMulticolor = media.color_value === 'multicolor';
            const isSelected = selectedColor === media.color_value;
            const colorName = getLocalizedColorName(media.color_value, language);
            const needsBorder = ['white', 'cream', 'ivory', 'beige'].includes(media.color_value);
            
            return (
              <Tooltip key={media.color_value}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onColorSelect(media.color_value)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all flex items-center justify-center",
                      "hover:scale-110 hover:shadow-md",
                      isSelected && "ring-2 ring-offset-2 ring-primary",
                      needsBorder && "border border-border"
                    )}
                    style={{
                      background: isMulticolor 
                        ? colorDef?.hex 
                        : colorDef?.hex || media.color_value,
                    }}
                    aria-label={colorName}
                  >
                    {isSelected && (
                      <Check 
                        className={cn(
                          "w-4 h-4",
                          needsBorder || ['yellow', 'gold', 'cream', 'ivory', 'beige', 'peach', 'mint', 'lightblue', 'lavender'].includes(media.color_value)
                            ? "text-gray-800"
                            : "text-white"
                        )} 
                      />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{colorName}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
};

export default ProductColorSwatches;

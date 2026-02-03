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
  /** List of color values the product is available in */
  productColors: string[];
  /** Optional: media items linked to specific colors (for image switching) */
  colorMedia?: ColorMedia[];
  /** Currently selected color value */
  selectedColor: string | null;
  /** Callback when a color swatch is clicked */
  onColorSelect: (colorValue: string) => void;
}

const ProductColorSwatches = ({ 
  productColors,
  colorMedia = [],
  selectedColor, 
  onColorSelect 
}: ProductColorSwatchesProps) => {
  const { isRTL } = useLanguage();

  if (productColors.length === 0) return null;

  // Create a map of color -> image URL for quick lookup
  const colorImageMap = new Map(colorMedia.map(m => [m.color_value, m.url]));

  return (
    <div className="mt-3">
      <p className="text-sm text-muted-foreground mb-2">
        {isRTL ? 'رنگ‌های موجود:' : 'Available Colors:'}
      </p>
      <TooltipProvider>
        <div className="flex gap-2 flex-wrap">
          {productColors.map((colorValue) => {
            const colorDef = getColorByValue(colorValue);
            const isMulticolor = colorValue === 'multicolor';
            const isSelected = selectedColor === colorValue;
            const colorName = getLocalizedColorName(colorValue, isRTL);
            const needsBorder = ['white', 'cream', 'ivory', 'beige'].includes(colorValue);
            const hasLinkedImage = colorImageMap.has(colorValue);
            
            return (
              <Tooltip key={colorValue}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onColorSelect(colorValue)}
                    className={cn(
                      "w-8 h-8 rounded-full transition-all flex items-center justify-center",
                      "hover:scale-110 hover:shadow-md",
                      isSelected && "ring-2 ring-offset-2 ring-primary",
                      needsBorder && "border border-border",
                      !hasLinkedImage && "opacity-80"
                    )}
                    style={{
                      background: isMulticolor 
                        ? colorDef?.hex 
                        : colorDef?.hex || colorValue,
                    }}
                    aria-label={colorName}
                  >
                    {isSelected && (
                      <Check 
                        className={cn(
                          "w-4 h-4",
                          needsBorder || ['yellow', 'gold', 'cream', 'ivory', 'beige', 'peach', 'mint', 'lightblue', 'lavender'].includes(colorValue)
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

// Shared color definitions for product variants
export const PRODUCT_COLORS = [
  { value: 'black', name: 'Black', nameFa: 'مشکی', hex: '#000000' },
  { value: 'white', name: 'White', nameFa: 'سفید', hex: '#FFFFFF' },
  { value: 'gray', name: 'Gray', nameFa: 'خاکستری', hex: '#808080' },
  { value: 'silver', name: 'Silver', nameFa: 'نقره‌ای', hex: '#C0C0C0' },
  { value: 'red', name: 'Red', nameFa: 'قرمز', hex: '#EF4444' },
  { value: 'maroon', name: 'Maroon', nameFa: 'زرشکی', hex: '#800000' },
  { value: 'burgundy', name: 'Burgundy', nameFa: 'شرابی', hex: '#722F37' },
  { value: 'pink', name: 'Pink', nameFa: 'صورتی', hex: '#EC4899' },
  { value: 'rose', name: 'Rose', nameFa: 'گلی', hex: '#F43F5E' },
  { value: 'orange', name: 'Orange', nameFa: 'نارنجی', hex: '#F97316' },
  { value: 'coral', name: 'Coral', nameFa: 'مرجانی', hex: '#FF7F50' },
  { value: 'peach', name: 'Peach', nameFa: 'هلویی', hex: '#FFCBA4' },
  { value: 'yellow', name: 'Yellow', nameFa: 'زرد', hex: '#EAB308' },
  { value: 'gold', name: 'Gold', nameFa: 'طلایی', hex: '#FFD700' },
  { value: 'cream', name: 'Cream', nameFa: 'کرم', hex: '#FFFDD0' },
  { value: 'beige', name: 'Beige', nameFa: 'بژ', hex: '#F5F5DC' },
  { value: 'brown', name: 'Brown', nameFa: 'قهوه‌ای', hex: '#92400E' },
  { value: 'tan', name: 'Tan', nameFa: 'برنزه', hex: '#D2B48C' },
  { value: 'chocolate', name: 'Chocolate', nameFa: 'شکلاتی', hex: '#7B3F00' },
  { value: 'olive', name: 'Olive', nameFa: 'زیتونی', hex: '#808000' },
  { value: 'green', name: 'Green', nameFa: 'سبز', hex: '#22C55E' },
  { value: 'darkgreen', name: 'Dark Green', nameFa: 'سبز تیره', hex: '#166534' },
  { value: 'mint', name: 'Mint', nameFa: 'سبز نعنایی', hex: '#98FF98' },
  { value: 'teal', name: 'Teal', nameFa: 'سبز آبی', hex: '#14B8A6' },
  { value: 'turquoise', name: 'Turquoise', nameFa: 'فیروزه‌ای', hex: '#40E0D0' },
  { value: 'cyan', name: 'Cyan', nameFa: 'سبز آبی روشن', hex: '#06B6D4' },
  { value: 'lightblue', name: 'Light Blue', nameFa: 'آبی روشن', hex: '#7DD3FC' },
  { value: 'sky', name: 'Sky Blue', nameFa: 'آبی آسمانی', hex: '#87CEEB' },
  { value: 'blue', name: 'Blue', nameFa: 'آبی', hex: '#3B82F6' },
  { value: 'navy', name: 'Navy', nameFa: 'سرمه‌ای', hex: '#000080' },
  { value: 'royal', name: 'Royal Blue', nameFa: 'آبی شاهانه', hex: '#4169E1' },
  { value: 'royalblue', name: 'Royal Blue', nameFa: 'آبی سلطنتی', hex: '#4169E1' },
  { value: 'purple', name: 'Purple', nameFa: 'بنفش', hex: '#A855F7' },
  { value: 'violet', name: 'Violet', nameFa: 'بنفش روشن', hex: '#8B5CF6' },
  { value: 'lavender', name: 'Lavender', nameFa: 'یاسی', hex: '#E6E6FA' },
  { value: 'plum', name: 'Plum', nameFa: 'آلویی', hex: '#8E4585' },
  { value: 'magenta', name: 'Magenta', nameFa: 'سرخابی', hex: '#FF00FF' },
  { value: 'indigo', name: 'Indigo', nameFa: 'نیلی', hex: '#4B0082' },
  { value: 'khaki', name: 'Khaki', nameFa: 'خاکی', hex: '#C3B091' },
  { value: 'charcoal', name: 'Charcoal', nameFa: 'زغالی', hex: '#36454F' },
  { value: 'ivory', name: 'Ivory', nameFa: 'عاجی', hex: '#FFFFF0' },
  { value: 'multicolor', name: 'Multicolor', nameFa: 'چند رنگ', hex: 'linear-gradient(90deg, #EF4444, #F97316, #EAB308, #22C55E, #3B82F6, #A855F7)' },
] as const;

export type ProductColorValue = typeof PRODUCT_COLORS[number]['value'];

export interface ProductColor {
  value: string;
  name: string;
  nameFa: string;
  hex: string;
}

/**
 * Get color definition by value
 */
export const getColorByValue = (value: string): ProductColor | undefined => {
  return PRODUCT_COLORS.find(c => c.value === value);
};

/**
 * Get localized color name
 */
export const getLocalizedColorName = (value: string, isRTL: boolean): string => {
  const color = getColorByValue(value);
  if (!color) return value;
  return isRTL ? color.nameFa : color.name;
};

export const QUANTITY_UNITS = [
  { value: 'pcs', en: 'pcs', fa: 'عدد', ps: 'ټوټه', label_en: 'Pieces', label_fa: 'عدد', label_ps: 'ټوټه' },
  { value: 'kg', en: 'kg', fa: 'کیلوگرم', ps: 'کیلوګرام', label_en: 'Kilogram (kg)', label_fa: 'کیلوگرم (kg)', label_ps: 'کیلوګرام (kg)' },
  { value: 'g', en: 'g', fa: 'گرم', ps: 'ګرام', label_en: 'Gram (g)', label_fa: 'گرم (g)', label_ps: 'ګرام (g)' },
  { value: 'lt', en: 'lt', fa: 'لیتر', ps: 'لیتر', label_en: 'Liter (lt)', label_fa: 'لیتر (lt)', label_ps: 'لیتر (lt)' },
  { value: 'ml', en: 'ml', fa: 'میلی‌لیتر', ps: 'میلي لیتر', label_en: 'Milliliter (ml)', label_fa: 'میلی‌لیتر (ml)', label_ps: 'میلي لیتر (ml)' },
  { value: 'm', en: 'm', fa: 'متر', ps: 'متر', label_en: 'Meter (m)', label_fa: 'متر (m)', label_ps: 'متر (m)' },
  { value: 'cm', en: 'cm', fa: 'سانتی‌متر', ps: 'سانتي متر', label_en: 'Centimeter (cm)', label_fa: 'سانتی‌متر (cm)', label_ps: 'سانتي متر (cm)' },
  { value: 'box', en: 'box', fa: 'جعبه', ps: 'بکس', label_en: 'Box', label_fa: 'جعبه', label_ps: 'بکس' },
  { value: 'pack', en: 'pack', fa: 'بسته', ps: 'بسته', label_en: 'Pack', label_fa: 'بسته', label_ps: 'بسته' },
  { value: 'set', en: 'set', fa: 'ست', ps: 'سیټ', label_en: 'Set', label_fa: 'ست', label_ps: 'سیټ' },
  { value: 'pair', en: 'pair', fa: 'جفت', ps: 'جوړه', label_en: 'Pair', label_fa: 'جفت', label_ps: 'جوړه' },
  { value: 'dozen', en: 'dozen', fa: 'دوجین', ps: 'درجن', label_en: 'Dozen', label_fa: 'دوجین', label_ps: 'درجن' },
];

// Aliases for common unit value variants stored in the database
const UNIT_ALIASES: Record<string, string> = {
  'l': 'lt',
  'liter': 'lt',
  'litre': 'lt',
  'kilogram': 'kg',
  'gram': 'g',
  'meter': 'm',
  'centimeter': 'cm',
  'milliliter': 'ml',
  'piece': 'pcs',
  'pieces': 'pcs',
};

export function getUnitLabel(unitValue: string, language: 'en' | 'fa' | 'ps'): string {
  const normalized = UNIT_ALIASES[unitValue] || unitValue;
  const unit = QUANTITY_UNITS.find(u => u.value === normalized);
  if (!unit) return unitValue || 'pcs';
  return unit[language] || unit.en;
}

/**
 * Extract quantityUnit from product_attributes array
 */
export function getQuantityUnitFromAttributes(
  attributes: { attribute_key: string; attribute_value: string }[]
): string {
  const attr = attributes.find(a => a.attribute_key === 'quantityUnit');
  return attr?.attribute_value || 'pcs';
}

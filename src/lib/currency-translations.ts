// Currency Settings Localization - Full Trilingual Support (EN, FA, PS)
export type Language = 'en' | 'fa' | 'ps';

export const currencyTranslations = {
  // Page header
  page: {
    title: { en: 'Currency Settings', fa: 'تنظیمات ارز', ps: 'د اسعارو ترتیبات' },
    description: { en: 'Manage USD exchange rate for price display across the platform', fa: 'مدیریت نرخ تبادله دالر برای نمایش قیمت در سراسر پلتفرم', ps: 'د پلیټفارم په اوږدو کې د قیمت ښودلو لپاره د ډالرو تبادله نرخ اداره کړئ' },
  },

  // Alert
  alert: {
    baseCurrencyInfo: { 
      en: 'AFN (Afghani) is the base currency. All product prices are stored in AFN. USD prices are calculated dynamically using the rate you set here.', 
      fa: 'افغانی (AFN) ارز پایه است. همه قیمت‌های محصولات به افغانی ذخیره می‌شوند. قیمت‌های دالری با استفاده از نرخی که اینجا تنظیم می‌کنید محاسبه می‌شوند.', 
      ps: 'افغانۍ (AFN) اساسي اسعار دی. ټول محصولاتو قیمتونه په افغانیو کې زیرمه شوي. د ډالرو قیمتونه د هغه نرخ په کارولو سره چې تاسو یې دلته ټاکئ محاسبه کیږي.' 
    },
  },

  // Current rate card
  currentRate: {
    title: { en: 'Current Exchange Rate', fa: 'نرخ فعلی تبادله', ps: 'اوسنی تبادله نرخ' },
    description: { en: 'Active rate used for USD conversions', fa: 'نرخ فعال برای تبدیل دالر', ps: 'د ډالرو بدلون لپاره فعال نرخ' },
    oneUsdEquals: { en: '1 USD =', fa: '۱ دالر =', ps: '۱ ډالر =' },
    afnSuffix: { en: 'AFN', fa: 'افغانی', ps: 'افغانۍ' },
    lastUpdated: { en: 'Last updated:', fa: 'آخرین بروزرسانی:', ps: 'وروستۍ تازه:' },
    active: { en: 'Active', fa: 'فعال', ps: 'فعال' },
    noRateConfigured: { en: 'No exchange rate configured yet', fa: 'هنوز نرخ تبادله تنظیم نشده', ps: 'تر اوسه هیڅ تبادله نرخ تنظیم شوی نه دی' },
  },

  // Update rate card
  updateRate: {
    title: { en: 'Update Exchange Rate', fa: 'بروزرسانی نرخ تبادله', ps: 'د تبادلې نرخ تازه کول' },
    description: { en: 'Set a new AFN to USD conversion rate', fa: 'تنظیم نرخ جدید تبدیل افغانی به دالر', ps: 'د افغانیو څخه ډالرو ته نوی بدلون نرخ وټاکئ' },
    inputLabel: { en: '1 USD equals (in AFN)', fa: '۱ دالر برابر است با (افغانی)', ps: '۱ ډالر برابر دی (په افغانیو)' },
    inputPlaceholder: { en: 'e.g., 87.50', fa: 'مثلاً ۸۷.۵۰', ps: 'د بیلګې په توګه، ۸۷.۵۰' },
    preview: { en: 'Preview:', fa: 'پیش‌نمایش:', ps: 'مخکتنه:' },
    updateButton: { en: 'Update Rate', fa: 'بروزرسانی نرخ', ps: 'نرخ تازه کړئ' },
    saving: { en: 'Saving...', fa: 'در حال ذخیره...', ps: 'خوندي کیږي...' },
  },

  // Conversion examples
  examples: {
    title: { en: 'Conversion Examples', fa: 'نمونه‌های تبدیل', ps: 'د بدلون بیلګې' },
    description: { en: 'How prices will appear across the platform with current rate', fa: 'نحوه نمایش قیمت‌ها در سراسر پلتفرم با نرخ فعلی', ps: 'قیمتونه به د اوسني نرخ سره په پلیټفارم کې څنګه ښکاري' },
    noRateMessage: { en: 'Set an exchange rate to see conversion examples', fa: 'برای مشاهده نمونه‌های تبدیل، نرخ تبادله را تنظیم کنید', ps: 'د بدلون بیلګې لیدلو لپاره د تبادلې نرخ وټاکئ' },
    afn: { en: 'AFN', fa: 'افغانی', ps: 'افغانۍ' },
    usd: { en: 'USD', fa: 'دالر', ps: 'ډالر' },
  },

  // Toasts
  toast: {
    updateSuccess: { en: 'Exchange rate updated successfully', fa: 'نرخ تبادله با موفقیت بروزرسانی شد', ps: 'د تبادلې نرخ په بریالیتوب سره تازه شو' },
    loadError: { en: 'Failed to load exchange rate', fa: 'خطا در بارگذاری نرخ تبادله', ps: 'د تبادلې نرخ پورته کولو کې ناکامي' },
    updateError: { en: 'Failed to update exchange rate', fa: 'خطا در بروزرسانی نرخ تبادله', ps: 'د تبادلې نرخ تازه کولو کې ناکامي' },
    invalidRate: { en: 'Please enter a valid positive exchange rate', fa: 'لطفاً یک نرخ تبادله مثبت معتبر وارد کنید', ps: 'مهرباني وکړئ یو مثبت تبادله نرخ دننه کړئ' },
  },

  // Common
  common: {
    loading: { en: 'Loading...', fa: 'در حال بارگذاری...', ps: 'بارول کیږي...' },
    approximately: { en: '≈', fa: '≈', ps: '≈' },
  },
} as const;

// Helper function to get translated text
export function getCurrencyText<T extends keyof typeof currencyTranslations>(
  section: T,
  key: keyof typeof currencyTranslations[T],
  language: Language
): string {
  const translations = currencyTranslations[section][key] as Record<Language, string>;
  return translations[language] || translations.en;
}

// Hook-like helper for using in components
export function useCurrencyTranslations(language: Language) {
  const getText = <T extends keyof typeof currencyTranslations>(
    section: T,
    key: keyof typeof currencyTranslations[T]
  ): string => getCurrencyText(section, key, language);

  return { t: getText };
}

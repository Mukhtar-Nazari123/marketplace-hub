// Seller Dashboard Localization - Full Pashto (ps) support
export type Language = 'en' | 'fa' | 'ps';

export const sellerTranslations = {
  // Navigation
  navigation: {
    dashboard: { en: 'Dashboard', fa: 'داشبورد', ps: 'ډشبورډ' },
    products: { en: 'Products', fa: 'محصولات', ps: 'محصولات' },
    orders: { en: 'Orders', fa: 'سفارشات', ps: 'امرونه' },
    reviews: { en: 'Reviews', fa: 'نظرات', ps: 'نظرونه' },
    analytics: { en: 'Analytics', fa: 'آنالیتیکس', ps: 'تحلیلات' },
    translations: { en: 'Translations', fa: 'ترجمه‌ها', ps: 'ژباړې' },
    settings: { en: 'Settings', fa: 'تنظیمات', ps: 'ترتیبات' },
    addProduct: { en: 'Add Product', fa: 'افزودن محصول', ps: 'محصول اضافه کړئ' },
  },

  // Dashboard page
  dashboard: {
    title: { en: 'Seller Dashboard', fa: 'داشبورد فروشنده', ps: 'د پلورونکي ډشبورډ' },
    description: { en: 'Manage your sales and products', fa: 'مدیریت فروش و محصولات', ps: 'خپل پلور او محصولات اداره کړئ' },
    totalSales: { en: 'Total Sales', fa: 'کل فروش', ps: 'ټول پلور' },
    totalOrders: { en: 'Total Orders', fa: 'کل سفارشات', ps: 'ټول امرونه' },
    totalProducts: { en: 'Total Products', fa: 'کل محصولات', ps: 'ټول محصولات' },
    pendingOrders: { en: 'Pending Orders', fa: 'سفارشات در انتظار', ps: 'انتظار امرونه' },
    recentOrders: { en: 'Recent Orders', fa: 'سفارشات اخیر', ps: 'وروستي امرونه' },
    viewAll: { en: 'View All', fa: 'مشاهده همه', ps: 'ټول وګورئ' },
    quickActions: { en: 'Quick Actions', fa: 'عملیات سریع', ps: 'چټکې کړنې' },
  },

  // Products page
  products: {
    title: { en: 'My Products', fa: 'محصولات من', ps: 'زما محصولات' },
    description: { en: 'Manage your store products', fa: 'مدیریت محصولات فروشگاه', ps: 'د پلورنځي محصولات اداره کړئ' },
    addNew: { en: 'Add New Product', fa: 'افزودن محصول جدید', ps: 'نوی محصول اضافه کړئ' },
    search: { en: 'Search products...', fa: 'جستجوی محصولات...', ps: 'محصولات ولټوئ...' },
    filter: { en: 'Filter', fa: 'فیلتر', ps: 'فلټر' },
    status: { en: 'Status', fa: 'وضعیت', ps: 'حالت' },
    price: { en: 'Price', fa: 'قیمت', ps: 'قیمت' },
    stock: { en: 'Stock', fa: 'موجودی', ps: 'ذخیره' },
    actions: { en: 'Actions', fa: 'عملیات', ps: 'کړنې' },
    edit: { en: 'Edit', fa: 'ویرایش', ps: 'سمون' },
    delete: { en: 'Delete', fa: 'حذف', ps: 'ړنګول' },
    view: { en: 'View', fa: 'مشاهده', ps: 'وګورئ' },
    duplicate: { en: 'Duplicate', fa: 'تکرار', ps: 'کاپي' },
    noProducts: { en: 'No products found', fa: 'محصولی یافت نشد', ps: 'محصول ونه موندل شو' },
    addFirstProduct: { en: 'Add your first product', fa: 'اولین محصول خود را اضافه کنید', ps: 'خپل لومړی محصول اضافه کړئ' },
    active: { en: 'Active', fa: 'فعال', ps: 'فعال' },
    pending: { en: 'Pending', fa: 'در انتظار', ps: 'انتظار کې' },
    rejected: { en: 'Rejected', fa: 'رد شده', ps: 'رد شوی' },
    draft: { en: 'Draft', fa: 'پیش‌نویس', ps: 'مسوده' },
    outOfStock: { en: 'Out of Stock', fa: 'ناموجود', ps: 'ذخیره پای' },
    lowStock: { en: 'Low Stock', fa: 'موجودی کم', ps: 'لږه ذخیره' },
    inStock: { en: 'In Stock', fa: 'موجود', ps: 'ذخیره لري' },
  },

  // Orders page
  orders: {
    title: { en: 'Orders', fa: 'سفارشات', ps: 'امرونه' },
    description: { en: 'Manage customer orders', fa: 'مدیریت سفارشات مشتریان', ps: 'د پیرودونکو امرونه اداره کړئ' },
    orderNumber: { en: 'Order #', fa: 'شماره سفارش', ps: 'د امر شمیره' },
    customer: { en: 'Customer', fa: 'مشتری', ps: 'پیرودونکی' },
    date: { en: 'Date', fa: 'تاریخ', ps: 'نیټه' },
    total: { en: 'Total', fa: 'مجموع', ps: 'ټول' },
    status: { en: 'Status', fa: 'وضعیت', ps: 'حالت' },
    actions: { en: 'Actions', fa: 'عملیات', ps: 'کړنې' },
    viewDetails: { en: 'View Details', fa: 'مشاهده جزئیات', ps: 'تفصیلات وګورئ' },
    updateStatus: { en: 'Update Status', fa: 'بروزرسانی وضعیت', ps: 'حالت تازه کړئ' },
    noOrders: { en: 'No orders found', fa: 'سفارشی یافت نشد', ps: 'امر ونه موندل شو' },
    pending: { en: 'Pending', fa: 'در انتظار', ps: 'انتظار کې' },
    confirmed: { en: 'Confirmed', fa: 'تایید شده', ps: 'تایید شوی' },
    processing: { en: 'Processing', fa: 'در حال پردازش', ps: 'پروسس کېږي' },
    shipped: { en: 'Shipped', fa: 'ارسال شده', ps: 'لیږل شوی' },
    delivered: { en: 'Delivered', fa: 'تحویل داده شده', ps: 'تحویل شوی' },
    cancelled: { en: 'Cancelled', fa: 'لغو شده', ps: 'لغوه شوی' },
    rejected: { en: 'Rejected', fa: 'رد شده', ps: 'رد شوی' },
    allOrders: { en: 'All Orders', fa: 'همه سفارشات', ps: 'ټول امرونه' },
    items: { en: 'Items', fa: 'اقلام', ps: 'توکي' },
    shippingAddress: { en: 'Shipping Address', fa: 'آدرس ارسال', ps: 'د لیږلو پته' },
    phone: { en: 'Phone', fa: 'تلفن', ps: 'تلیفون' },
    notes: { en: 'Notes', fa: 'یادداشت', ps: 'یادښتونه' },
    confirmOrder: { en: 'Confirm Order', fa: 'تایید سفارش', ps: 'امر تایید کړئ' },
    shipOrder: { en: 'Ship Order', fa: 'ارسال سفارش', ps: 'امر ولیږئ' },
    deliverOrder: { en: 'Mark as Delivered', fa: 'تحویل داده شده', ps: 'تحویل شوی' },
    rejectOrder: { en: 'Reject Order', fa: 'رد سفارش', ps: 'امر رد کړئ' },
  },

  // Reviews page
  reviews: {
    title: { en: 'Product Reviews', fa: 'نظرات محصولات', ps: 'د محصولاتو نظرونه' },
    description: { en: 'View customer reviews about your products', fa: 'مشاهده نظرات خریداران درباره محصولات شما', ps: 'ستاسو د محصولاتو په اړه د پیرودونکو نظرونه وګورئ' },
    averageRating: { en: 'Average Rating', fa: 'امتیاز میانگین', ps: 'اوسط درجه' },
    totalReviews: { en: 'Total Reviews', fa: 'کل نظرات', ps: 'ټول نظرونه' },
    recentReviews: { en: 'Recent Reviews', fa: 'نظرات اخیر', ps: 'وروستي نظرونه' },
    noReviews: { en: 'No reviews yet', fa: 'هنوز نظری ثبت نشده', ps: 'تر اوسه نظر نشته' },
    stars: { en: 'Stars', fa: 'ستاره', ps: 'ستوري' },
  },

  // Analytics page
  analytics: {
    title: { en: 'Analytics', fa: 'آنالیتیکس', ps: 'تحلیلات' },
    description: { en: 'Sales statistics and reports', fa: 'آمار و گزارش فروش', ps: 'د پلور احصایې او راپورونه' },
    revenue: { en: 'Revenue', fa: 'درآمد', ps: 'عاید' },
    orders: { en: 'Orders', fa: 'سفارشات', ps: 'امرونه' },
    customers: { en: 'Customers', fa: 'مشتریان', ps: 'پیرودونکي' },
    products: { en: 'Products', fa: 'محصولات', ps: 'محصولات' },
    thisMonth: { en: 'This Month', fa: 'این ماه', ps: 'دا میاشت' },
    lastMonth: { en: 'Last Month', fa: 'ماه گذشته', ps: 'تیره میاشت' },
    thisYear: { en: 'This Year', fa: 'امسال', ps: 'سږ کال' },
    topProducts: { en: 'Top Products', fa: 'محصولات برتر', ps: 'غوره محصولات' },
    lowStockAlerts: { en: 'Low Stock Alerts', fa: 'هشدار موجودی کم', ps: 'د لږې ذخیرې خبرداری' },
  },

  // Translation dashboard
  translations: {
    title: { en: 'Translation Dashboard', fa: 'داشبورد ترجمه', ps: 'د ژباړې ډشبورډ' },
    description: { en: 'Manage product translations', fa: 'مدیریت ترجمه محصولات', ps: 'د محصولاتو ژباړې اداره کړئ' },
    coverage: { en: 'Translation Coverage', fa: 'پوشش ترجمه', ps: 'د ژباړې پوښښ' },
    english: { en: 'English', fa: 'انگلیسی', ps: 'انګلیسي' },
    persian: { en: 'Persian', fa: 'فارسی', ps: 'فارسي' },
    pashto: { en: 'Pashto', fa: 'پشتو', ps: 'پښتو' },
    complete: { en: 'Complete', fa: 'کامل', ps: 'بشپړ' },
    incomplete: { en: 'Incomplete', fa: 'ناقص', ps: 'نابشپړ' },
    missing: { en: 'Missing', fa: 'گمشده', ps: 'ورک' },
    addTranslation: { en: 'Add Translation', fa: 'افزودن ترجمه', ps: 'ژباړه اضافه کړئ' },
    editTranslation: { en: 'Edit Translation', fa: 'ویرایش ترجمه', ps: 'ژباړه وسموئ' },
    copyFrom: { en: 'Copy from', fa: 'کپی از', ps: 'کاپي له' },
    productName: { en: 'Product Name', fa: 'نام محصول', ps: 'د محصول نوم' },
    productDescription: { en: 'Product Description', fa: 'توضیحات محصول', ps: 'د محصول تفصیل' },
    shortDescription: { en: 'Short Description', fa: 'توضیحات کوتاه', ps: 'لنډ تفصیل' },
    specifications: { en: 'Specifications', fa: 'مشخصات', ps: 'ځانګړتیاوې' },
    metaTitle: { en: 'SEO Title', fa: 'عنوان سئو', ps: 'سیو سرلیک' },
    metaDescription: { en: 'SEO Description', fa: 'توضیحات سئو', ps: 'سیو تفصیل' },
    saveTranslation: { en: 'Save Translation', fa: 'ذخیره ترجمه', ps: 'ژباړه خوندي کړئ' },
    saveDraft: { en: 'Save as Draft', fa: 'ذخیره پیش‌نویس', ps: 'مسوده خوندي کړئ' },
    translationSaved: { en: 'Translation saved successfully', fa: 'ترجمه با موفقیت ذخیره شد', ps: 'ژباړه په بریالیتوب سره خوندي شوه' },
    noTranslation: { en: 'No translation available', fa: 'ترجمه‌ای موجود نیست', ps: 'ژباړه شتون نلري' },
    allProducts: { en: 'All Products', fa: 'همه محصولات', ps: 'ټول محصولات' },
    needsTranslation: { en: 'Needs Translation', fa: 'نیاز به ترجمه', ps: 'ژباړې ته اړتیا' },
  },

  // Product form
  productForm: {
    basicInfo: { en: 'Basic Information', fa: 'اطلاعات اولیه', ps: 'اساسي معلومات' },
    pricing: { en: 'Pricing & Inventory', fa: 'قیمت و موجودی', ps: 'قیمت او ذخیره' },
    media: { en: 'Media', fa: 'رسانه', ps: 'رسنۍ' },
    category: { en: 'Category', fa: 'دسته‌بندی', ps: 'کټګوري' },
    review: { en: 'Review', fa: 'بازبینی', ps: 'کتنه' },
    productName: { en: 'Product Name', fa: 'نام محصول', ps: 'د محصول نوم' },
    productNamePlaceholder: { en: 'Enter product name', fa: 'نام محصول را وارد کنید', ps: 'د محصول نوم دننه کړئ' },
    description: { en: 'Description', fa: 'توضیحات', ps: 'تفصیل' },
    descriptionPlaceholder: { en: 'Describe your product...', fa: 'محصول خود را توضیح دهید...', ps: 'خپل محصول تشریح کړئ...' },
    price: { en: 'Price', fa: 'قیمت', ps: 'قیمت' },
    compareAtPrice: { en: 'Compare at Price', fa: 'قیمت مقایسه', ps: 'پرتله قیمت' },
    costPrice: { en: 'Cost Price', fa: 'قیمت خرید', ps: 'لګښت قیمت' },
    quantity: { en: 'Quantity', fa: 'تعداد', ps: 'شمیر' },
    sku: { en: 'SKU', fa: 'کد محصول', ps: 'SKU' },
    barcode: { en: 'Barcode', fa: 'بارکد', ps: 'بارکوډ' },
    weight: { en: 'Weight (kg)', fa: 'وزن (کیلوگرم)', ps: 'وزن (کیلوګرام)' },
    images: { en: 'Product Images', fa: 'تصاویر محصول', ps: 'د محصول انځورونه' },
    uploadImages: { en: 'Upload Images', fa: 'آپلود تصاویر', ps: 'انځورونه اپلوډ کړئ' },
    dragDrop: { en: 'Drag and drop or click to upload', fa: 'بکشید و رها کنید یا کلیک کنید', ps: 'کش کړئ او پریږدئ یا کلیک وکړئ' },
    videoUrl: { en: 'Video URL (optional)', fa: 'لینک ویدیو (اختیاری)', ps: 'ویډیو لینک (اختیاري)' },
    selectCategory: { en: 'Select Category', fa: 'دسته‌بندی را انتخاب کنید', ps: 'کټګوري وټاکئ' },
    selectSubcategory: { en: 'Select Subcategory', fa: 'زیر دسته را انتخاب کنید', ps: 'فرعي کټګوري وټاکئ' },
    publish: { en: 'Publish Product', fa: 'انتشار محصول', ps: 'محصول خپور کړئ' },
    saveDraft: { en: 'Save as Draft', fa: 'ذخیره پیش‌نویس', ps: 'مسوده خوندي کړئ' },
    next: { en: 'Next', fa: 'بعدی', ps: 'راتلونکی' },
    previous: { en: 'Previous', fa: 'قبلی', ps: 'پخوانی' },
    cancel: { en: 'Cancel', fa: 'انصراف', ps: 'لغوه' },
    productCreated: { en: 'Product created successfully', fa: 'محصول با موفقیت ایجاد شد', ps: 'محصول په بریالیتوب سره جوړ شو' },
    productUpdated: { en: 'Product updated successfully', fa: 'محصول با موفقیت بروزرسانی شد', ps: 'محصول په بریالیتوب سره تازه شو' },
  },

  // Common actions
  common: {
    save: { en: 'Save', fa: 'ذخیره', ps: 'خوندي کړئ' },
    cancel: { en: 'Cancel', fa: 'انصراف', ps: 'لغوه' },
    delete: { en: 'Delete', fa: 'حذف', ps: 'ړنګول' },
    edit: { en: 'Edit', fa: 'ویرایش', ps: 'سمون' },
    view: { en: 'View', fa: 'مشاهده', ps: 'وګورئ' },
    search: { en: 'Search', fa: 'جستجو', ps: 'لټون' },
    filter: { en: 'Filter', fa: 'فیلتر', ps: 'فلټر' },
    export: { en: 'Export', fa: 'خروجی', ps: 'صادر کړئ' },
    import: { en: 'Import', fa: 'ورودی', ps: 'وارد کړئ' },
    loading: { en: 'Loading...', fa: 'در حال بارگذاری...', ps: 'بارول کېږي...' },
    noData: { en: 'No data available', fa: 'داده‌ای موجود نیست', ps: 'معلومات شتون نلري' },
    confirm: { en: 'Confirm', fa: 'تایید', ps: 'تایید' },
    success: { en: 'Success', fa: 'موفقیت', ps: 'بریالیتوب' },
    error: { en: 'Error', fa: 'خطا', ps: 'تېروتنه' },
    warning: { en: 'Warning', fa: 'هشدار', ps: 'خبرداری' },
    info: { en: 'Info', fa: 'اطلاعات', ps: 'معلومات' },
    yes: { en: 'Yes', fa: 'بله', ps: 'هو' },
    no: { en: 'No', fa: 'خیر', ps: 'نه' },
    all: { en: 'All', fa: 'همه', ps: 'ټول' },
    none: { en: 'None', fa: 'هیچکدام', ps: 'هیڅ' },
    required: { en: 'Required', fa: 'الزامی', ps: 'اړین' },
    optional: { en: 'Optional', fa: 'اختیاری', ps: 'اختیاري' },
  },

  // Status labels
  status: {
    active: { en: 'Active', fa: 'فعال', ps: 'فعال' },
    inactive: { en: 'Inactive', fa: 'غیرفعال', ps: 'غیر فعال' },
    pending: { en: 'Pending', fa: 'در انتظار', ps: 'انتظار کې' },
    approved: { en: 'Approved', fa: 'تایید شده', ps: 'تایید شوی' },
    rejected: { en: 'Rejected', fa: 'رد شده', ps: 'رد شوی' },
    draft: { en: 'Draft', fa: 'پیش‌نویس', ps: 'مسوده' },
    published: { en: 'Published', fa: 'منتشر شده', ps: 'خپاره شوی' },
  },

  // Validation messages
  validation: {
    required: { en: 'This field is required', fa: 'این فیلد الزامی است', ps: 'دا ساحه اړینه ده' },
    minLength: { en: 'Minimum length is', fa: 'حداقل طول', ps: 'لږترلږه اوږدوالی دی' },
    maxLength: { en: 'Maximum length is', fa: 'حداکثر طول', ps: 'اعظمي اوږدوالی دی' },
    invalidEmail: { en: 'Invalid email address', fa: 'آدرس ایمیل نامعتبر است', ps: 'ناسم بریښنالیک پته' },
    invalidPhone: { en: 'Invalid phone number', fa: 'شماره تلفن نامعتبر است', ps: 'ناسم تلیفون شمیره' },
    invalidUrl: { en: 'Invalid URL', fa: 'لینک نامعتبر است', ps: 'ناسم لینک' },
    positiveNumber: { en: 'Must be a positive number', fa: 'باید عدد مثبت باشد', ps: 'باید مثبت شمیره وي' },
  },

  // Time-related
  time: {
    justNow: { en: 'Just now', fa: 'همین الان', ps: 'همدا اوس' },
    minutesAgo: { en: 'minutes ago', fa: 'دقیقه پیش', ps: 'دقیقې دمخه' },
    hoursAgo: { en: 'hours ago', fa: 'ساعت پیش', ps: 'ساعتونه دمخه' },
    daysAgo: { en: 'days ago', fa: 'روز پیش', ps: 'ورځې دمخه' },
    weeksAgo: { en: 'weeks ago', fa: 'هفته پیش', ps: 'اونۍ دمخه' },
    monthsAgo: { en: 'months ago', fa: 'ماه پیش', ps: 'میاشتې دمخه' },
  },
} as const;

// Helper function to get translated text
export function getSellerText<T extends keyof typeof sellerTranslations>(
  section: T,
  key: keyof typeof sellerTranslations[T],
  language: Language
): string {
  const translations = sellerTranslations[section][key] as Record<Language, string>;
  return translations[language] || translations.en;
}

// Hook-like helper for using in components
export function useSellerTranslations(language: Language) {
  return {
    t: <T extends keyof typeof sellerTranslations>(
      section: T,
      key: keyof typeof sellerTranslations[T]
    ): string => getSellerText(section, key, language),
    
    navigation: Object.fromEntries(
      Object.entries(sellerTranslations.navigation).map(([key, val]) => [key, val[language]])
    ),
    
    common: Object.fromEntries(
      Object.entries(sellerTranslations.common).map(([key, val]) => [key, val[language]])
    ),
  };
}

// Trilingual translations - English, Persian (Dari) & Pashto
export type Language = 'fa' | 'en' | 'ps';

// RTL languages array for easy checking
export const RTL_LANGUAGES: Language[] = ['fa', 'ps'];

export const translations = {
  fa: {
    // Navigation
    nav: {
      category: "دسته‌بندی",
      products: "محصولات",
      categories: "دسته‌بندی‌ها",
      newArrivals: "تازه‌ها",
      blog: "وبلاگ",
      contactUs: "تماس با ما",
      aboutUs: "درباره ما",
      specialOffer: "پیشنهاد ویژه!",
      blackFriday: "جمعه سیاه",
    },
    
    // Header
    header: {
      searchPlaceholder: "جستجوی محصولات...",
      search: "جستجو",
      signIn: "ورود / ثبت نام",
      welcomeGuest: "خوش آمدید مهمان",
      cart: "سبد خرید",
      wishlist: "لیست علاقه‌مندی",
      themeToggle: "تغییر حالت تاریک/روشن",
      logout: "خروج",
      logoutTitle: "خروج از حساب",
      logoutConfirm: "آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟",
      menu: "منو",
      language: "زبان",
    },
    
    // Top Bar
    topBar: {
      callUs: "تماس با ما:",
      myAccount: "حساب من",
      wishlist: "لیست علاقه‌مندی‌ها",
      checkout: "پرداخت",
      language: "زبان",
      currency: "افغانی",
    },
    
    // Categories
    categories: {
      title: "دسته‌بندی‌ها",
      allCategories: "همه دسته‌بندی‌ها",
      electronics: "الکترونیکس",
      fashion: "مد و لباس",
      homeGarden: "خانه و باغ",
      sports: "ورزش و فضای باز",
      healthBeauty: "سلامت و زیبایی",
      toysGames: "اسباب بازی و بازی‌ها",
      automotive: "خودرو",
      booksMedia: "کتاب و رسانه",
      subcategories: "زیر دسته‌ها",
      productsInCategory: "محصولات در این دسته",
    },
    
    // Hero Section
    hero: {
      sale: "تخفیف ۵۰٪",
      modernStyle: "سبک مدرن",
      headphones: "هدفون‌ها",
      model: "مدل",
      quickSale: "عجله کنید! فقط ۱۰۰ محصول با این قیمت تخفیفی موجود است.",
      shopNow: "خرید کنید",
      nowAvailable: "اکنون موجود!",
      topSelling: "پرفروش‌ترین",
      startingFrom: "شروع از",
      latestGeneration: "نسل جدید",
      kitchenEssentials: "لوازم آشپزخانه",
      mustHaveGadgets: "گجت‌های ضروری",
    },
    
    // Product
    product: {
      reviews: "نظرات",
      addToCart: "افزودن به سبد",
      quickView: "مشاهده سریع",
      new: "جدید",
      hot: "داغ",
      hours: "ساعت",
      minutes: "دقیقه",
      seconds: "ثانیه",
      price: "قیمت",
      description: "توضیحات",
      specifications: "مشخصات",
      availability: "موجودی",
      inStock: "موجود",
      outOfStock: "ناموجود",
      quantity: "تعداد",
      addToWishlist: "افزودن به علاقه‌مندی‌ها",
      relatedProducts: "محصولات مرتبط",
      sellerInfo: "اطلاعات فروشنده",
      allProducts: "همه محصولات",
      newProducts: "محصولات جدید",
    },
    
    // Filters
    filters: {
      title: "فیلترها",
      priceRange: "محدوده قیمت",
      rating: "امتیاز",
      brand: "برند",
      sortBy: "مرتب‌سازی",
      latest: "جدیدترین",
      popularity: "محبوب‌ترین",
      priceLowHigh: "قیمت: کم به زیاد",
      priceHighLow: "قیمت: زیاد به کم",
      category: "دسته‌بندی",
      seller: "فروشنده",
      discount: "تخفیف‌دار",
      clear: "پاک کردن",
      apply: "اعمال",
      min: "حداقل",
      max: "حداکثر",
    },
    
    // View
    view: {
      grid: "نمای شبکه‌ای",
      list: "نمای لیستی",
      showMore: "نمایش بیشتر",
      showLess: "نمایش کمتر",
    },
    
    // Today Deals
    deals: {
      todayDeal: "معامله امروز",
      seeAll: "مشاهده همه",
    },
    
    // Best Sellers
    bestSellers: {
      weeklyBestSellers: "پرفروش‌ترین هفته",
      television: "تلویزیون",
      airConditional: "تهویه مطبوع",
      laptopsAccessories: "لپ‌تاپ و لوازم جانبی",
      smartphoneTablets: "گوشی هوشمند و تبلت",
    },
    
    // Promo Banner
    promo: {
      savingOff: "صرفه‌جویی ۲۰٪ روی میلیون‌ها اپلیکیشن فقط برای iPad",
      limitedOffer: "پیشنهاد محدود. این معامله شگفت‌انگیز را از دست ندهید!",
    },
    
    // Category Banners
    categoryBanners: {
      tabletAccessories: "تبلت و لوازم جانبی",
      tvAudioVideo: "تلویزیون و صوتی/تصویری",
      smartphoneAccessories: "گوشی هوشمند و لوازم جانبی",
    },
    
    // Footer
    footer: {
      freeShipping: "ارسال رایگان",
      ordersOver: "*شرایط و ضوابط اعمال می‌شود",
      securePayment: "پرداخت امن",
      protected: "۱۰۰٪ محافظت شده",
      support: "پشتیبانی ۲۴/۷",
      dedicatedHelp: "کمک اختصاصی",
      easyReturns: "بازگشت رایگان",
      daysReturn: "۳۰ روز بازگشت",
      quickLinks: "لینک‌های سریع",
      aboutUs: "درباره ما",
      contactUs: "تماس با ما",
      privacyPolicy: "سیاست حریم خصوصی",
      termsConditions: "شرایط و ضوابط",
      faq: "سوالات متداول",
      sitemap: "نقشه سایت",
      customerService: "خدمات مشتریان",
      myAccount: "حساب من",
      orderTracking: "پیگیری سفارش",
      wishlist: "لیست علاقه‌مندی‌ها",
      returns: "بازگشت کالا",
      shippingInfo: "اطلاعات ارسال",
      giftCards: "کارت هدیه",
      newsletter: "خبرنامه",
      subscribeText: "برای دریافت پیشنهادات ویژه، هدایا و تخفیف‌ها عضو شوید.",
      enterEmail: "ایمیل خود را وارد کنید",
      allRightsReserved: "تمامی حقوق محفوظ است",
      onlineStore: "فروشگاه آنلاین",
      description: "مقصد یکپارچه شما برای محصولات با کیفیت با قیمت‌های بی‌نظیر. با اطمینان خرید کنید.",
    },
    
    // About Page
    about: {
      title: "درباره ما",
      subtitle: "داستان ما",
      mission: "ماموریت ما",
      missionText: "ارائه بهترین محصولات با کیفیت به قیمت‌های مناسب و خدمات مشتریان عالی.",
      vision: "چشم‌انداز ما",
      visionText: "تبدیل شدن به برترین فروشگاه آنلاین در افغانستان و منطقه.",
      values: "ارزش‌های ما",
      valuesText: "صداقت، کیفیت، نوآوری و رضایت مشتری.",
      team: "تیم ما",
      history: "تاریخچه",
      historyText: "از سال ۱۴۰۰ فعالیت خود را آغاز کردیم و تا امروز به هزاران مشتری خدمات ارائه داده‌ایم.",
      awards: "جوایز و افتخارات",
      awardsText: "برنده جایزه بهترین فروشگاه آنلاین ۱۴۰۲",
    },
    
    // Contact Page
    contact: {
      title: "تماس با ما",
      subtitle: "ما اینجا هستیم تا به شما کمک کنیم",
      name: "نام",
      email: "ایمیل",
      phone: "تلفن",
      subject: "موضوع",
      message: "پیام",
      send: "ارسال پیام",
      address: "آدرس",
      workingHours: "ساعات کاری",
      success: "پیام شما با موفقیت ارسال شد!",
      error: "خطا در ارسال پیام. لطفاً دوباره تلاش کنید.",
      addressText: "کابل، افغانستان",
      phoneNumber: "+93 700 000 000",
      emailAddress: "info@store.af",
      workingHoursText: "شنبه تا پنجشنبه: ۸ صبح - ۶ عصر",
    },
    
    // Blog Page
    blog: {
      title: "وبلاگ",
      subtitle: "آخرین اخبار و مقالات",
      searchPlaceholder: "جستجو در مقالات...",
      readMore: "ادامه مطلب",
      categories: "دسته‌بندی‌ها",
      recentPosts: "آخرین مطالب",
      tags: "برچسب‌ها",
      noResults: "مقاله‌ای یافت نشد",
      publishedOn: "منتشر شده در",
      by: "توسط",
      backToBlog: "بازگشت به وبلاگ",
      views: "بازدید",
      share: "اشتراک‌گذاری",
    },
    
    // Admin - Comprehensive translations
    admin: {
      panelTitle: "پنل مدیریت",
      panelSubtitle: "مدیریت سیستم",
      main: "اصلی",
      content: "محتوا",
      system: "سیستم",
      manager: "مدیر",
      logout: "خروج",
      dashboard: "داشبورد",
      dashboardDescription: "نمای کلی سیستم",
      totalUsers: "کل کاربران",
      totalOrders: "کل سفارشات",
      totalRevenue: "کل درآمد",
      pendingSellers: "فروشندگان در انتظار",
      activeProducts: "محصولات فعال",
      newRegistrations: "ثبت‌نام‌های جدید",
      activeSellers: "فروشندگان فعال",
      pendingProducts: "محصولات در انتظار",
      alerts: "هشدارها",
      thisWeek: "این هفته",
      fromLastMonth: "از ماه گذشته",
      pendingReview: "در انتظار بررسی",
      needsAttention: "نیاز به توجه",
      inProgress: "در حال پردازش",
      awaitingVerification: "در انتظار تأیید",
      revenueOverview: "نمودار درآمد",
      monthlyRevenue: "درآمد ماهانه",
      monthlyOrders: "سفارشات ماهانه",
      revenue: "درآمد",
      quickActions: "اقدامات سریع",
      reviewSellers: "بررسی فروشندگان",
      pendingSellerRequests: "درخواست فروشندگان در انتظار",
      reviewProducts: "بررسی محصولات",
      pendingProductApprovals: "محصولات در انتظار تأیید",
      viewAllOrders: "مشاهده همه سفارشات",
      manageOrders: "مدیریت سفارشات و تحویل‌ها",
      recentActivity: "فعالیت‌های اخیر",
      newUserRegistration: "ثبت‌نام کاربر جدید",
      newUserJoined: "کاربر جدید به عنوان خریدار پیوست",
      newOrder: "سفارش جدید",
      newOrderCreated: "سفارش جدید با ارزش ۱۵۰ دلار ایجاد شد",
      newProductPending: "محصول جدید در انتظار",
      newProductNeedsReview: "محصول جدید نیاز به بررسی دارد",
      newVerificationRequest: "درخواست تأیید جدید",
      newSellerVerification: "فروشنده جدید درخواست تأیید دارد",
      
      months: {
        january: "حمل", february: "ثور", march: "جوزا", april: "سرطان",
        may: "اسد", june: "سنبله", july: "میزان", august: "عقرب",
        september: "قوس", october: "جدی", november: "دلو", december: "حوت",
      },
      
      users: {
        title: "مدیریت کاربران", description: "مشاهده و مدیریت همه کاربران",
        usersTitle: "کاربران", totalUsers: "مجموع {count} کاربر",
        refresh: "بروزرسانی", export: "خروجی",
        searchPlaceholder: "جستجو با نام یا ایمیل...", filterByRole: "فیلتر بر اساس نقش",
        allRoles: "همه نقش‌ها", buyers: "خریداران", sellers: "فروشندگان",
        moderators: "ناظران", admins: "مدیران", user: "کاربر", role: "نقش",
        registrationDate: "تاریخ ثبت‌نام", actions: "اقدامات",
        viewDetails: "مشاهده جزئیات", suspendAccount: "تعلیق حساب",
        userDetails: "جزئیات کاربر", fullInfo: "اطلاعات کامل کاربر",
        close: "بستن", noUsers: "کاربری یافت نشد", loadError: "خطا در بارگذاری کاربران",
        roles: { admin: "مدیر", moderator: "ناظر", seller: "فروشنده", buyer: "خریدار", unspecified: "نامشخص" },
      },
      
      products: {
        title: "مدیریت محصولات", description: "بررسی و مدیریت همه محصولات",
        productsTitle: "محصولات", totalProducts: "مجموع {count} محصول",
        refresh: "بروزرسانی", searchPlaceholder: "جستجو بر اساس نام...",
        filterByStatus: "فیلتر بر اساس وضعیت", allStatuses: "همه وضعیت‌ها",
        product: "محصول", price: "قیمت", status: "وضعیت", addedDate: "تاریخ افزودن",
        actions: "اقدامات", viewDetails: "مشاهده جزئیات", approve: "تأیید", reject: "رد",
        rejectProduct: "رد محصول", enterRejectionReason: "لطفاً دلیل رد محصول را وارد کنید",
        rejectionReasonPlaceholder: "دلیل رد...", cancel: "انصراف", rejecting: "در حال رد...",
        noProducts: "محصولی یافت نشد", loadError: "خطا در بارگذاری محصولات",
        approveSuccess: "محصول تأیید شد", approveError: "خطا در تأیید محصول",
        rejectSuccess: "محصول رد شد", rejectError: "خطا در رد محصول",
        statuses: { active: "فعال", pending: "در انتظار", rejected: "رد شده", draft: "پیش‌نویس", archived: "بایگانی" },
      },
      
      orders: {
        title: "مدیریت سفارشات", description: "مشاهده و پیگیری همه سفارشات",
        ordersTitle: "سفارشات", totalOrders: "مجموع {count} سفارش",
        refresh: "بروزرسانی", searchPlaceholder: "جستجو با شماره سفارش...",
        filterByStatus: "فیلتر بر اساس وضعیت", allStatuses: "همه وضعیت‌ها",
        orderNumber: "شماره سفارش", status: "وضعیت", payment: "پرداخت",
        amount: "مبلغ", date: "تاریخ", actions: "اقدامات", noOrders: "سفارشی یافت نشد",
        loadError: "خطا در بارگذاری سفارشات",
        statuses: { pending: "در انتظار", confirmed: "تأیید شده", processing: "در حال پردازش", shipped: "ارسال شده", delivered: "تحویل داده شده", cancelled: "لغو شده", refunded: "بازپرداخت شده" },
        paymentStatuses: { pending: "در انتظار پرداخت", paid: "پرداخت شده", failed: "پرداخت ناموفق", refunded: "بازپرداخت شده" },
      },
      
      sellers: {
        title: "تأیید فروشندگان", description: "بررسی درخواست‌های تأیید فروشندگان",
        verificationsTitle: "درخواست‌های تأیید", totalRequests: "مجموع {count} درخواست",
        refresh: "بروزرسانی", searchPlaceholder: "جستجو با نام شرکت...",
        companyName: "نام شرکت", businessType: "نوع فعالیت", phone: "تلفن",
        status: "وضعیت", date: "تاریخ", actions: "اقدامات", unspecified: "مشخص نشده",
        rejectVerification: "رد درخواست تأیید", enterRejectionReason: "لطفاً دلیل رد درخواست را وارد کنید",
        rejectionReasonPlaceholder: "دلیل رد...", cancel: "انصراف", rejectRequest: "رد درخواست",
        rejecting: "در حال رد...", noVerifications: "درخواست تأییدی یافت نشد",
        loadError: "خطا در بارگذاری درخواست‌ها", approveSuccess: "فروشنده تأیید شد",
        approveError: "خطا در تأیید", rejectSuccess: "درخواست فروشنده رد شد", rejectError: "خطا در رد",
        statuses: { approved: "تأیید شده", pending: "در انتظار", rejected: "رد شده", suspended: "معلق" },
      },
      
      banners: {
        title: "مدیریت بنرها", description: "مدیریت بنرهای تبلیغاتی",
        bannersTitle: "بنرها", bannersDescription: "مدیریت بنرها و تبلیغات",
        addBanner: "افزودن بنر", noBanners: "بنری وجود ندارد",
        startByAdding: "با افزودن یک بنر جدید برای صفحه اصلی شروع کنید",
        addFirstBanner: "افزودن اولین بنر",
      },
      
      promotions: {
        title: "مدیریت تبلیغات", description: "ایجاد و مدیریت تبلیغات",
        promotionsTitle: "تبلیغات", promotionsDescription: "مدیریت کوپن‌ها و تخفیف‌ها",
        addPromotion: "افزودن تبلیغ", noPromotions: "تبلیغی وجود ندارد",
        startByCreating: "با ایجاد یک تبلیغ جدید شروع کنید", createFirst: "ایجاد اولین تبلیغ",
      },
      
      cms: {
        title: "مدیریت محتوا", description: "ویرایش صفحات و محتوای سایت",
        pages: {
          home: "صفحه اصلی", homeDescription: "مدیریت محتوای صفحه اصلی",
          about: "درباره ما", aboutDescription: "ویرایش صفحه درباره ما",
          contact: "تماس با ما", contactDescription: "ویرایش اطلاعات تماس",
          terms: "شرایط و ضوابط", termsDescription: "ویرایش شرایط و ضوابط",
          privacy: "سیاست حریم خصوصی", privacyDescription: "ویرایش سیاست حریم خصوصی",
        },
      },
      
      settings: {
        title: "تنظیمات", description: "تنظیمات سیستم و پیکربندی",
        saveChanges: "ذخیره تغییرات",
        tabs: { general: "عمومی", notifications: "اعلان‌ها", security: "امنیت" },
        general: {
          title: "تنظیمات عمومی", description: "تنظیمات اصلی سیستم",
          siteName: "نام سایت", siteNamePlaceholder: "نام فروشگاه",
          siteEmail: "ایمیل سایت", maintenanceMode: "حالت تعمیرات",
          maintenanceDescription: "غیرفعال کردن موقت سایت برای تعمیرات",
        },
        notifications: {
          title: "تنظیمات اعلان‌ها", description: "پیکربندی اعلان‌های ایمیل",
          newOrders: "اعلان‌های سفارش جدید", newOrdersDescription: "دریافت اعلان هنگام ایجاد سفارش جدید",
          newRegistrations: "اعلان‌های ثبت‌نام جدید", newRegistrationsDescription: "دریافت اعلان هنگام ثبت‌نام کاربر جدید",
          verificationRequests: "اعلان‌های درخواست تأیید", verificationRequestsDescription: "دریافت اعلان هنگام درخواست تأیید جدید",
        },
        security: {
          title: "تنظیمات امنیت", description: "پیکربندی گزینه‌های امنیتی",
          twoFactor: "احراز هویت دو مرحله‌ای", twoFactorDescription: "فعال‌سازی احراز هویت دو مرحله‌ای برای مدیران",
          activityLog: "ثبت فعالیت‌ها", activityLogDescription: "ثبت همه فعالیت‌های مدیران",
        },
      },
    },
    
    // Common
    common: {
      loading: "در حال بارگذاری...",
      noProducts: "محصولی یافت نشد",
      viewMore: "مشاهده بیشتر",
      backToHome: "بازگشت به صفحه اصلی",
      pageNotFound: "صفحه یافت نشد",
      search: "جستجو",
      cancel: "انصراف",
      save: "ذخیره",
      submit: "ارسال",
      close: "بستن",
      yes: "بله",
      no: "خیر",
      confirm: "تأیید",
      delete: "حذف",
      edit: "ویرایش",
      view: "مشاهده",
      all: "همه",
      none: "هیچکدام",
      or: "یا",
      and: "و",
      from: "از",
      to: "تا",
    },
    
    // Pages
    pages: {
      home: "صفحه اصلی",
      products: "محصولات",
      categories: "دسته‌بندی‌ها",
      about: "درباره ما",
      contact: "تماس با ما",
      blog: "وبلاگ",
      pricing: "قیمت‌گذاری",
      login: "ورود",
      register: "ثبت نام",
      newProducts: "محصولات جدید",
    },
    
    // Auth
    auth: {
      login: "ورود",
      register: "ثبت نام",
      email: "ایمیل",
      password: "رمز عبور",
      confirmPassword: "تأیید رمز عبور",
      forgotPassword: "رمز عبور را فراموش کردید؟",
      rememberMe: "مرا به خاطر بسپار",
      noAccount: "حساب کاربری ندارید؟",
      haveAccount: "حساب کاربری دارید؟",
      signUp: "ثبت نام کنید",
      signIn: "وارد شوید",
      logout: "خروج",
      fullName: "نام کامل",
      selectRole: "نقش خود را انتخاب کنید",
      createAccount: "ایجاد حساب کاربری",
      orContinueWith: "یا ادامه دهید با",
      agreeToTerms: "با ثبت نام، شما با",
      termsOfService: "شرایط خدمات",
      privacyPolicy: "سیاست حریم خصوصی",
      agree: "موافقت می‌کنید",
      resetPassword: "بازیابی رمز عبور",
      sendResetLink: "ارسال لینک بازیابی",
      backToLogin: "بازگشت به ورود",
      checkEmail: "ایمیل خود را بررسی کنید",
      resetLinkSent: "لینک بازیابی رمز عبور ارسال شد",
    },
    
    // Checkout
    checkout: {
      title: "تکمیل خرید",
      steps: {
        address: "آدرس",
        orderSummary: "خلاصه سفارش",
        payment: "پرداخت",
        confirm: "تأیید",
      },
      address: {
        title: "آدرس تحویل",
        name: "نام کامل",
        phone: "شماره تلفن",
        city: "شهر",
        fullAddress: "آدرس کامل",
        useProfileAddress: "استفاده از آدرس پروفایل",
        editAddress: "ویرایش آدرس",
      },
      orderSummary: {
        title: "خلاصه سفارش",
        product: "محصول",
        quantity: "تعداد",
        price: "قیمت",
        subtotal: "جمع کل",
        deliveryFee: "هزینه ارسال",
        total: "مجموع",
        sellerPolicies: "سیاست‌های فروشنده",
        returnPolicy: "سیاست بازگشت",
        shippingPolicy: "سیاست ارسال",
        noPolicyProvided: "سیاستی ارائه نشده",
      },
      payment: {
        title: "روش پرداخت",
        cashOnDelivery: "پرداخت در محل",
        cashOnDeliveryDesc: "هنگام تحویل کالا پرداخت کنید",
        onlinePaymentSoon: "پرداخت آنلاین به زودی",
      },
      confirm: {
        title: "تأیید سفارش",
        placeOrder: "ثبت سفارش",
        processing: "در حال پردازش...",
        reviewOrder: "لطفاً سفارش خود را بررسی کنید",
        orderSuccess: "سفارش با موفقیت ثبت شد",
        orderSuccessDesc: "سفارش شما ثبت شد و به زودی پردازش می‌شود",
      },
      errors: {
        emptyCart: "سبد خرید خالی است",
        fillAllFields: "لطفاً همه فیلدها را پر کنید",
        orderFailed: "خطا در ثبت سفارش",
      },
      navigation: {
        next: "بعدی",
        previous: "قبلی",
        backToCart: "بازگشت به سبد خرید",
      },
    },
    
    // Validation messages
    validation: {
      required: "این فیلد الزامی است",
      invalidEmail: "ایمیل نامعتبر است",
      passwordsDoNotMatch: "رمزهای عبور مطابقت ندارند",
      invalidPhone: "شماره تلفن نامعتبر است",
      minLength: "حداقل {min} کاراکتر وارد کنید",
      maxLength: "حداکثر {max} کاراکتر مجاز است",
    },
    
    // Error messages
    errors: {
      somethingWentWrong: "خطایی رخ داد",
      tryAgain: "لطفاً دوباره تلاش کنید",
      networkError: "خطای شبکه",
      unauthorized: "دسترسی غیر مجاز",
      notFound: "یافت نشد",
      serverError: "خطای سرور",
    },
    
    // Success messages
    success: {
      saved: "با موفقیت ذخیره شد",
      deleted: "با موفقیت حذف شد",
      updated: "با موفقیت بروزرسانی شد",
      created: "با موفقیت ایجاد شد",
    },
  },
  
  // ============================================
  // PASHTO (ps) - پښتو
  // ============================================
  ps: {
    // Navigation
    nav: {
      category: "کټګورۍ",
      products: "محصولات",
      categories: "کټګورۍ",
      newArrivals: "نوي راغلي",
      blog: "بلاګ",
      contactUs: "موږ سره اړیکه",
      aboutUs: "زموږ په اړه",
      specialOffer: "ځانګړی وړاندیز!",
      blackFriday: "تور جمعه",
    },
    
    // Header
    header: {
      searchPlaceholder: "محصولات ولټوئ...",
      search: "لټون",
      signIn: "ننوتل / نوم لیکنه",
      welcomeGuest: "ښه راغلاست میلمه",
      cart: "کارټ",
      wishlist: "د خوښې لیست",
      themeToggle: "تیاره/رڼا حالت بدل کړئ",
      logout: "وتل",
      logoutTitle: "له حساب څخه وتل",
      logoutConfirm: "ایا تاسو ډاډه یاست چې له خپل حساب څخه وتل غواړئ؟",
      menu: "مینو",
      language: "ژبه",
    },
    
    // Top Bar
    topBar: {
      callUs: "موږ ته زنګ ووهئ:",
      myAccount: "زما حساب",
      wishlist: "د خوښې لیست",
      checkout: "تادیه",
      language: "ژبه",
      currency: "افغانی",
    },
    
    // Categories
    categories: {
      title: "کټګورۍ",
      allCategories: "ټولې کټګورۍ",
      electronics: "بریښنایی توکي",
      fashion: "فیشن",
      homeGarden: "کور او باغ",
      sports: "سپورت او بهر",
      healthBeauty: "روغتیا او ښایست",
      toysGames: "لوبې",
      automotive: "موټر",
      booksMedia: "کتابونه او میډیا",
      subcategories: "فرعي کټګورۍ",
      productsInCategory: "په دې کټګورۍ کې محصولات",
    },
    
    // Hero Section
    hero: {
      sale: "۵۰٪ تخفیف",
      modernStyle: "عصري سټایل",
      headphones: "هیډفونونه",
      model: "ماډل",
      quickSale: "ګړندي! یوازې ۱۰۰ محصولات د دې تخفیف سره شتون لري.",
      shopNow: "اوس پیرود وکړئ",
      nowAvailable: "اوس شتون لري!",
      topSelling: "غوره پلور",
      startingFrom: "له",
      latestGeneration: "وروستی نسل",
      kitchenEssentials: "د پخلنځي توکي",
      mustHaveGadgets: "اړین وسایل",
    },
    
    // Product
    product: {
      reviews: "بیاکتنې",
      addToCart: "کارټ ته اضافه کړئ",
      quickView: "چټک لید",
      new: "نوی",
      hot: "تود",
      hours: "ساعتونه",
      minutes: "دقیقې",
      seconds: "ثانیې",
      price: "بیه",
      description: "تفصیل",
      specifications: "مشخصات",
      availability: "شتون",
      inStock: "شتون لري",
      outOfStock: "شتون نلري",
      quantity: "مقدار",
      addToWishlist: "خوښې ته اضافه کړئ",
      relatedProducts: "اړوند محصولات",
      sellerInfo: "د پلورونکي معلومات",
      allProducts: "ټول محصولات",
      newProducts: "نوي محصولات",
    },
    
    // Filters
    filters: {
      title: "فلترونه",
      priceRange: "د بیې حد",
      rating: "درجه بندي",
      brand: "برانډ",
      sortBy: "ترتیب",
      latest: "وروستي",
      popularity: "مشهور",
      priceLowHigh: "بیه: ټیټ څخه لوړ",
      priceHighLow: "بیه: لوړ څخه ټیټ",
      category: "کټګوري",
      seller: "پلورونکی",
      discount: "تخفیف لرونکي",
      clear: "پاک کړئ",
      apply: "پلي کړئ",
      min: "لږترلږه",
      max: "اعظمي",
    },
    
    // View
    view: {
      grid: "ګریډ لید",
      list: "لیست لید",
      showMore: "نور وښایاست",
      showLess: "لږ وښایاست",
    },
    
    // Today Deals
    deals: {
      todayDeal: "د نن سودا",
      seeAll: "ټول وګورئ",
    },
    
    // Best Sellers
    bestSellers: {
      weeklyBestSellers: "د اونۍ غوره پلور",
      television: "تلویزیون",
      airConditional: "ایرکنډیشنر",
      laptopsAccessories: "لپټاپ او لوازم",
      smartphoneTablets: "سمارټ فون او ټابلیت",
    },
    
    // Promo Banner
    promo: {
      savingOff: "یوازې iPad لپاره په ملیونونو ایپس کې ۲۰٪ خوندي کړئ",
      limitedOffer: "محدود وړاندیز. دا حیرانوونکی سوداګري له لاسه مه ورکوئ!",
    },
    
    // Category Banners
    categoryBanners: {
      tabletAccessories: "ټابلیت او لوازم",
      tvAudioVideo: "تلویزیون او آډیو/ویډیو",
      smartphoneAccessories: "سمارټ فون او لوازم",
    },
    
    // Footer
    footer: {
      freeShipping: "وړیا لیږد",
      ordersOver: "*شرایط پلي کیږي",
      securePayment: "خوندي تادیه",
      protected: "۱۰۰٪ خوندي",
      support: "۲۴/۷ ملاتړ",
      dedicatedHelp: "ځانګړی مرسته",
      easyReturns: "وړیا بیرته ورکول",
      daysReturn: "۳۰ ورځې بیرته ورکول",
      quickLinks: "چټک لینکونه",
      aboutUs: "زموږ په اړه",
      contactUs: "موږ سره اړیکه",
      privacyPolicy: "د محرمیت پالیسي",
      termsConditions: "شرایط",
      faq: "عمومي پوښتنې",
      sitemap: "د سایت نقشه",
      customerService: "پیرودونکو خدمات",
      myAccount: "زما حساب",
      orderTracking: "د سفارش تعقیب",
      wishlist: "د خوښې لیست",
      returns: "بیرته ورکول",
      shippingInfo: "د لیږد معلومات",
      giftCards: "تحفې کارتونه",
      newsletter: "خبر پاڼه",
      subscribeText: "د ځانګړو وړاندیزونو، تحفو او تخفیفونو لپاره ګډون وکړئ.",
      enterEmail: "خپل بریښنالیک دننه کړئ",
      allRightsReserved: "ټول حقونه خوندي دي",
      onlineStore: "آنلاین پلورنځی",
      description: "ستاسو د کیفیت لرونکو محصولاتو لپاره یو ځای د غوره بیو سره. په ډاډ سره پیرود وکړئ.",
    },
    
    // About Page
    about: {
      title: "زموږ په اړه",
      subtitle: "زموږ کیسه",
      mission: "زموږ ماموریت",
      missionText: "د غوره کیفیت محصولات د مناسبو بیو او غوره پیرودونکو خدماتو سره وړاندې کول.",
      vision: "زموږ لید",
      visionText: "په افغانستان او سیمه کې مخکښ آنلاین پلورنځی کېدل.",
      values: "زموږ ارزښتونه",
      valuesText: "صداقت، کیفیت، نوښت او د پیرودونکو رضایت.",
      team: "زموږ ټیم",
      history: "تاریخچه",
      historyText: "موږ په ۱۴۰۰ کال کې خپل کار پیل کړ او تر نن پورې زرګونو پیرودونکو ته خدمات وړاندې کړي.",
      awards: "جوایز او افتخارات",
      awardsText: "د ۱۴۰۲ غوره آنلاین پلورنځي جایزه ګټونکی",
    },
    
    // Contact Page
    contact: {
      title: "موږ سره اړیکه",
      subtitle: "موږ دلته یو ستاسو مرستې ته",
      name: "نوم",
      email: "بریښنالیک",
      phone: "تلیفون",
      subject: "موضوع",
      message: "پیغام",
      send: "پیغام واستوئ",
      address: "پته",
      workingHours: "کاري ساعتونه",
      success: "ستاسو پیغام په بریالیتوب سره واستول شو!",
      error: "د پیغام لیږلو کې تېروتنه. مهرباني وکړئ بیا هڅه وکړئ.",
      addressText: "کابل، افغانستان",
      phoneNumber: "+93 700 000 000",
      emailAddress: "info@store.af",
      workingHoursText: "شنبه تر پنجشنبې: ۸ سهار - ۶ ماښام",
    },
    
    // Blog Page
    blog: {
      title: "بلاګ",
      subtitle: "وروستي خبرونه او مقالې",
      searchPlaceholder: "مقالو کې ولټوئ...",
      readMore: "نور ولولئ",
      categories: "کټګورۍ",
      recentPosts: "وروستي پوسټونه",
      tags: "ټاګونه",
      noResults: "هیڅ مقاله ونه موندل شوه",
      publishedOn: "خپره شوې په",
      by: "له لوري",
      backToBlog: "بلاګ ته بیرته",
      views: "لیدونه",
      share: "شریک کړئ",
    },
    
    // Admin - Comprehensive translations
    admin: {
      panelTitle: "اداري پینل",
      panelSubtitle: "د سیسټم مدیریت",
      main: "اصلي",
      content: "منځپانګه",
      system: "سیسټم",
      manager: "مدیر",
      logout: "وتل",
      dashboard: "ډشبورډ",
      dashboardDescription: "د سیسټم عمومي لید",
      totalUsers: "ټول کاروونکي",
      totalOrders: "ټول سفارشونه",
      totalRevenue: "ټول عاید",
      pendingSellers: "انتظار کې پلورونکي",
      activeProducts: "فعال محصولات",
      newRegistrations: "نوې نوم لیکنې",
      activeSellers: "فعال پلورونکي",
      pendingProducts: "انتظار کې محصولات",
      alerts: "خبرتیاوې",
      thisWeek: "دا اونۍ",
      fromLastMonth: "تېر میاشت څخه",
      pendingReview: "بیاکتنې انتظار کې",
      needsAttention: "پاملرنې ته اړتیا لري",
      inProgress: "روان",
      awaitingVerification: "تصدیق انتظار کې",
      revenueOverview: "د عاید لید",
      monthlyRevenue: "میاشتني عاید",
      monthlyOrders: "میاشتني سفارشونه",
      revenue: "عاید",
      quickActions: "چټک اقدامات",
      reviewSellers: "پلورونکي بیاکتنه",
      pendingSellerRequests: "انتظار کې پلورونکو غوښتنې",
      reviewProducts: "محصولات بیاکتنه",
      pendingProductApprovals: "انتظار کې محصولات تایید",
      viewAllOrders: "ټول سفارشونه وګورئ",
      manageOrders: "سفارشونه او تحویلي مدیریت کړئ",
      recentActivity: "وروستي فعالیتونه",
      newUserRegistration: "د نوي کاروونکي نوم لیکنه",
      newUserJoined: "نوی کاروونکی د پیرودونکي په توګه ګډ شو",
      newOrder: "نوی سفارش",
      newOrderCreated: "نوی سفارش د ۱۵۰ ډالرو په ارزښت جوړ شو",
      newProductPending: "نوی محصول انتظار کې",
      newProductNeedsReview: "نوی محصول بیاکتنې ته اړتیا لري",
      newVerificationRequest: "نوې تصدیق غوښتنه",
      newSellerVerification: "نوي پلورونکي تصدیق غوښتنه لري",
      
      months: {
        january: "وری", february: "غویی", march: "غبرګولی", april: "چنګاښ",
        may: "زمری", june: "وږی", july: "تله", august: "لړم",
        september: "لیندۍ", october: "مرغومی", november: "سلواغه", december: "کب",
      },
      
      users: {
        title: "د کاروونکو مدیریت", description: "ټول کاروونکي وګورئ او مدیریت کړئ",
        usersTitle: "کاروونکي", totalUsers: "ټول {count} کاروونکي",
        refresh: "تازه کړئ", export: "صادر کړئ",
        searchPlaceholder: "د نوم یا بریښنالیک سره ولټوئ...", filterByRole: "د رول سره فلتر کړئ",
        allRoles: "ټول رولونه", buyers: "پیرودونکي", sellers: "پلورونکي",
        moderators: "ناظران", admins: "مدیران", user: "کاروونکی", role: "رول",
        registrationDate: "د نوم لیکنې نېټه", actions: "اقدامات",
        viewDetails: "تفصیلات وګورئ", suspendAccount: "حساب وځنډوئ",
        userDetails: "د کاروونکي تفصیلات", fullInfo: "بشپړ کاروونکي معلومات",
        close: "بند کړئ", noUsers: "هیڅ کاروونکی ونه موندل شو", loadError: "د کاروونکو پورته کولو کې تېروتنه",
        roles: { admin: "مدیر", moderator: "ناظر", seller: "پلورونکی", buyer: "پیرودونکی", unspecified: "نامعلوم" },
      },
      
      products: {
        title: "د محصولاتو مدیریت", description: "ټول محصولات بیاکتنه او مدیریت کړئ",
        productsTitle: "محصولات", totalProducts: "ټول {count} محصولات",
        refresh: "تازه کړئ", searchPlaceholder: "د نوم سره ولټوئ...",
        filterByStatus: "د حالت سره فلتر کړئ", allStatuses: "ټول حالتونه",
        product: "محصول", price: "بیه", status: "حالت", addedDate: "اضافه شوې نېټه",
        actions: "اقدامات", viewDetails: "تفصیلات وګورئ", approve: "تایید کړئ", reject: "رد کړئ",
        rejectProduct: "محصول رد کړئ", enterRejectionReason: "مهرباني وکړئ د رد دلیل ولیکئ",
        rejectionReasonPlaceholder: "د رد دلیل...", cancel: "لغوه کړئ", rejecting: "رد روان...",
        noProducts: "هیڅ محصول ونه موندل شو", loadError: "د محصولاتو پورته کولو کې تېروتنه",
        approveSuccess: "محصول تایید شو", approveError: "د تایید کې تېروتنه",
        rejectSuccess: "محصول رد شو", rejectError: "د رد کې تېروتنه",
        statuses: { active: "فعال", pending: "انتظار کې", rejected: "رد شوی", draft: "مسوده", archived: "آرشیف شوی" },
      },
      
      orders: {
        title: "د سفارشونو مدیریت", description: "ټول سفارشونه وګورئ او تعقیب کړئ",
        ordersTitle: "سفارشونه", totalOrders: "ټول {count} سفارشونه",
        refresh: "تازه کړئ", searchPlaceholder: "د سفارش نمبر سره ولټوئ...",
        filterByStatus: "د حالت سره فلتر کړئ", allStatuses: "ټول حالتونه",
        orderNumber: "سفارش نمبر", status: "حالت", payment: "تادیه",
        amount: "مبلغ", date: "نېټه", actions: "اقدامات", noOrders: "هیڅ سفارش ونه موندل شو",
        loadError: "د سفارشونو پورته کولو کې تېروتنه",
        statuses: { pending: "انتظار کې", confirmed: "تایید شوی", processing: "پروسس کې", shipped: "لیږل شوی", delivered: "تحویل شوی", cancelled: "لغوه شوی", refunded: "بیرته ورکړل شوی" },
        paymentStatuses: { pending: "تادیه انتظار کې", paid: "تادیه شوی", failed: "تادیه ناکامه", refunded: "بیرته ورکړل شوی" },
      },
      
      sellers: {
        title: "د پلورونکو تصدیق", description: "د پلورونکو تصدیق غوښتنې بیاکتنه کړئ",
        verificationsTitle: "تصدیق غوښتنې", totalRequests: "ټول {count} غوښتنې",
        refresh: "تازه کړئ", searchPlaceholder: "د شرکت نوم سره ولټوئ...",
        companyName: "د شرکت نوم", businessType: "د سوداګرۍ ډول", phone: "تلیفون",
        status: "حالت", date: "نېټه", actions: "اقدامات", unspecified: "مشخص نه دی",
        rejectVerification: "تصدیق غوښتنه رد کړئ", enterRejectionReason: "مهرباني وکړئ د رد دلیل ولیکئ",
        rejectionReasonPlaceholder: "د رد دلیل...", cancel: "لغوه کړئ", rejectRequest: "غوښتنه رد کړئ",
        rejecting: "رد روان...", noVerifications: "هیڅ تصدیق غوښتنه ونه موندل شوه",
        loadError: "د غوښتنو پورته کولو کې تېروتنه", approveSuccess: "پلورونکی تایید شو",
        approveError: "تایید ناکام", rejectSuccess: "پلورونکی غوښتنه رد شوه", rejectError: "رد ناکام",
        statuses: { approved: "تایید شوی", pending: "انتظار کې", rejected: "رد شوی", suspended: "ځنډول شوی" },
      },
      
      banners: {
        title: "د بنرونو مدیریت", description: "تبلیغاتي بنرونه مدیریت کړئ",
        bannersTitle: "بنرونه", bannersDescription: "بنرونه او تبلیغات مدیریت کړئ",
        addBanner: "بنر اضافه کړئ", noBanners: "هیڅ بنر نشته",
        startByAdding: "د کور پاڼې لپاره نوی بنر اضافه کولو سره پیل کړئ",
        addFirstBanner: "لومړی بنر اضافه کړئ",
      },
      
      promotions: {
        title: "د تبلیغاتو مدیریت", description: "تبلیغات جوړ او مدیریت کړئ",
        promotionsTitle: "تبلیغات", promotionsDescription: "کوپنونه او تخفیفونه مدیریت کړئ",
        addPromotion: "تبلیغ اضافه کړئ", noPromotions: "هیڅ تبلیغ نشته",
        startByCreating: "نوی تبلیغ جوړولو سره پیل کړئ", createFirst: "لومړی تبلیغ جوړ کړئ",
      },
      
      cms: {
        title: "د منځپانګې مدیریت", description: "د ویب پاڼې پاڼې او منځپانګه سم کړئ",
        pages: {
          home: "کور پاڼه", homeDescription: "د کور پاڼې منځپانګه مدیریت کړئ",
          about: "زموږ په اړه", aboutDescription: "زموږ په اړه پاڼه سم کړئ",
          contact: "موږ سره اړیکه", contactDescription: "د اړیکو معلومات سم کړئ",
          terms: "شرایط", termsDescription: "شرایط سم کړئ",
          privacy: "د محرمیت پالیسي", privacyDescription: "د محرمیت پالیسي سم کړئ",
        },
      },
      
      settings: {
        title: "ترتیبات", description: "د سیسټم ترتیبات او تنظیمات",
        saveChanges: "بدلونونه خوندي کړئ",
        tabs: { general: "عمومي", notifications: "خبرتیاوې", security: "امنیت" },
        general: {
          title: "عمومي ترتیبات", description: "اصلي سیسټم ترتیبات",
          siteName: "د سایت نوم", siteNamePlaceholder: "د پلورنځي نوم",
          siteEmail: "د سایت بریښنالیک", maintenanceMode: "ساتنې حالت",
          maintenanceDescription: "د ساتنې لپاره سایت موقتاً غیر فعال کړئ",
        },
        notifications: {
          title: "د خبرتیاوو ترتیبات", description: "د بریښنالیک خبرتیاوې تنظیم کړئ",
          newOrders: "نوي سفارش خبرتیاوې", newOrdersDescription: "د نوي سفارش په وخت کې خبرتیا ترلاسه کړئ",
          newRegistrations: "نوې نوم لیکنې خبرتیاوې", newRegistrationsDescription: "د نوي کاروونکي نوم لیکنې په وخت کې خبرتیا ترلاسه کړئ",
          verificationRequests: "تصدیق غوښتنې خبرتیاوې", verificationRequestsDescription: "د نوې تصدیق غوښتنې په وخت کې خبرتیا ترلاسه کړئ",
        },
        security: {
          title: "امنیتي ترتیبات", description: "امنیتي اختیارات تنظیم کړئ",
          twoFactor: "دوه مرحله ای تصدیق", twoFactorDescription: "د مدیرانو لپاره دوه مرحله ای تصدیق فعال کړئ",
          activityLog: "د فعالیت ثبت", activityLogDescription: "د مدیرانو ټول فعالیتونه ثبت کړئ",
        },
      },
    },
    
    // Common
    common: {
      loading: "پورته کیږي...",
      noProducts: "هیڅ محصول ونه موندل شو",
      viewMore: "نور وګورئ",
      backToHome: "کور ته بیرته",
      pageNotFound: "پاڼه ونه موندل شوه",
      search: "لټون",
      cancel: "لغوه کړئ",
      save: "خوندي کړئ",
      submit: "واستوئ",
      close: "بند کړئ",
      yes: "هو",
      no: "نه",
      confirm: "تایید کړئ",
      delete: "حذف کړئ",
      edit: "سم کړئ",
      view: "وګورئ",
      all: "ټول",
      none: "هیڅ",
      or: "یا",
      and: "او",
      from: "له",
      to: "ته",
    },
    
    // Pages
    pages: {
      home: "کور",
      products: "محصولات",
      categories: "کټګورۍ",
      about: "زموږ په اړه",
      contact: "اړیکه",
      blog: "بلاګ",
      pricing: "بیه ټاکل",
      login: "ننوتل",
      register: "نوم لیکنه",
      newProducts: "نوي محصولات",
    },
    
    // Auth
    auth: {
      login: "ننوتل",
      register: "نوم لیکنه",
      email: "بریښنالیک",
      password: "پټنوم",
      confirmPassword: "پټنوم تایید کړئ",
      forgotPassword: "پټنوم مو هیر شوی؟",
      rememberMe: "ما په یاد ولرئ",
      noAccount: "حساب نلرئ؟",
      haveAccount: "لا دمخه حساب لرئ؟",
      signUp: "نوم ولیکئ",
      signIn: "ننوزئ",
      logout: "وځئ",
      fullName: "بشپړ نوم",
      selectRole: "خپل رول وټاکئ",
      createAccount: "حساب جوړ کړئ",
      orContinueWith: "یا دوام ورکړئ سره",
      agreeToTerms: "د نوم لیکنې سره، تاسو موافق یاست سره",
      termsOfService: "د خدماتو شرایط",
      privacyPolicy: "د محرمیت پالیسي",
      agree: "",
      resetPassword: "پټنوم بیا تنظیم کړئ",
      sendResetLink: "د بیا تنظیم لینک واستوئ",
      backToLogin: "ننوتلو ته بیرته",
      checkEmail: "خپل بریښنالیک وګورئ",
      resetLinkSent: "د پټنوم بیا تنظیم لینک واستول شو",
    },
    
    // Checkout
    checkout: {
      title: "تادیه",
      steps: {
        address: "پته",
        orderSummary: "د سفارش لنډیز",
        payment: "تادیه",
        confirm: "تایید",
      },
      address: {
        title: "د تحویلي پته",
        name: "بشپړ نوم",
        phone: "تلیفون نمبر",
        city: "ښار",
        fullAddress: "بشپړه پته",
        useProfileAddress: "د پروفایل پته وکاروئ",
        editAddress: "پته سم کړئ",
      },
      orderSummary: {
        title: "د سفارش لنډیز",
        product: "محصول",
        quantity: "مقدار",
        price: "بیه",
        subtotal: "ټوله",
        deliveryFee: "د تحویلي فیس",
        total: "مجموعه",
        sellerPolicies: "د پلورونکي پالیسي",
        returnPolicy: "د بیرته ورکولو پالیسي",
        shippingPolicy: "د لیږد پالیسي",
        noPolicyProvided: "هیڅ پالیسي نشته",
      },
      payment: {
        title: "د تادیې طریقه",
        cashOnDelivery: "د تحویلي په وخت تادیه",
        cashOnDeliveryDesc: "کله چې سفارش ترلاسه کړئ تادیه کړئ",
        onlinePaymentSoon: "آنلاین تادیه ډېر ژر راځي",
      },
      confirm: {
        title: "سفارش تایید کړئ",
        placeOrder: "سفارش ورکړئ",
        processing: "پروسس روان...",
        reviewOrder: "مهرباني وکړئ خپل سفارش بیاکتنه کړئ",
        orderSuccess: "سفارش په بریالیتوب سره ورکړل شو",
        orderSuccessDesc: "ستاسو سفارش ورکړل شو او ډېر ژر پروسس کیږي",
      },
      errors: {
        emptyCart: "ستاسو کارټ خالي دی",
        fillAllFields: "مهرباني وکړئ ټول اړین ساحې ډک کړئ",
        orderFailed: "سفارش ورکولو کې ناکام",
      },
      navigation: {
        next: "راتلونکی",
        previous: "مخکینی",
        backToCart: "کارټ ته بیرته",
      },
    },
    
    // Validation messages
    validation: {
      required: "دا ساحه اړینه ده",
      invalidEmail: "ناسم بریښنالیک",
      passwordsDoNotMatch: "پټنومونه سره نه سمون لري",
      invalidPhone: "ناسم تلیفون نمبر",
      minLength: "لږترلږه {min} توري ولیکئ",
      maxLength: "اعظمي {max} توري اجازه لري",
    },
    
    // Error messages
    errors: {
      somethingWentWrong: "یو څه غلط شول",
      tryAgain: "مهرباني وکړئ بیا هڅه وکړئ",
      networkError: "د شبکې تېروتنه",
      unauthorized: "غیر مجاز لاسرسی",
      notFound: "ونه موندل شو",
      serverError: "د سرور تېروتنه",
    },
    
    // Success messages
    success: {
      saved: "په بریالیتوب سره خوندي شو",
      deleted: "په بریالیتوب سره حذف شو",
      updated: "په بریالیتوب سره تازه شو",
      created: "په بریالیتوب سره جوړ شو",
    },
  },
  
  // ============================================
  // ENGLISH (en)
  // ============================================
  en: {
    // Navigation
    nav: {
      category: "Category",
      products: "Products",
      categories: "Categories",
      newArrivals: "New Arrivals",
      blog: "Blog",
      contactUs: "Contact Us",
      aboutUs: "About Us",
      specialOffer: "Special Offer!",
      blackFriday: "Black Friday",
    },
    
    // Header
    header: {
      searchPlaceholder: "Search products...",
      search: "Search",
      signIn: "Sign In / Register",
      welcomeGuest: "Welcome Guest",
      cart: "Cart",
      wishlist: "Wishlist",
      themeToggle: "Toggle dark/light mode",
      logout: "Logout",
      logoutTitle: "Logout",
      logoutConfirm: "Are you sure you want to logout from your account?",
      menu: "Menu",
      language: "Language",
    },
    
    // Top Bar
    topBar: {
      callUs: "Call Us:",
      myAccount: "My Account",
      wishlist: "Wishlist",
      checkout: "Checkout",
      language: "Language",
      currency: "AFN",
    },
    
    // Categories
    categories: {
      title: "Categories",
      allCategories: "All Categories",
      electronics: "Electronics",
      fashion: "Fashion",
      homeGarden: "Home & Garden",
      sports: "Sports & Outdoors",
      healthBeauty: "Health & Beauty",
      toysGames: "Toys & Games",
      automotive: "Automotive",
      booksMedia: "Books & Media",
      subcategories: "Subcategories",
      productsInCategory: "Products in this category",
    },
    
    // Hero Section
    hero: {
      sale: "50% OFF",
      modernStyle: "Modern Style",
      headphones: "Headphones",
      model: "Model",
      quickSale: "Hurry up! Only 100 products at this discounted price.",
      shopNow: "Shop Now",
      nowAvailable: "Now Available!",
      topSelling: "Top Selling",
      startingFrom: "Starting from",
      latestGeneration: "Latest Generation",
      kitchenEssentials: "Kitchen Essentials",
      mustHaveGadgets: "Must-Have Gadgets",
    },
    
    // Product
    product: {
      reviews: "Reviews",
      addToCart: "Add to Cart",
      quickView: "Quick View",
      new: "New",
      hot: "Hot",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
      price: "Price",
      description: "Description",
      specifications: "Specifications",
      availability: "Availability",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      quantity: "Quantity",
      addToWishlist: "Add to Wishlist",
      relatedProducts: "Related Products",
      sellerInfo: "Seller Information",
      allProducts: "All Products",
      newProducts: "New Products",
    },
    
    // Filters
    filters: {
      title: "Filters",
      priceRange: "Price Range",
      rating: "Rating",
      brand: "Brand",
      sortBy: "Sort By",
      latest: "Latest",
      popularity: "Popularity",
      priceLowHigh: "Price: Low to High",
      priceHighLow: "Price: High to Low",
      category: "Category",
      seller: "Seller",
      discount: "Discounted",
      clear: "Clear",
      apply: "Apply",
      min: "Min",
      max: "Max",
    },
    
    // View
    view: {
      grid: "Grid View",
      list: "List View",
      showMore: "Show More",
      showLess: "Show Less",
    },
    
    // Today Deals
    deals: {
      todayDeal: "Today's Deals",
      seeAll: "See All",
    },
    
    // Best Sellers
    bestSellers: {
      weeklyBestSellers: "Weekly Best Sellers",
      television: "Television",
      airConditional: "Air Conditioner",
      laptopsAccessories: "Laptops & Accessories",
      smartphoneTablets: "Smartphones & Tablets",
    },
    
    // Promo Banner
    promo: {
      savingOff: "Save 20% on millions of apps only for iPad",
      limitedOffer: "Limited offer. Don't miss this amazing deal!",
    },
    
    // Category Banners
    categoryBanners: {
      tabletAccessories: "Tablets & Accessories",
      tvAudioVideo: "TV & Audio/Video",
      smartphoneAccessories: "Smartphones & Accessories",
    },
    
    // Footer
    footer: {
      freeShipping: "Free Shipping",
      ordersOver: "*T&Cs apply",
      securePayment: "Secure Payment",
      protected: "100% Protected",
      support: "24/7 Support",
      dedicatedHelp: "Dedicated Help",
      easyReturns: "Free Returns",
      daysReturn: "30 Days Return",
      quickLinks: "Quick Links",
      aboutUs: "About Us",
      contactUs: "Contact Us",
      privacyPolicy: "Privacy Policy",
      termsConditions: "Terms & Conditions",
      faq: "FAQ",
      sitemap: "Sitemap",
      customerService: "Customer Service",
      myAccount: "My Account",
      orderTracking: "Order Tracking",
      wishlist: "Wishlist",
      returns: "Returns",
      shippingInfo: "Shipping Info",
      giftCards: "Gift Cards",
      newsletter: "Newsletter",
      subscribeText: "Subscribe for special offers, gifts and discounts.",
      enterEmail: "Enter your email",
      allRightsReserved: "All Rights Reserved",
      onlineStore: "Online Store",
      description: "Your one-stop destination for quality products at unbeatable prices. Shop with confidence.",
    },
    
    // About Page
    about: {
      title: "About Us",
      subtitle: "Our Story",
      mission: "Our Mission",
      missionText: "To provide the best quality products at reasonable prices with excellent customer service.",
      vision: "Our Vision",
      visionText: "To become the leading online store in Afghanistan and the region.",
      values: "Our Values",
      valuesText: "Integrity, Quality, Innovation, and Customer Satisfaction.",
      team: "Our Team",
      history: "History",
      historyText: "We started in 2021 and have served thousands of customers to date.",
      awards: "Awards & Recognition",
      awardsText: "Winner of Best Online Store 2023",
    },
    
    // Contact Page
    contact: {
      title: "Contact Us",
      subtitle: "We're here to help",
      name: "Name",
      email: "Email",
      phone: "Phone",
      subject: "Subject",
      message: "Message",
      send: "Send Message",
      address: "Address",
      workingHours: "Working Hours",
      success: "Your message was sent successfully!",
      error: "Error sending message. Please try again.",
      addressText: "Kabul, Afghanistan",
      phoneNumber: "+93 700 000 000",
      emailAddress: "info@store.af",
      workingHoursText: "Saturday to Thursday: 8 AM - 6 PM",
    },
    
    // Blog Page
    blog: {
      title: "Blog",
      subtitle: "Latest News & Articles",
      searchPlaceholder: "Search articles...",
      readMore: "Read More",
      categories: "Categories",
      recentPosts: "Recent Posts",
      tags: "Tags",
      noResults: "No articles found",
      publishedOn: "Published on",
      by: "By",
      backToBlog: "Back to Blog",
      views: "views",
      share: "Share",
    },
    
    // Admin - Comprehensive translations
    admin: {
      panelTitle: "Admin Panel",
      panelSubtitle: "System Management",
      main: "Main",
      content: "Content",
      system: "System",
      manager: "Manager",
      logout: "Logout",
      dashboard: "Dashboard",
      dashboardDescription: "System Overview",
      totalUsers: "Total Users",
      totalOrders: "Total Orders",
      totalRevenue: "Total Revenue",
      pendingSellers: "Pending Sellers",
      activeProducts: "Active Products",
      newRegistrations: "New Registrations",
      activeSellers: "Active Sellers",
      pendingProducts: "Pending Products",
      alerts: "Alerts",
      thisWeek: "This Week",
      fromLastMonth: "From Last Month",
      pendingReview: "Pending Review",
      needsAttention: "Needs Attention",
      inProgress: "In Progress",
      awaitingVerification: "Awaiting Verification",
      revenueOverview: "Revenue Overview",
      monthlyRevenue: "Monthly Revenue",
      monthlyOrders: "Monthly Orders",
      revenue: "Revenue",
      quickActions: "Quick Actions",
      reviewSellers: "Review Sellers",
      pendingSellerRequests: "Pending seller requests",
      reviewProducts: "Review Products",
      pendingProductApprovals: "Pending product approvals",
      viewAllOrders: "View All Orders",
      manageOrders: "Manage orders and deliveries",
      recentActivity: "Recent Activity",
      newUserRegistration: "New User Registration",
      newUserJoined: "New user joined as buyer",
      newOrder: "New Order",
      newOrderCreated: "New order created worth $150",
      newProductPending: "New Product Pending",
      newProductNeedsReview: "New product needs review",
      newVerificationRequest: "New Verification Request",
      newSellerVerification: "New seller verification request",
      
      months: {
        january: "January", february: "February", march: "March", april: "April",
        may: "May", june: "June", july: "July", august: "August",
        september: "September", october: "October", november: "November", december: "December",
      },
      
      users: {
        title: "User Management", description: "View and manage all users",
        usersTitle: "Users", totalUsers: "Total {count} users",
        refresh: "Refresh", export: "Export",
        searchPlaceholder: "Search by name or email...", filterByRole: "Filter by Role",
        allRoles: "All Roles", buyers: "Buyers", sellers: "Sellers",
        moderators: "Moderators", admins: "Admins", user: "User", role: "Role",
        registrationDate: "Registration Date", actions: "Actions",
        viewDetails: "View Details", suspendAccount: "Suspend Account",
        userDetails: "User Details", fullInfo: "Full user information",
        close: "Close", noUsers: "No users found", loadError: "Failed to load users",
        roles: { admin: "Admin", moderator: "Moderator", seller: "Seller", buyer: "Buyer", unspecified: "Unspecified" },
      },
      
      products: {
        title: "Product Management", description: "Review and manage all products",
        productsTitle: "Products", totalProducts: "Total {count} products",
        refresh: "Refresh", searchPlaceholder: "Search by name...",
        filterByStatus: "Filter by Status", allStatuses: "All Statuses",
        product: "Product", price: "Price", status: "Status", addedDate: "Date Added",
        actions: "Actions", viewDetails: "View Details", approve: "Approve", reject: "Reject",
        rejectProduct: "Reject Product", enterRejectionReason: "Please enter rejection reason",
        rejectionReasonPlaceholder: "Rejection reason...", cancel: "Cancel", rejecting: "Rejecting...",
        noProducts: "No products found", loadError: "Failed to load products",
        approveSuccess: "Product approved", approveError: "Failed to approve product",
        rejectSuccess: "Product rejected", rejectError: "Failed to reject product",
        statuses: { active: "Active", pending: "Pending", rejected: "Rejected", draft: "Draft", archived: "Archived" },
      },
      
      orders: {
        title: "Order Management", description: "View and track all orders",
        ordersTitle: "Orders", totalOrders: "Total {count} orders",
        refresh: "Refresh", searchPlaceholder: "Search by order number...",
        filterByStatus: "Filter by Status", allStatuses: "All Statuses",
        orderNumber: "Order Number", status: "Status", payment: "Payment",
        amount: "Amount", date: "Date", actions: "Actions", noOrders: "No orders found",
        loadError: "Failed to load orders",
        statuses: { pending: "Pending", confirmed: "Confirmed", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded" },
        paymentStatuses: { pending: "Payment Pending", paid: "Paid", failed: "Payment Failed", refunded: "Refunded" },
      },
      
      sellers: {
        title: "Seller Verification", description: "Review seller verification requests",
        verificationsTitle: "Verification Requests", totalRequests: "Total {count} requests",
        refresh: "Refresh", searchPlaceholder: "Search by company name...",
        companyName: "Company Name", businessType: "Business Type", phone: "Phone",
        status: "Status", date: "Date", actions: "Actions", unspecified: "Not specified",
        rejectVerification: "Reject Verification Request", enterRejectionReason: "Please enter rejection reason",
        rejectionReasonPlaceholder: "Rejection reason...", cancel: "Cancel", rejectRequest: "Reject Request",
        rejecting: "Rejecting...", noVerifications: "No verification requests found",
        loadError: "Failed to load verification requests", approveSuccess: "Seller approved",
        approveError: "Approval failed", rejectSuccess: "Seller request rejected", rejectError: "Rejection failed",
        statuses: { approved: "Approved", pending: "Pending", rejected: "Rejected", suspended: "Suspended" },
      },
      
      banners: {
        title: "Banner Management", description: "Manage promotional banners",
        bannersTitle: "Banners", bannersDescription: "Manage banners and promotions",
        addBanner: "Add Banner", noBanners: "No banners found",
        startByAdding: "Start by adding a new banner for the home page",
        addFirstBanner: "Add First Banner",
      },
      
      promotions: {
        title: "Promotion Management", description: "Create and manage promotions",
        promotionsTitle: "Promotions", promotionsDescription: "Manage coupons and discounts",
        addPromotion: "Add Promotion", noPromotions: "No promotions found",
        startByCreating: "Start by creating a new promotion", createFirst: "Create First Promotion",
      },
      
      cms: {
        title: "Content Management", description: "Edit website pages and content",
        pages: {
          home: "Home Page", homeDescription: "Manage home page content",
          about: "About Us", aboutDescription: "Edit about us page",
          contact: "Contact Us", contactDescription: "Edit contact information",
          terms: "Terms & Conditions", termsDescription: "Edit terms and conditions",
          privacy: "Privacy Policy", privacyDescription: "Edit privacy policy",
        },
      },
      
      settings: {
        title: "Settings", description: "System settings and configuration",
        saveChanges: "Save Changes",
        tabs: { general: "General", notifications: "Notifications", security: "Security" },
        general: {
          title: "General Settings", description: "Main system settings",
          siteName: "Site Name", siteNamePlaceholder: "Store Name",
          siteEmail: "Site Email", maintenanceMode: "Maintenance Mode",
          maintenanceDescription: "Temporarily disable the site for maintenance",
        },
        notifications: {
          title: "Notification Settings", description: "Configure email notifications",
          newOrders: "New Order Notifications", newOrdersDescription: "Receive notifications for new orders",
          newRegistrations: "New Registration Notifications", newRegistrationsDescription: "Receive notifications for new user registrations",
          verificationRequests: "Verification Request Notifications", verificationRequestsDescription: "Receive notifications for new verification requests",
        },
        security: {
          title: "Security Settings", description: "Configure security options",
          twoFactor: "Two-Factor Authentication", twoFactorDescription: "Enable two-factor authentication for admins",
          activityLog: "Activity Logging", activityLogDescription: "Log all admin activities",
        },
      },
    },
    
    // Common
    common: {
      loading: "Loading...",
      noProducts: "No products found",
      viewMore: "View More",
      backToHome: "Back to Home",
      pageNotFound: "Page Not Found",
      search: "Search",
      cancel: "Cancel",
      save: "Save",
      submit: "Submit",
      close: "Close",
      yes: "Yes",
      no: "No",
      confirm: "Confirm",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      all: "All",
      none: "None",
      or: "or",
      and: "and",
      from: "from",
      to: "to",
    },
    
    // Pages
    pages: {
      home: "Home",
      products: "Products",
      categories: "Categories",
      about: "About",
      contact: "Contact",
      blog: "Blog",
      pricing: "Pricing",
      login: "Login",
      register: "Register",
      newProducts: "New Products",
    },
    
    // Auth
    auth: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      forgotPassword: "Forgot Password?",
      rememberMe: "Remember Me",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      signUp: "Sign Up",
      signIn: "Sign In",
      logout: "Logout",
      fullName: "Full Name",
      selectRole: "Select your role",
      createAccount: "Create Account",
      orContinueWith: "Or continue with",
      agreeToTerms: "By signing up, you agree to our",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      agree: "",
      resetPassword: "Reset Password",
      sendResetLink: "Send Reset Link",
      backToLogin: "Back to Login",
      checkEmail: "Check your email",
      resetLinkSent: "Password reset link sent",
    },
    
    // Checkout
    checkout: {
      title: "Checkout",
      steps: {
        address: "Address",
        orderSummary: "Order Summary",
        payment: "Payment",
        confirm: "Confirm",
      },
      address: {
        title: "Delivery Address",
        name: "Full Name",
        phone: "Phone Number",
        city: "City",
        fullAddress: "Full Address",
        useProfileAddress: "Use profile address",
        editAddress: "Edit Address",
      },
      orderSummary: {
        title: "Order Summary",
        product: "Product",
        quantity: "Quantity",
        price: "Price",
        subtotal: "Subtotal",
        deliveryFee: "Delivery Fee",
        total: "Total",
        sellerPolicies: "Seller Policies",
        returnPolicy: "Return Policy",
        shippingPolicy: "Shipping Policy",
        noPolicyProvided: "No policy provided",
      },
      payment: {
        title: "Payment Method",
        cashOnDelivery: "Cash on Delivery",
        cashOnDeliveryDesc: "Pay when you receive your order",
        onlinePaymentSoon: "Online payment coming soon",
      },
      confirm: {
        title: "Confirm Order",
        placeOrder: "Place Order",
        processing: "Processing...",
        reviewOrder: "Please review your order",
        orderSuccess: "Order placed successfully",
        orderSuccessDesc: "Your order has been placed and will be processed soon",
      },
      errors: {
        emptyCart: "Your cart is empty",
        fillAllFields: "Please fill all required fields",
        orderFailed: "Failed to place order",
      },
      navigation: {
        next: "Next",
        previous: "Previous",
        backToCart: "Back to Cart",
      },
    },
    
    // Validation messages
    validation: {
      required: "This field is required",
      invalidEmail: "Invalid email",
      passwordsDoNotMatch: "Passwords do not match",
      invalidPhone: "Invalid phone number",
      minLength: "Enter at least {min} characters",
      maxLength: "Maximum {max} characters allowed",
    },
    
    // Error messages
    errors: {
      somethingWentWrong: "Something went wrong",
      tryAgain: "Please try again",
      networkError: "Network error",
      unauthorized: "Unauthorized access",
      notFound: "Not found",
      serverError: "Server error",
    },
    
    // Success messages
    success: {
      saved: "Successfully saved",
      deleted: "Successfully deleted",
      updated: "Successfully updated",
      created: "Successfully created",
    },
  },
};

export type Translations = typeof translations.fa;

// Language context hook
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
  dir: 'rtl' | 'ltr';
  direction: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as Language) || 'fa';
    }
    return 'fa';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    const isRTL = RTL_LANGUAGES.includes(lang);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    // Update the font family based on language
    // Vazirmatn supports both Persian and Pashto scripts
    document.body.style.fontFamily = isRTL 
      ? "'Vazirmatn', sans-serif" 
      : "'Inter', 'Vazirmatn', sans-serif";
  };

  useEffect(() => {
    const isRTL = RTL_LANGUAGES.includes(language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.body.style.fontFamily = isRTL 
      ? "'Vazirmatn', sans-serif" 
      : "'Inter', 'Vazirmatn', sans-serif";
  }, [language]);

  const t = translations[language];
  const isRTL = RTL_LANGUAGES.includes(language);
  const dir = isRTL ? 'rtl' : 'ltr';
  const direction = dir;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, dir, direction }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Date formatting utilities
export const formatDate = (date: Date | string, language: Language): string => {
  const d = new Date(date);
  if (language === 'fa') {
    // Use Persian/Dari formatting
    return d.toLocaleDateString('fa-AF', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  if (language === 'ps') {
    // Use Pashto formatting (falls back to Persian locale as Pashto is similar)
    return d.toLocaleDateString('ps-AF', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Number formatting utilities
export const formatNumber = (num: number, language: Language): string => {
  if (language === 'fa' || language === 'ps') {
    // Both Persian and Pashto use Eastern Arabic numerals
    return num.toLocaleString('fa-AF');
  }
  return num.toLocaleString('en-US');
};

// Currency formatting utilities
export const formatCurrency = (amount: number, language: Language): string => {
  if (language === 'fa') {
    return `${formatNumber(amount, language)} افغانی`;
  }
  if (language === 'ps') {
    return `${formatNumber(amount, language)} افغانی`;
  }
  return `$${formatNumber(amount, language)}`;
};

// Get localized content with fallback chain: requested language -> English
export const getLocalizedContent = <T extends Record<string, unknown>>(
  item: T,
  field: string,
  language: Language
): string => {
  const localizedField = `${field}_${language === 'en' ? '' : language}`.replace(/_$/, '');
  const fallbackField = field;
  
  // Try localized field first, then fallback to base field (English)
  return (item[localizedField] as string) || (item[fallbackField] as string) || '';
};

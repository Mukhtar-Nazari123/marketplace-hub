// Trilingual translations for Login and Register pages (EN, FA, PS)

type Language = 'en' | 'fa' | 'ps';

export const authTranslations = {
  // Login Page
  login: {
    title: { en: 'Welcome Back', fa: 'ورود به حساب کاربری', ps: 'بیرته ښه راغلاست' },
    subtitle: { en: 'Sign in to your account to continue', fa: 'برای ادامه وارد حساب خود شوید', ps: 'د دوام لپاره خپل حساب ته ننوځئ' },
    email: { en: 'Email', fa: 'ایمیل', ps: 'بریښنالیک' },
    password: { en: 'Password', fa: 'رمز عبور', ps: 'پټنوم' },
    rememberMe: { en: 'Remember me', fa: 'مرا به خاطر بسپار', ps: 'ما په یاد ولره' },
    forgotPassword: { en: 'Forgot password?', fa: 'فراموشی رمز عبور؟', ps: 'پټنوم مو هیر شوی؟' },
    signIn: { en: 'Sign In', fa: 'ورود', ps: 'ننوتل' },
    signingIn: { en: 'Signing in...', fa: 'در حال ورود...', ps: 'ننوتل روان دي...' },
    noAccount: { en: "Don't have an account?", fa: 'حساب کاربری ندارید؟', ps: 'حساب نلرئ؟' },
    register: { en: 'Register', fa: 'ثبت‌نام', ps: 'نوم لیکنه' },
    back: { en: 'Back', fa: 'بازگشت', ps: 'شاته' },
    loginError: { en: 'Login Error', fa: 'خطا در ورود', ps: 'د ننوتلو تېروتنه' },
    loginSuccess: { en: 'Login Successful', fa: 'ورود موفق', ps: 'ننوتل بریالي شول' },
    welcomeBack: { en: 'Welcome back!', fa: 'خوش آمدید!', ps: 'بیرته ښه راغلاست!' },
    invalidCredentials: { en: 'Invalid email or password', fa: 'ایمیل یا رمز عبور اشتباه است', ps: 'ناسم بریښنالیک یا پټنوم' },
    confirmEmail: { en: 'Please confirm your email first', fa: 'لطفا ایمیل خود را تایید کنید', ps: 'مهرباني وکړئ لومړی خپل بریښنالیک تایید کړئ' },
  },
  
  // Register Page
  register: {
    title: { en: 'Create Account', fa: 'ایجاد حساب کاربری', ps: 'حساب جوړول' },
    subtitle: { en: 'Choose your account type', fa: 'نوع حساب خود را انتخاب کنید', ps: 'د حساب ډول غوره کړئ' },
    fullName: { en: 'Full Name', fa: 'نام کامل', ps: 'بشپړ نوم' },
    fullNamePlaceholder: { en: 'John Doe', fa: 'نام و نام خانوادگی', ps: 'ستاسو بشپړ نوم' },
    email: { en: 'Email', fa: 'ایمیل', ps: 'بریښنالیک' },
    password: { en: 'Password', fa: 'رمز عبور', ps: 'پټنوم' },
    confirmPassword: { en: 'Confirm Password', fa: 'تکرار رمز عبور', ps: 'پټنوم تایید کړئ' },
    agreeTerms: { en: 'I agree to the Terms and Conditions', fa: 'با قوانین و شرایط موافقم', ps: 'زه شرایطو او قوانینو سره موافق یم' },
    registerBtn: { en: 'Register', fa: 'ثبت‌نام', ps: 'نوم لیکنه' },
    registering: { en: 'Registering...', fa: 'در حال ثبت‌نام...', ps: 'نوم لیکنه روانه ده...' },
    haveAccount: { en: 'Already have an account?', fa: 'حساب کاربری دارید؟', ps: 'حساب لرئ؟' },
    login: { en: 'Login', fa: 'ورود', ps: 'ننوتل' },
    back: { en: 'Back', fa: 'بازگشت', ps: 'شاته' },
    successMessage: { en: 'Registration successful!', fa: 'ثبت‌نام با موفقیت انجام شد!', ps: 'نوم لیکنه بریالۍ شوه!' },
    redirecting: { en: 'Redirecting to login...', fa: 'در حال انتقال به صفحه ورود...', ps: 'د ننوتلو پاڼې ته لیږدول...' },
    registerError: { en: 'Registration Error', fa: 'خطا در ثبت‌نام', ps: 'د نوم لیکنې تېروتنه' },
    registerSuccess: { en: 'Registration Successful', fa: 'ثبت‌نام موفق', ps: 'نوم لیکنه بریالۍ شوه' },
    confirmEmailSent: { en: 'A confirmation email has been sent to you', fa: 'ایمیل تایید برای شما ارسال شد', ps: 'تاییدي بریښنالیک درته لیږل شوی' },
  },
  
  // Role Cards
  roles: {
    buyer: { en: 'Buyer', fa: 'خریدار', ps: 'پېرودونکی' },
    seller: { en: 'Seller', fa: 'فروشنده', ps: 'پلورونکی' },
    buyerDesc: { en: 'Browse and purchase products easily', fa: 'محصولات را مرور کنید و به راحتی خرید کنید', ps: 'محصولات وګورئ او په اسانۍ سره یې واخلئ' },
    sellerDesc: { en: 'Create a store and sell your products', fa: 'فروشگاه ایجاد کنید و محصولات خود را بفروشید', ps: 'پلورنځی جوړ کړئ او خپل محصولات پلور کړئ' },
  },
  
  // Password Strength
  passwordStrength: {
    label: { en: 'Password strength:', fa: 'قدرت رمز عبور:', ps: 'د پټنوم ځواک:' },
    weak: { en: 'Weak', fa: 'ضعیف', ps: 'کمزوری' },
    medium: { en: 'Medium', fa: 'متوسط', ps: 'منځنی' },
    strong: { en: 'Strong', fa: 'قوی', ps: 'قوي' },
    veryStrong: { en: 'Very Strong', fa: 'بسیار قوی', ps: 'ډېر قوي' },
  },
  
  // Validation Errors (localized)
  validation: {
    fullNameMin: { en: 'Full name must be at least 2 characters', fa: 'نام کامل باید حداقل ۲ کاراکتر باشد', ps: 'بشپړ نوم باید لږ تر لږه ۲ توري ولري' },
    invalidEmail: { en: 'Invalid email address', fa: 'آدرس ایمیل نامعتبر است', ps: 'ناسم بریښنالیک' },
    passwordMin: { en: 'Password must be at least 8 characters', fa: 'رمز عبور باید حداقل ۸ کاراکتر باشد', ps: 'پټنوم باید لږ تر لږه ۸ توري ولري' },
    passwordsNoMatch: { en: 'Passwords do not match', fa: 'رمزهای عبور مطابقت ندارند', ps: 'پټنومونه سره سمون نه لري' },
    agreeTermsRequired: { en: 'You must agree to the terms', fa: 'باید با شرایط موافقت کنید', ps: 'تاسو باید شرایطو ته ومنئ' },
    passwordRequired: { en: 'Password is required', fa: 'رمز عبور الزامی است', ps: 'پټنوم اړین دی' },
  },
};

export const useAuthTranslations = (language: Language) => {
  const t = (section: keyof typeof authTranslations, key: string): string => {
    const sectionData = authTranslations[section];
    if (sectionData && key in sectionData) {
      const translations = sectionData[key as keyof typeof sectionData] as { en: string; fa: string; ps: string };
      return translations[language] || translations.fa || translations.en;
    }
    return key;
  };
  
  const getLabel = (en: string, fa: string, ps: string): string => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };
  
  return { t, getLabel };
};

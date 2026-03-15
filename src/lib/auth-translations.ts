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
    continueWithGoogle: { en: 'Continue with Google', fa: 'ورود با گوگل', ps: 'د ګوګل سره ننوتل' },
    orDivider: { en: 'or', fa: 'یا', ps: 'یا' },
    googleError: { en: 'Google sign-in failed', fa: 'ورود با گوگل ناموفق بود', ps: 'د ګوګل سره ننوتل ناکام شول' },
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
    invalidEmailDomain: { en: 'This email domain does not exist. Please use a valid email.', fa: 'این دامنه ایمیل وجود ندارد. لطفاً از ایمیل معتبر استفاده کنید.', ps: 'د بریښنالیک ډومین شتون نلري. مهرباني وکړئ معتبر بریښنالیک وکاروئ.' },
    passwordMin: { en: 'Password must be at least 8 characters', fa: 'رمز عبور باید حداقل ۸ کاراکتر باشد', ps: 'پټنوم باید لږ تر لږه ۸ توري ولري' },
    passwordsNoMatch: { en: 'Passwords do not match', fa: 'رمزهای عبور مطابقت ندارند', ps: 'پټنومونه سره سمون نه لري' },
    agreeTermsRequired: { en: 'You must agree to the terms', fa: 'باید با شرایط موافقت کنید', ps: 'تاسو باید شرایطو ته ومنئ' },
    passwordRequired: { en: 'Password is required', fa: 'رمز عبور الزامی است', ps: 'پټنوم اړین دی' },
  },

  // Forgot Password Page
  forgotPassword: {
    title: { en: 'Reset Your Password', fa: 'بازیابی رمز عبور', ps: 'خپل پټنوم بیا تنظیم کړئ' },
    subtitle: { en: 'Enter your email address and we\'ll send you a link to reset your password', fa: 'ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود', ps: 'خپل بریښنالیک دننه کړئ او موږ به تاسو ته د پټنوم بیا تنظیمولو لینک واستوو' },
    email: { en: 'Email Address', fa: 'آدرس ایمیل', ps: 'بریښنالیک پته' },
    emailPlaceholder: { en: 'Enter your email', fa: 'ایمیل خود را وارد کنید', ps: 'خپل بریښنالیک دننه کړئ' },
    sendLink: { en: 'Send Reset Link', fa: 'ارسال لینک بازیابی', ps: 'د بیا تنظیم لینک واستوئ' },
    sending: { en: 'Sending...', fa: 'در حال ارسال...', ps: 'لیږل کېږي...' },
    backToLogin: { en: 'Back to Login', fa: 'بازگشت به صفحه ورود', ps: 'ننوتلو ته بیرته' },
    successTitle: { en: 'Check Your Email', fa: 'ایمیل خود را بررسی کنید', ps: 'خپل بریښنالیک وګورئ' },
    successMessage: { en: 'We\'ve sent a password reset link to your email. Please check your inbox and follow the instructions.', fa: 'لینک بازیابی رمز عبور به ایمیل شما ارسال شد. لطفا صندوق ورودی خود را بررسی کنید.', ps: 'موږ ستاسو بریښنالیک ته د پټنوم بیا تنظیم لینک واستاوه. مهرباني وکړئ خپل انباکس وګورئ.' },
    error: { en: 'Error', fa: 'خطا', ps: 'تېروتنه' },
    rememberPassword: { en: 'Remember your password?', fa: 'رمز عبور خود را به یاد دارید؟', ps: 'خپل پټنوم مو په یاد دی؟' },
    signIn: { en: 'Sign In', fa: 'ورود', ps: 'ننوتل' },
  },

  // Reset Password Page
  resetPassword: {
    title: { en: 'Create New Password', fa: 'ایجاد رمز عبور جدید', ps: 'نوی پټنوم جوړ کړئ' },
    subtitle: { en: 'Enter your new password below', fa: 'رمز عبور جدید خود را وارد کنید', ps: 'خپل نوی پټنوم لاندې دننه کړئ' },
    newPassword: { en: 'New Password', fa: 'رمز عبور جدید', ps: 'نوی پټنوم' },
    confirmPassword: { en: 'Confirm Password', fa: 'تکرار رمز عبور', ps: 'پټنوم تایید کړئ' },
    updatePassword: { en: 'Update Password', fa: 'تغییر رمز عبور', ps: 'پټنوم تازه کړئ' },
    updating: { en: 'Updating...', fa: 'در حال تغییر...', ps: 'تازه کول...' },
    successTitle: { en: 'Password Updated!', fa: 'رمز عبور تغییر کرد!', ps: 'پټنوم تازه شو!' },
    successMessage: { en: 'Your password has been successfully updated. You can now sign in with your new password.', fa: 'رمز عبور شما با موفقیت تغییر کرد. اکنون می‌توانید با رمز عبور جدید وارد شوید.', ps: 'ستاسو پټنوم په بریالیتوب سره تازه شو. تاسو اوس د خپل نوي پټنوم سره ننوتلی شئ.' },
    goToLogin: { en: 'Go to Login', fa: 'ورود به حساب', ps: 'حساب ته ننوتل' },
    invalidLink: { en: 'Invalid or Expired Link', fa: 'لینک نامعتبر یا منقضی شده', ps: 'ناسم یا ختم شوی لینک' },
    invalidLinkDesc: { en: 'This password reset link is invalid or has expired. Please request a new one.', fa: 'این لینک بازیابی نامعتبر یا منقضی شده است. لطفا درخواست جدید ارسال کنید.', ps: 'دا د پټنوم بیا تنظیم لینک ناسم یا ختم شوی دی. مهرباني وکړئ نوی غوښتنه وکړئ.' },
    requestAgain: { en: 'Request New Link', fa: 'درخواست مجدد', ps: 'نوی لینک غوښتنه' },
    error: { en: 'Error', fa: 'خطا', ps: 'تېروتنه' },
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

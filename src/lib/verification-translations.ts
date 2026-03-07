type Language = 'en' | 'fa' | 'ps';

export const verificationTranslations = {
  title: { en: 'Verify Your Email', fa: 'تأیید ایمیل', ps: 'خپل بریښنالیک تایید کړئ' },
  subtitle: { en: 'Enter the 6-digit code sent to', fa: 'کد ۶ رقمی ارسال شده به', ps: '۶ عددي کوډ دلته ولیکئ چې لیږل شوی' },
  verifying: { en: 'Verifying...', fa: 'در حال تأیید...', ps: 'تایید کېږي...' },
  verify: { en: 'Verify Email', fa: 'تأیید ایمیل', ps: 'بریښنالیک تایید کړئ' },
  resend: { en: 'Resend Code', fa: 'ارسال مجدد کد', ps: 'کوډ بیا ولیږئ' },
  resendIn: { en: 'Resend in', fa: 'ارسال مجدد در', ps: 'بیا لیږل په' },
  seconds: { en: 'seconds', fa: 'ثانیه', ps: 'ثانیو کې' },
  codeExpires: { en: 'Code expires in', fa: 'کد منقضی می‌شود در', ps: 'کوډ ختمېږي په' },
  minutes: { en: 'min', fa: 'دقیقه', ps: 'دقیقو' },
  success: { en: 'Email verified successfully!', fa: 'ایمیل با موفقیت تأیید شد!', ps: 'بریښنالیک په بریالیتوب تایید شو!' },
  redirecting: { en: 'Redirecting to your dashboard...', fa: 'در حال انتقال به داشبورد...', ps: 'ستاسو ډشبورډ ته لیږدول...' },
  invalidCode: { en: 'Invalid verification code', fa: 'کد تأیید نامعتبر', ps: 'ناسم تایید کوډ' },
  expiredCode: { en: 'Code has expired. Please request a new one.', fa: 'کد منقضی شده. لطفاً کد جدید درخواست کنید.', ps: 'کوډ ختم شوی. مهرباني وکړئ نوی کوډ غوښتنه وکړئ.' },
  tooManyAttempts: { en: 'Too many attempts. Please request a new code.', fa: 'تلاش‌های بیش از حد. لطفاً کد جدید درخواست کنید.', ps: 'ډیرې هڅې. مهرباني وکړئ نوی کوډ غوښتنه وکړئ.' },
  tooManyRequests: { en: 'Too many requests. Please wait before trying again.', fa: 'درخواست‌های بیش از حد. لطفاً صبر کنید.', ps: 'ډیرې غوښتنې. مهرباني وکړئ انتظار وکړئ.' },
  remainingAttempts: { en: 'attempts remaining', fa: 'تلاش باقیمانده', ps: 'پاتې هڅې' },
  codeSent: { en: 'New code sent!', fa: 'کد جدید ارسال شد!', ps: 'نوی کوډ ولیږل شو!' },
  checkEmail: { en: 'Check your email for the verification code', fa: 'ایمیل خود را برای کد تأیید بررسی کنید', ps: 'د تایید کوډ لپاره خپل بریښنالیک وګورئ' },
  back: { en: 'Back to Register', fa: 'بازگشت به ثبت‌نام', ps: 'نوم لیکنې ته شاته' },
  noCode: { en: 'No active code found. Please request a new one.', fa: 'کد فعالی یافت نشد. لطفاً کد جدید درخواست کنید.', ps: 'فعال کوډ ونه موندل شو. مهرباني وکړئ نوی غوښتنه وکړئ.' },
};

export const useVerificationTranslations = (language: Language) => {
  const t = (key: keyof typeof verificationTranslations): string => {
    const entry = verificationTranslations[key];
    return entry[language] || entry.en;
  };
  return { t };
};

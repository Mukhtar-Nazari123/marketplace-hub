import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { ClipboardCheck, Clock, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const SellerProfileChoice = () => {
  const { user, role, loading } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (role !== 'seller') {
        navigate('/');
      }
    }
  }, [user, role, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", isRTL && "rtl")}>
      <TopBar />
      <Header />
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome section */}
          <div className={cn("text-center mb-12", isRTL && "rtl")}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isRTL ? 'به خانواده فروشندگان خوش آمدید!' : 'Welcome to the Seller Family!'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isRTL 
                ? 'برای شروع فروش، ابتدا باید پروفایل فروشندگی خود را تکمیل کنید. این کار فقط چند دقیقه طول می‌کشد.' 
                : 'To start selling, you need to complete your seller profile first. This only takes a few minutes.'}
            </p>
          </div>

          {/* Choice cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Complete Now */}
            <Card className={cn(
              "relative overflow-hidden cursor-pointer transition-all duration-300",
              "hover:shadow-lg hover:border-primary/50 group"
            )}
              onClick={() => navigate('/seller/complete-profile')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">
                  {isRTL ? 'همین الان تکمیل کنم' : 'Complete Now'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'پروفایل خود را در چند دقیقه تکمیل کنید' : 'Complete your profile in a few minutes'}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className={cn("text-sm text-muted-foreground space-y-2 mb-6", isRTL && "text-right")}>
                  <li className="flex items-center gap-2">
                    {isRTL ? <ArrowLeft className="w-4 h-4 text-primary" /> : <ArrowRight className="w-4 h-4 text-primary" />}
                    {isRTL ? 'فرم ساده و مرحله‌ای' : 'Simple step-by-step form'}
                  </li>
                  <li className="flex items-center gap-2">
                    {isRTL ? <ArrowLeft className="w-4 h-4 text-primary" /> : <ArrowRight className="w-4 h-4 text-primary" />}
                    {isRTL ? 'ذخیره خودکار اطلاعات' : 'Auto-save your progress'}
                  </li>
                  <li className="flex items-center gap-2">
                    {isRTL ? <ArrowLeft className="w-4 h-4 text-primary" /> : <ArrowRight className="w-4 h-4 text-primary" />}
                    {isRTL ? 'بررسی سریع توسط تیم پشتیبانی' : 'Quick review by our team'}
                  </li>
                </ul>
                <Button className="w-full group-hover:bg-primary/90">
                  {isRTL ? 'شروع کنید' : 'Get Started'}
                  {isRTL ? <ArrowLeft className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </CardContent>
            </Card>

            {/* Complete Later */}
            <Card className={cn(
              "relative overflow-hidden cursor-pointer transition-all duration-300",
              "hover:shadow-lg hover:border-muted-foreground/50 group"
            )}
              onClick={() => navigate('/dashboard/seller/pending')}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">
                  {isRTL ? 'بعداً تکمیل می‌کنم' : 'Complete Later'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'فعلاً وارد داشبورد شوید' : 'Go to your dashboard for now'}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className={cn("text-sm text-muted-foreground space-y-2 mb-6", isRTL && "text-right")}>
                  <li className="flex items-center gap-2">
                    {isRTL ? <ArrowLeft className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                    {isRTL ? 'مشاهده وضعیت حساب' : 'View your account status'}
                  </li>
                  <li className="flex items-center gap-2">
                    {isRTL ? <ArrowLeft className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                    {isRTL ? 'یادآوری برای تکمیل پروفایل' : 'Reminder to complete profile'}
                  </li>
                  <li className="flex items-center gap-2">
                    {isRTL ? <ArrowLeft className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                    {isRTL ? 'دسترسی محدود تا تأیید' : 'Limited access until approval'}
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  {isRTL ? 'ادامه به داشبورد' : 'Continue to Dashboard'}
                  {isRTL ? <ArrowLeft className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SellerProfileChoice;

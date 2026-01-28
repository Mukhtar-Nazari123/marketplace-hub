import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import StickyNavbar from '@/components/layout/StickyNavbar';
import { ClipboardCheck, Clock, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSellerProfileTranslations } from '@/lib/seller-profile-translations';

const SellerProfileChoice = () => {
  const { user, role, loading } = useAuth();
  const { isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const { t } = useSellerProfileTranslations(language as 'en' | 'fa' | 'ps');

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

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", isRTL && "rtl")}>
      {/* Auto-hide Sticky Navbar */}
      <StickyNavbar>
        <Header />
        <Navigation />
      </StickyNavbar>
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome section */}
          <div className={cn("text-center mb-12", isRTL && "rtl")}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {t('choice', 'welcomeTitle')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('choice', 'welcomeSubtitle')}
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
                  {t('choice', 'completeNow')}
                </CardTitle>
                <CardDescription>
                  {t('choice', 'completeNowDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className={cn("text-sm text-muted-foreground space-y-2 mb-6", isRTL && "text-right")}>
                  <li className="flex items-center gap-2">
                    <ArrowIcon className="w-4 h-4 text-primary" />
                    {t('choice', 'simpleForm')}
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowIcon className="w-4 h-4 text-primary" />
                    {t('choice', 'autoSave')}
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowIcon className="w-4 h-4 text-primary" />
                    {t('choice', 'quickReview')}
                  </li>
                </ul>
                <Button className="w-full group-hover:bg-primary/90">
                  {t('buttons', 'getStarted')}
                  <ArrowIcon className={cn("w-4 h-4", isRTL ? "mr-2" : "ml-2")} />
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
                  {t('choice', 'completeLater')}
                </CardTitle>
                <CardDescription>
                  {t('choice', 'completeLaterDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className={cn("text-sm text-muted-foreground space-y-2 mb-6", isRTL && "text-right")}>
                  <li className="flex items-center gap-2">
                    <ArrowIcon className="w-4 h-4 text-muted-foreground" />
                    {t('choice', 'viewAccountStatus')}
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowIcon className="w-4 h-4 text-muted-foreground" />
                    {t('choice', 'reminderToComplete')}
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowIcon className="w-4 h-4 text-muted-foreground" />
                    {t('choice', 'limitedAccess')}
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  {t('buttons', 'continueToDashboard')}
                  <ArrowIcon className={cn("w-4 h-4", isRTL ? "mr-2" : "ml-2")} />
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

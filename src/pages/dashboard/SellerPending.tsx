import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSellerStatus } from '@/hooks/useSellerStatus';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, AlertCircle, XCircle, Home, RefreshCw, FileEdit, AlertTriangle } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';

const SellerPending = () => {
  const { user, role, loading: authLoading } = useAuth();
  const { status, profileCompleted, loading: statusLoading, refetch } = useSellerStatus();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (!authLoading && role !== 'seller') {
      navigate('/');
    } else if (!statusLoading && status === 'approved') {
      navigate('/dashboard/seller');
    }
  }, [user, role, authLoading, status, statusLoading, navigate]);

  const texts = {
    pending: {
      title: isRTL ? 'حساب در انتظار تأیید' : 'Account Pending Approval',
      description: isRTL 
        ? 'حساب فروشنده شما در انتظار تأیید توسط مدیر است. لطفاً صبر کنید.'
        : 'Your seller account is pending approval by an administrator. Please wait.',
      icon: Clock,
      color: 'bg-warning text-warning-foreground',
    },
    rejected: {
      title: isRTL ? 'حساب رد شده' : 'Account Rejected',
      description: isRTL 
        ? 'متأسفانه درخواست فروشندگی شما رد شده است. لطفاً با پشتیبانی تماس بگیرید.'
        : 'Unfortunately, your seller application has been rejected. Please contact support.',
      icon: XCircle,
      color: 'bg-destructive text-destructive-foreground',
    },
    suspended: {
      title: isRTL ? 'حساب معلق' : 'Account Suspended',
      description: isRTL 
        ? 'حساب فروشنده شما معلق شده است. لطفاً با پشتیبانی تماس بگیرید.'
        : 'Your seller account has been suspended. Please contact support.',
      icon: AlertCircle,
      color: 'bg-muted text-muted-foreground',
    },
  };

  const currentStatus = status === 'rejected' ? 'rejected' : status === 'suspended' ? 'suspended' : 'pending';
  const statusConfig = texts[currentStatus];
  const StatusIcon = statusConfig.icon;

  if (authLoading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">
          {isRTL ? 'در حال بارگذاری...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <Header />
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center gap-6">
        {/* Incomplete Profile Banner */}
        {!profileCompleted && (
          <Alert variant="destructive" className="max-w-md w-full border-warning bg-warning/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-warning-foreground">
              {isRTL ? 'پروفایل ناقص' : 'Incomplete Profile'}
            </AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <span className="text-muted-foreground">
                {isRTL 
                  ? 'پروفایل فروشندگی شما هنوز تکمیل نشده است. لطفاً پروفایل خود را تکمیل کنید تا درخواست شما بررسی شود.'
                  : 'Your seller profile is incomplete. Please complete your profile for your application to be reviewed.'}
              </span>
              <Button asChild variant="outline" size="sm" className="w-fit gap-2">
                <Link to="/seller/complete-profile">
                  <FileEdit size={16} />
                  {isRTL ? 'تکمیل پروفایل' : 'Complete Profile'}
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <div className={`w-20 h-20 rounded-full ${statusConfig.color} flex items-center justify-center`}>
                <StatusIcon className="h-10 w-10" />
              </div>
            </div>
            <CardTitle className="text-xl">{statusConfig.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {statusConfig.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="text-sm px-4 py-1">
                {isRTL ? 'وضعیت:' : 'Status:'} {' '}
                {status === 'pending' && (isRTL ? 'در انتظار' : 'Pending')}
                {status === 'rejected' && (isRTL ? 'رد شده' : 'Rejected')}
                {status === 'suspended' && (isRTL ? 'معلق' : 'Suspended')}
              </Badge>
              {profileCompleted ? (
                <Badge variant="secondary" className="text-sm px-4 py-1 bg-success/20 text-success">
                  {isRTL ? 'پروفایل کامل' : 'Profile Complete'}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-sm px-4 py-1 bg-warning/20 text-warning">
                  {isRTL ? 'پروفایل ناقص' : 'Profile Incomplete'}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => refetch()} className="gap-2">
                <RefreshCw size={16} />
                {isRTL ? 'بررسی مجدد وضعیت' : 'Check Status'}
              </Button>
              <Button variant="cyan" onClick={() => navigate('/')} className="gap-2">
                <Home size={16} />
                {isRTL ? 'بازگشت به صفحه اصلی' : 'Return Home'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SellerPending;
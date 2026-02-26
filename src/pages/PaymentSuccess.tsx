import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/lib/i18n';
import PublicLayout from '@/components/layout/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PaymentSuccess = () => {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cleared, setCleared] = useState(false);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Clear cart after successful payment
    if (user && !cleared) {
      clearCart().then(() => setCleared(true));
    }
  }, [user, cleared, clearCart]);

  const getLabel = (en: string, fa: string, ps: string) => {
    if (isRTL) return fa;
    return en;
  };

  return (
    <PublicLayout showFooter={true}>
      <div className={cn('min-h-[60vh] flex items-center justify-center px-4 py-16', isRTL && 'rtl')}>
        <Card className="max-w-lg w-full overflow-hidden">
          {/* Success header gradient */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {getLabel('Payment Successful!', 'پرداخت موفق!', 'تادیه بریالۍ!')}
            </h1>
            <p className="text-white/80 mt-2">
              {getLabel(
                'Your order has been placed successfully.',
                'سفارش شما با موفقیت ثبت شد.',
                'ستاسو امر په بریالیتوب سره ثبت شو.'
              )}
            </p>
          </div>

          <CardContent className="p-8 text-center space-y-6">
            <p className="text-muted-foreground">
              {getLabel(
                'Thank you for your purchase! You will receive a confirmation email shortly.',
                'از خرید شما ممنونیم! به زودی ایمیل تأیید دریافت خواهید کرد.',
                'ستاسو له پیرود مننه! ډیر ژر به تاسو تایید بریښنالیک ترلاسه کړئ.'
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/dashboard/buyer/orders')} className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                {getLabel('View My Orders', 'مشاهده سفارشات', 'زما امرونه وګورئ')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                {getLabel('Continue Shopping', 'ادامه خرید', 'پیرود ته دوام ورکړئ')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default PaymentSuccess;

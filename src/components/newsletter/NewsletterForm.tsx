import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNewsletterSubscribe } from '@/hooks/useNewsletter';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'sonner';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'default' | 'compact';
  className?: string;
}

const NewsletterForm = ({ variant = 'default', className = '' }: NewsletterFormProps) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { t, isRTL } = useLanguage();
  const { mutate: subscribe, isPending } = useNewsletterSubscribe();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error(isRTL ? 'لطفاً ایمیل خود را وارد کنید' : 'Please enter your email');
      return;
    }

    subscribe(email, {
      onSuccess: (data) => {
        toast.success(data.message);
        setEmail('');
        setIsSubscribed(true);
        setTimeout(() => setIsSubscribed(false), 5000);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  if (isSubscribed) {
    return (
      <div className={`flex items-center gap-2 text-green-500 ${className}`}>
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm">
          {isRTL ? 'با موفقیت عضو شدید!' : 'Successfully subscribed!'}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
          <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder={isRTL ? 'ایمیل شما' : 'Your email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ps-9 border-2 border-orange focus:border-orange"
            disabled={isPending}
          />
        </div>
        <Button type="submit" disabled={isPending} size="sm" className="border-2 border-orange bg-orange hover:bg-orange-dark text-white">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            isRTL ? 'عضویت' : 'Subscribe'
          )}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <div className="relative">
        <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="email"
          placeholder={isRTL ? 'آدرس ایمیل شما' : 'Enter your email address'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="ps-10 h-12 border-2 border-orange focus:border-orange"
          disabled={isPending}
        />
      </div>
      <Button type="submit" className="w-full h-11 border-2 border-orange bg-orange hover:bg-orange-dark text-white" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin me-2" />
            {isRTL ? 'در حال ثبت...' : 'Subscribing...'}
          </>
        ) : (
          isRTL ? 'عضویت در خبرنامه' : 'Subscribe to Newsletter'
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        {isRTL 
          ? 'دریافت آخرین تخفیف‌ها و محصولات جدید'
          : 'Get the latest deals, discounts & new products'}
      </p>
    </form>
  );
};

export default NewsletterForm;

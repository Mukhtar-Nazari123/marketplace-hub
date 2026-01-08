import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useContactSettings } from '@/hooks/useContactSettings';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Loader2,
} from 'lucide-react';

const Contact = () => {
  const { t, language, isRTL } = useLanguage();
  const { user, role } = useAuth();
  const { address, phone, email, workingHours, isLoading: isLoadingSettings } = useContactSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = isRTL ? 'نام الزامی است' : 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = isRTL ? 'نام باید کمتر از 100 حرف باشد' : 'Name must be less than 100 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = isRTL ? 'ایمیل الزامی است' : 'Email is required';
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      newErrors.email = isRTL ? 'لطفاً یک ایمیل معتبر وارد کنید' : 'Please enter a valid email';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = isRTL ? 'موضوع الزامی است' : 'Subject is required';
    } else if (formData.subject.length > 200) {
      newErrors.subject = isRTL ? 'موضوع باید کمتر از 200 حرف باشد' : 'Subject must be less than 200 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = isRTL ? 'پیام الزامی است' : 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = isRTL ? 'پیام باید حداقل 10 حرف باشد' : 'Message must be at least 10 characters';
    } else if (formData.message.length > 5000) {
      newErrors.message = isRTL ? 'پیام باید کمتر از 5000 حرف باشد' : 'Message must be less than 5000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        full_name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        user_id: user?.id || undefined,
        user_role: role || 'guest',
        locale: language,
      };

      const { data, error } = await supabase.functions.invoke('contact-submit', {
        body: payload,
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit message');
      }

      toast({
        title: isRTL ? 'موفق!' : 'Success!',
        description: isRTL ? 'پیام شما با موفقیت ارسال شد.' : 'Your message has been sent successfully.',
      });

      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      
      let errorMessage = isRTL 
        ? 'ارسال پیام ناموفق بود. لطفاً دوباره تلاش کنید.'
        : 'Failed to send message. Please try again.';

      if (error.message?.includes('Too many requests')) {
        errorMessage = isRTL 
          ? 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً تلاش کنید.'
          : 'Too many requests. Please try again later.';
      }

      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: t.contact.address,
      value: address,
      loading: isLoadingSettings,
    },
    {
      icon: Phone,
      title: t.contact.phone,
      value: phone,
      loading: isLoadingSettings,
    },
    {
      icon: Mail,
      title: t.contact.email,
      value: email,
      loading: isLoadingSettings,
    },
    {
      icon: Clock,
      title: t.contact.workingHours,
      value: workingHours,
      loading: isLoadingSettings,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              {t.pages.home}
            </Link>
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <span className="text-primary">{t.contact.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-cyan-400 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-4">
            <MessageCircle className="text-white" size={20} />
            <span className="text-white font-medium">{t.contact.title}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t.contact.title}</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16" id="contact-form">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              {contactInfo.map((info, idx) => (
                <div
                  key={idx}
                  className="bg-card rounded-2xl p-6 shadow-sm border border-border flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <info.icon className="text-primary" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-1">{info.title}</h3>
                    {info.loading ? (
                      <Skeleton className="h-5 w-32" />
                    ) : (
                      <p className="text-muted-foreground">{info.value}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Map Placeholder */}
              <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d210182.28040424897!2d69.0282986!3d34.5553494!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d16eb6f8ff026d%3A0x9f65f29c4c6ea5b8!2sKabul%2C%20Afghanistan!5e0!3m2!1sen!2s!4v1234567890"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Map"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">{t.contact.send}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t.contact.name} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isRTL ? 'نام شما' : 'Your name'}
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t.contact.email} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={isRTL ? 'ایمیل شما' : 'Your email'}
                        dir="ltr"
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.contact.phone}</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+93 700 000 000"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t.contact.subject} <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder={isRTL ? 'موضوع پیام' : 'Message subject'}
                        className={errors.subject ? 'border-destructive' : ''}
                      />
                      {errors.subject && (
                        <p className="text-sm text-destructive mt-1">{errors.subject}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.contact.message} <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      placeholder={isRTL ? 'پیام خود را بنویسید...' : 'Write your message...'}
                      className={errors.message ? 'border-destructive' : ''}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive mt-1">{errors.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.message.length}/5000
                    </p>
                  </div>

                  <Button
                    type="submit"
                    variant="cyan"
                    size="lg"
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Send size={20} />
                    )}
                    {t.contact.send}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;

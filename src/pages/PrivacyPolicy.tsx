import { useActivePrivacyPolicy } from '@/hooks/usePrivacyPolicies';
import { useLanguage } from '@/lib/i18n';
import PublicLayout from '@/components/layout/PublicLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  const { language, isRTL } = useLanguage();
  const { data: policy, isLoading } = useActivePrivacyPolicy('general', 'web');

  const getLocalized = (en: string | null, fa: string | null, ps: string | null) => {
    if (language === 'ps') return ps || fa || en || '';
    if (language === 'fa') return fa || en || '';
    return en || '';
  };

  const title = policy ? getLocalized(policy.title_en, policy.title_fa, policy.title_ps) : '';
  const content = policy ? getLocalized(policy.content_en, policy.content_fa, policy.content_ps) : '';
  const metaTitle = policy ? getLocalized(policy.meta_title_en, policy.meta_title_fa, policy.meta_title_ps) : '';
  const metaDesc = policy ? getLocalized(policy.meta_description_en, policy.meta_description_fa, policy.meta_description_ps) : '';

  // SEO
  if (metaTitle || title) {
    document.title = metaTitle || title;
  }
  const metaDescTag = document.querySelector('meta[name="description"]');
  if (metaDescTag && metaDesc) {
    metaDescTag.setAttribute('content', metaDesc);
  }

  const noPolicy = !isLoading && !policy;
  const labelLastUpdated = language === 'fa' ? 'آخرین بروزرسانی' : language === 'ps' ? 'وروستی تازه' : 'Last Updated';
  const labelVersion = language === 'fa' ? 'نسخه' : language === 'ps' ? 'نسخه' : 'Version';
  const labelNoPolicy = language === 'fa' ? 'سیاست حریم خصوصی هنوز منتشر نشده است.' : language === 'ps' ? 'د محرمیت تګلاره تر اوسه خپره شوې نه ده.' : 'Privacy policy has not been published yet.';
  const labelTitle = language === 'fa' ? 'سیاست حریم خصوصی' : language === 'ps' ? 'د محرمیت تګلاره' : 'Privacy Policy';

  return (
    <PublicLayout>
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-primary/5 border-b">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-3 rounded-xl bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{title || labelTitle}</h1>
            </div>
            {policy && (
              <div className={`flex items-center gap-4 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                {policy.published_at && (
                  <span>{labelLastUpdated}: {format(new Date(policy.published_at), 'PPP')}</span>
                )}
                <span>{labelVersion} {policy.version}</span>
              </div>
            )}
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-6 w-1/2 mt-6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : noPolicy ? (
            <div className="text-center py-16">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">{labelNoPolicy}</p>
            </div>
          ) : (
            <article
              className={`prose prose-lg max-w-none dark:prose-invert whitespace-pre-wrap ${isRTL ? 'text-right' : ''}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {content}
            </article>
          )}
        </section>
      </main>
    </PublicLayout>
  );
};

export default PrivacyPolicy;

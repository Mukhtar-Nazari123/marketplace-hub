import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useBlogBySlug, useRecentBlogs } from '@/hooks/useBlogs';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import StickyNavbar from '@/components/layout/StickyNavbar';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  User, 
  Eye,
  Share2,
  Facebook,
  Twitter,
  Copy,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, isRTL } = useLanguage();
  const { blog, loading, error } = useBlogBySlug(slug || '');
  const { blogs: recentBlogs } = useRecentBlogs(5);

  // Localized content
  const title = blog && (isRTL && blog.title_fa ? blog.title_fa : blog.title);
  const content = blog && (isRTL && blog.content_fa ? blog.content_fa : blog.content);
  const excerpt = blog && (isRTL && blog.excerpt_fa ? blog.excerpt_fa : blog.excerpt);
  const authorName = blog && (isRTL && blog.author_name_fa ? blog.author_name_fa : blog.author_name);
  const categoryName = blog?.category 
    ? (isRTL && blog.category.name_fa ? blog.category.name_fa : blog.category.name)
    : null;
  const tags = blog && (isRTL && blog.tags_fa?.length > 0 ? blog.tags_fa : blog.tags);
  const metaTitle = blog && (isRTL && blog.meta_title_fa ? blog.meta_title_fa : blog.meta_title);
  const metaDescription = blog && (isRTL && blog.meta_description_fa ? blog.meta_description_fa : blog.meta_description);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isRTL ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatNumber = (num: number) => {
    return isRTL ? num.toLocaleString('fa-IR') : num.toLocaleString('en-US');
  };

  const handleShare = async (platform: 'facebook' | 'twitter' | 'copy') => {
    const url = window.location.href;
    const text = title || '';

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          toast.success(isRTL ? 'لینک کپی شد!' : 'Link copied!');
        } catch {
          toast.error(isRTL ? 'خطا در کپی لینک' : 'Failed to copy link');
        }
        break;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StickyNavbar>
          <TopBar />
          <Header />
          <Navigation />
        </StickyNavbar>

        <div className="bg-muted/50 py-3">
          <div className="container mx-auto px-4">
            <Skeleton className="h-5 w-48" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            <main className="flex-1">
              <Skeleton className="aspect-video w-full rounded-2xl mb-8" />
              <Skeleton className="h-10 w-3/4 mb-4" />
              <div className="flex gap-4 mb-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </main>
            <div className="w-full lg:w-80">
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <StickyNavbar>
          <TopBar />
          <Header />
          <Navigation />
        </StickyNavbar>

        <div className="container mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {isRTL ? 'مقاله یافت نشد' : 'Article Not Found'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isRTL 
              ? 'متأسفانه مقاله‌ای که به دنبال آن هستید پیدا نشد.'
              : 'Sorry, the article you are looking for could not be found.'}
          </p>
          <Link to="/blog">
            <Button>
              {isRTL ? <ArrowRight className="ml-2" size={16} /> : <ArrowLeft className="mr-2" size={16} />}
              {isRTL ? 'بازگشت به وبلاگ' : 'Back to Blog'}
            </Button>
          </Link>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta */}
      <title>{metaTitle || title}</title>
      <meta name="description" content={metaDescription || excerpt || ''} />
      
      {/* Auto-hide Sticky Navbar */}
      <StickyNavbar>
        <TopBar />
        <Header />
        <Navigation />
      </StickyNavbar>

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              {t.pages.home}
            </Link>
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <Link to="/blog" className="text-muted-foreground hover:text-primary">
              {t.blog.title}
            </Link>
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <span className="text-primary line-clamp-1">{title}</span>
          </div>
        </div>
      </div>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            {/* Main Content */}
            <main className="flex-1">
              {/* Hero Image */}
              {blog.cover_image_url && (
                <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-muted">
                  <img
                    src={blog.cover_image_url}
                    alt={title || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Header */}
              <header className="mb-8">
                {/* Category */}
                {categoryName && (
                  <Link 
                    to={`/blog?category=${blog.category?.slug}`}
                    className="inline-block mb-4"
                  >
                    <Badge variant="secondary" className="hover:bg-secondary/80">
                      {categoryName}
                    </Badge>
                  </Link>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  {title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <User size={18} />
                    {authorName}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar size={18} />
                    {formatDate(blog.published_at || blog.created_at)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye size={18} />
                    {formatNumber(blog.views_count)} {isRTL ? 'بازدید' : 'views'}
                  </span>
                </div>
              </header>

              {/* Article Content */}
              <article 
                className="prose prose-lg dark:prose-invert max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: content || '' }}
              />

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 pt-8 border-t border-border">
                  <span className="text-muted-foreground">
                    {isRTL ? 'برچسب‌ها:' : 'Tags:'}
                  </span>
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Share Buttons */}
              <div className="flex items-center gap-4 pt-8 border-t border-border">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Share2 size={18} />
                  {isRTL ? 'اشتراک‌گذاری:' : 'Share:'}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('facebook')}
                    title="Share on Facebook"
                  >
                    <Facebook size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('twitter')}
                    title="Share on Twitter"
                  >
                    <Twitter size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleShare('copy')}
                    title="Copy link"
                  >
                    <Copy size={18} />
                  </Button>
                </div>
              </div>

              {/* Back to Blog */}
              <div className="mt-12">
                <Link to="/blog">
                  <Button variant="outline">
                    {isRTL ? (
                      <>
                        {t.blog.backToBlog}
                        <ArrowRight className="ms-2" size={16} />
                      </>
                    ) : (
                      <>
                        <ArrowLeft className="me-2" size={16} />
                        {t.blog.backToBlog}
                      </>
                    )}
                  </Button>
                </Link>
              </div>
            </main>

            {/* Sidebar */}
            <BlogSidebar
              categories={blog.category ? [blog.category] : []}
              recentBlogs={recentBlogs}
              selectedCategory={null}
              onCategorySelect={() => {}}
              allTags={tags || []}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlogPost;

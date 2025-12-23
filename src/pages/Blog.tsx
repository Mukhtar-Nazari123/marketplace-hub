import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { blogPosts } from '@/data/mockData';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Search, Calendar, User } from 'lucide-react';

const Blog = () => {
  const { t, language, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(blogPosts.map(p => p.category));
    return Array.from(cats);
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set(blogPosts.flatMap(p => p.tags));
    return Array.from(tags);
  }, []);

  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch =
        post.title[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt[language].toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, language]);

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
            <span className="text-primary">{t.blog.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-cyan-400 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t.blog.title}</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {t.blog.subtitle}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <main className="flex-1">
              {/* Search */}
              <div className="relative mb-8">
                <Search className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} size={20} />
                <Input
                  type="search"
                  placeholder={t.blog.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                />
              </div>

              {/* Posts Grid */}
              {filteredPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-shadow group"
                    >
                      <Link to={`/blog/${post.slug}`}>
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title[language]}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {post.author}
                          </span>
                        </div>
                        <Link to={`/blog/${post.slug}`}>
                          <h2 className="text-xl font-bold text-foreground hover:text-primary transition-colors mb-3">
                            {post.title[language]}
                          </h2>
                        </Link>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {post.excerpt[language]}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {post.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Link
                            to={`/blog/${post.slug}`}
                            className="text-primary font-medium hover:underline flex items-center gap-1"
                          >
                            {t.blog.readMore}
                            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t.blog.noResults}</p>
                </div>
              )}
            </main>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 space-y-6">
              {/* Categories */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="font-bold text-foreground mb-4">{t.blog.categories}</h3>
                <div className="space-y-2">
                  <button
                    className={`block w-full text-right p-2 rounded-lg transition-colors ${
                      !selectedCategory ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    {isRTL ? 'همه' : 'All'}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`block w-full text-right p-2 rounded-lg transition-colors ${
                        selectedCategory === cat ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Posts */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="font-bold text-foreground mb-4">{t.blog.recentPosts}</h3>
                <div className="space-y-4">
                  {blogPosts.slice(0, 3).map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="flex gap-3 group"
                    >
                      <img
                        src={post.image}
                        alt={post.title[language]}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm">
                          {post.title[language]}
                        </h4>
                        <span className="text-xs text-muted-foreground">{post.date}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="font-bold text-foreground mb-4">{t.blog.tags}</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary/10">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;

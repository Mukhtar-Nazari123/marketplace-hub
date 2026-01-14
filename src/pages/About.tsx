import { useLanguage } from '@/lib/i18n';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Target, Eye, Heart, Award, Users, CheckCircle } from 'lucide-react';

const teamMembers = [
  {
    name: { fa: 'احمد محمدی', en: 'Ahmad Mohammadi' },
    role: { fa: 'مدیر عامل', en: 'CEO' },
    image: 'https://i.pravatar.cc/300?img=11',
    bio: { fa: 'بیش از ۱۵ سال تجربه در مدیریت کسب‌وکار', en: 'Over 15 years of business management experience' },
  },
  {
    name: { fa: 'سارا احمدی', en: 'Sara Ahmadi' },
    role: { fa: 'مدیر فناوری', en: 'CTO' },
    image: 'https://i.pravatar.cc/300?img=5',
    bio: { fa: 'متخصص در توسعه نرم‌افزار و زیرساخت', en: 'Expert in software development and infrastructure' },
  },
  {
    name: { fa: 'علی رضایی', en: 'Ali Rezaei' },
    role: { fa: 'مدیر بازاریابی', en: 'Marketing Director' },
    image: 'https://i.pravatar.cc/300?img=12',
    bio: { fa: 'استراتژیست دیجیتال مارکتینگ', en: 'Digital marketing strategist' },
  },
  {
    name: { fa: 'فاطمه کریمی', en: 'Fatima Karimi' },
    role: { fa: 'مدیر پشتیبانی', en: 'Support Manager' },
    image: 'https://i.pravatar.cc/300?img=9',
    bio: { fa: 'تعهد به رضایت مشتری', en: 'Committed to customer satisfaction' },
  },
];

const values = [
  {
    icon: CheckCircle,
    title: { fa: 'صداقت', en: 'Integrity' },
    desc: { fa: 'شفافیت و صداقت در تمام معاملات', en: 'Transparency and honesty in all transactions' },
  },
  {
    icon: Award,
    title: { fa: 'کیفیت', en: 'Quality' },
    desc: { fa: 'ارائه بهترین محصولات با بالاترین کیفیت', en: 'Providing the best products with highest quality' },
  },
  {
    icon: Users,
    title: { fa: 'مشتری‌مداری', en: 'Customer Focus' },
    desc: { fa: 'اولویت ما رضایت مشتریان است', en: 'Customer satisfaction is our priority' },
  },
  {
    icon: Heart,
    title: { fa: 'نوآوری', en: 'Innovation' },
    desc: { fa: 'همیشه به دنبال راه‌های بهتر هستیم', en: 'Always looking for better ways' },
  },
];

const About = () => {
  const { t, language, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50">
        <TopBar />
        <Header />
        <Navigation />
      </div>

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              {t.pages.home}
            </Link>
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <span className="text-primary">{t.about.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-cyan-400 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t.about.title}</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {t.about.subtitle}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Target className="text-primary" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t.about.mission}</h2>
              <p className="text-muted-foreground leading-relaxed">{t.about.missionText}</p>
            </div>

            {/* Vision */}
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="text-orange-500" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">{t.about.vision}</h2>
              <p className="text-muted-foreground leading-relaxed">{t.about.visionText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{t.about.history}</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{t.about.historyText}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">{t.about.values}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <div key={idx} className="bg-card rounded-2xl p-6 shadow-sm border border-border text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="text-primary" size={28} />
                </div>
                <h3 className="font-bold text-foreground mb-2">{value.title[language]}</h3>
                <p className="text-sm text-muted-foreground">{value.desc[language]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">{t.about.team}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-shadow group">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name[language]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-foreground">{member.name[language]}</h3>
                  <p className="text-primary text-sm mb-2">{member.role[language]}</p>
                  <p className="text-sm text-muted-foreground">{member.bio[language]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Award className="text-yellow-500" size={40} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{t.about.awards}</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{t.about.awardsText}</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;

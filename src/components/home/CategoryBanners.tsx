import { ArrowLeft, Tablet, Tv, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";

const CategoryBanners = () => {
  const { t, isRTL } = useLanguage();
  
  const categories = [
    {
      title: t.categoryBanners.tabletAccessories,
      icon: Tablet,
      color: "from-cyan to-cyan-dark",
      href: "/categories/tablets",
    },
    {
      title: t.categoryBanners.tvAudioVideo,
      icon: Tv,
      color: "from-orange to-orange-dark",
      href: "/categories/tv",
    },
    {
      title: t.categoryBanners.smartphoneAccessories,
      icon: Smartphone,
      color: "from-cyan to-cyan-dark",
      href: "/categories/smartphones",
    },
  ];

  return (
    <section className="py-12">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={category.href}
              className={`group relative rounded-xl overflow-hidden bg-gradient-to-br ${category.color} p-6 min-h-[180px] hover-lift animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-primary-foreground rounded-full -translate-y-1/2 -translate-x-1/2" />
              </div>

              {/* Icon */}
              <div className={`absolute bottom-6 opacity-20 ${isRTL ? 'left-6' : 'right-6'}`}>
                <category.icon className="h-24 w-24 text-primary-foreground" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-display text-xl font-bold text-primary-foreground mb-4">
                  {category.title}
                </h3>
                <div className="flex items-center gap-2 text-primary-foreground/80 group-hover:text-primary-foreground transition-colors">
                  <span className="font-medium">{t.hero.shopNow}</span>
                  <ArrowLeft className={`h-4 w-4 transition-transform ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1 rotate-180'}`} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryBanners;

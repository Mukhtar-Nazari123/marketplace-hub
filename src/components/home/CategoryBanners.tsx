import { ArrowRight, Tablet, Tv, Smartphone } from "lucide-react";

const categories = [
  {
    title: "TABLET AND",
    subtitle: "ACCESSORIES",
    icon: Tablet,
    color: "from-cyan to-cyan-dark",
  },
  {
    title: "TIVI AND",
    subtitle: "AUDIO/VIDEO",
    icon: Tv,
    color: "from-orange to-orange-dark",
  },
  {
    title: "SMARTPHONE AND",
    subtitle: "ACCESSORIES",
    icon: Smartphone,
    color: "from-cyan to-cyan-dark",
  },
];

const CategoryBanners = () => {
  return (
    <section className="py-12">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <a
              key={index}
              href="#"
              className={`group relative rounded-xl overflow-hidden bg-gradient-to-br ${category.color} p-6 min-h-[180px] hover-lift animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary-foreground rounded-full -translate-y-1/2 translate-x-1/2" />
              </div>

              {/* Icon */}
              <div className="absolute right-6 bottom-6 opacity-20">
                <category.icon className="h-24 w-24 text-primary-foreground" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-display text-xl font-bold text-primary-foreground mb-1">
                  {category.title}
                </h3>
                <p className="text-2xl font-bold text-primary-foreground/90 mb-4">
                  {category.subtitle}
                </p>
                <div className="flex items-center gap-2 text-primary-foreground/80 group-hover:text-primary-foreground transition-colors">
                  <span className="font-medium">Shop Now</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryBanners;

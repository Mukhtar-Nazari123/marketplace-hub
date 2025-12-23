import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Headphones } from "lucide-react";
import { translations } from "@/lib/i18n";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Hero */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden gradient-hero min-h-[400px] lg:min-h-[500px] animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-l from-foreground via-foreground/90 to-transparent" />
            
            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-cyan/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-20 w-48 h-48 bg-orange/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 p-8 lg:p-12 h-full flex flex-col justify-center max-w-lg mr-auto">
              <Badge variant="sale" className="w-fit mb-4 text-sm px-4 py-1">
                {translations.hero.sale}
              </Badge>
              
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-background mb-4 leading-tight">
                {translations.hero.modernStyle}
                <span className="block text-cyan">{translations.hero.headphones}</span>
                {translations.hero.model}
              </h2>
              
              <p className="text-background/70 mb-6 text-lg">
                {translations.hero.quickSale}
              </p>
              
              <Button variant="orange" size="xl" className="w-fit group">
                {translations.hero.shopNow}
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Floating Product Image Placeholder */}
            <div className="absolute left-8 bottom-8 lg:left-16 lg:bottom-16 opacity-80">
              <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-cyan/30 to-orange/30 flex items-center justify-center animate-float">
                <Headphones className="w-24 h-24 lg:w-32 lg:h-32 text-background/50" />
              </div>
            </div>
          </div>

          {/* Side Banners */}
          <div className="flex flex-col gap-6">
            {/* Banner 1 */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-cyan/10 to-cyan/5 p-6 flex-1 hover-lift animate-slide-in-left stagger-1">
              <div className="absolute top-0 left-0 w-20 h-20 bg-cyan/20 rounded-full blur-2xl" />
              <Badge variant="new" className="mb-2">{translations.hero.nowAvailable}</Badge>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">
                {translations.hero.topSelling} <span className="text-cyan">iMAC</span>
              </h3>
              <p className="text-muted-foreground text-sm mb-2">{translations.hero.latestGeneration}</p>
              <p className="text-2xl font-bold text-cyan">
                {translations.hero.startingFrom} <span className="text-foreground">$۳۹۹</span>
              </p>
            </div>

            {/* Banner 2 */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-orange/10 to-orange/5 p-6 flex-1 hover-lift animate-slide-in-left stagger-2">
              <div className="absolute top-0 left-0 w-20 h-20 bg-orange/20 rounded-full blur-2xl" />
              <Badge variant="sale" className="mb-2">{translations.hero.nowAvailable}</Badge>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">
                {translations.hero.topSelling} <span className="text-orange">لوازم خانگی</span>
              </h3>
              <p className="text-muted-foreground text-sm mb-2">{translations.hero.kitchenEssentials}</p>
              <p className="text-2xl font-bold text-orange">
                {translations.hero.startingFrom} <span className="text-foreground">$۱۹۹</span>
              </p>
            </div>

            {/* Banner 3 */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-cyan/10 to-cyan/5 p-6 flex-1 hover-lift animate-slide-in-left stagger-3">
              <div className="absolute top-0 left-0 w-20 h-20 bg-cyan/20 rounded-full blur-2xl" />
              <Badge variant="new" className="mb-2">{translations.hero.nowAvailable}</Badge>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">
                {translations.hero.topSelling} <span className="text-cyan">لوازم جانبی</span>
              </h3>
              <p className="text-muted-foreground text-sm mb-2">{translations.hero.mustHaveGadgets}</p>
              <p className="text-2xl font-bold text-cyan">
                {translations.hero.startingFrom} <span className="text-foreground">$۹۹</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

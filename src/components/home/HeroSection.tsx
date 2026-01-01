import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Headphones } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const HeroSection = () => {
  const { t, isRTL } = useLanguage();

  return (
    <section className="relative overflow-hidden">
      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Hero */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden gradient-hero min-h-[400px] lg:min-h-[500px] animate-fade-in">
            <div
              className={`absolute inset-0 ${isRTL ? "bg-gradient-to-l from-foreground via-foreground/95 to-foreground/70" : "bg-gradient-to-r from-foreground via-foreground/95 to-foreground/70"}`}
            />

            {/* Decorative Elements */}
            <div
              className={`absolute top-10 w-64 h-64 bg-cyan/20 rounded-full blur-3xl ${isRTL ? "right-10" : "left-10"}`}
            />
            <div
              className={`absolute bottom-10 w-48 h-48 bg-orange/20 rounded-full blur-3xl ${isRTL ? "right-10" : "left-10"}`}
            />

            {/* Content Container */}
            <div className={`relative z-10 h-full flex ${isRTL ? "flex-row-reverse" : "flex-row"} items-center`}>
              {/* Floating Product Image */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-8 lg:right-16" : "left-8 lg:left-16"}`}
              >
                <div className="w-48 h-48 lg:w-72 lg:h-72 rounded-full bg-gradient-to-br from-cyan/30 to-orange/30 flex items-center justify-center animate-float opacity-80">
                  <Headphones className="w-24 h-24 lg:w-36 lg:h-36 text-background/50" />
                </div>
              </div>

              {/* Text Content */}
              <div
                className={`p-8 lg:p-12 flex flex-col justify-center max-w-md ${isRTL ? "items-end text-right" : "items-start text-left"}`}
              >
                <Badge variant="sale" className="w-fit mb-4 text-sm px-4 py-1">
                  {t.hero.sale}
                </Badge>

                <h2 className="font-display text-4xl lg:text-5xl font-bold text-background mb-4 leading-tight">
                  {t.hero.modernStyle}
                  <span className="block text-cyan">{t.hero.headphones}</span>
                  {t.hero.model}
                </h2>

                <p className="text-background/70 mb-6 text-lg">{t.hero.quickSale}</p>

                <Button variant="orange" size="xl" className="w-fit group">
                  {t.hero.shopNow}
                  <ArrowLeft
                    className={`h-5 w-5 transition-transform ${isRTL ? "group-hover:-translate-x-1" : "group-hover:translate-x-1 rotate-180"}`}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Side Banners */}
          <div className="flex flex-col gap-6">
            {/* Banner 1 */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-cyan/10 to-cyan/5 p-6 flex-1 hover-lift animate-slide-in-left stagger-1">
              <div className="absolute top-0 left-0 w-20 h-20 bg-cyan/20 rounded-full blur-2xl" />
              <Badge variant="new" className="mb-2">
                {t.hero.nowAvailable}
              </Badge>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">
                {t.hero.topSelling} <span className="text-cyan">iMAC</span>
              </h3>
              <p className="text-muted-foreground text-sm mb-2">{t.hero.latestGeneration}</p>
              <p className="text-2xl font-bold text-cyan">
                {t.hero.startingFrom} <span className="text-foreground">$399</span>
              </p>
            </div>

            {/* Banner 2 */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-orange/10 to-orange/5 p-6 flex-1 hover-lift animate-slide-in-left stagger-2">
              <div className="absolute top-0 left-0 w-20 h-20 bg-orange/20 rounded-full blur-2xl" />
              <Badge variant="sale" className="mb-2">
                {t.hero.nowAvailable}
              </Badge>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">
                {t.hero.topSelling} <span className="text-orange">{t.hero.kitchenEssentials}</span>
              </h3>
              <p className="text-muted-foreground text-sm mb-2">{t.hero.kitchenEssentials}</p>
              <p className="text-2xl font-bold text-orange">
                {t.hero.startingFrom} <span className="text-foreground">$199</span>
              </p>
            </div>

            {/* Banner 3 */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-cyan/10 to-cyan/5 p-6 flex-1 hover-lift animate-slide-in-left stagger-3">
              <div className="absolute top-0 left-0 w-20 h-20 bg-cyan/20 rounded-full blur-2xl" />
              <Badge variant="new" className="mb-2">
                {t.hero.nowAvailable}
              </Badge>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">
                {t.hero.topSelling} <span className="text-cyan">{t.hero.mustHaveGadgets}</span>
              </h3>
              <p className="text-muted-foreground text-sm mb-2">{t.hero.mustHaveGadgets}</p>
              <p className="text-2xl font-bold text-cyan">
                {t.hero.startingFrom} <span className="text-foreground">$99</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

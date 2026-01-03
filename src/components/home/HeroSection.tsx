import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Headphones } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { usePromoCards } from "@/hooks/usePromoCards";
import PromoCard from "./PromoCard";
import PromoCardSkeleton from "./PromoCardSkeleton";

const HeroSection = () => {
  const { t, isRTL } = useLanguage();
  const { promoCards, loading } = usePromoCards();

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
            <div
              className={`relative z-10 h-full flex items-center justify-between px-8 lg:px-16
              ${isRTL ? "flex-row-reverse" : "flex-row-reverse"}`}
            >
              {/* LEFT: Headphones */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 lg:w-72 lg:h-72 rounded-full bg-gradient-to-br from-cyan/30 to-orange/30 flex items-center justify-center animate-float opacity-80">
                  <Headphones className="w-24 h-24 lg:w-36 lg:h-36 text-background/50" />
                </div>
              </div>

              {/* RIGHT: Text Content */}
              <div
                className={`max-w-md p-6 lg:p-8 flex flex-col justify-center
                ${isRTL ? "items-start text-right" : "items-start text-left"}`}
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
                    className={`h-5 w-5 transition-transform ${
                      isRTL ? "group-hover:-translate-x-1" : "group-hover:translate-x-1 rotate-180"
                    }`}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Side Banners - Dynamic from Database */}
          <div className="flex flex-col gap-6">
            {loading ? (
              <>
                <PromoCardSkeleton />
                <PromoCardSkeleton />
                <PromoCardSkeleton />
              </>
            ) : promoCards.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {isRTL ? 'کارت تبلیغاتی وجود ندارد' : 'No promotions available'}
              </div>
            ) : (
              promoCards.map((card, index) => (
                <PromoCard key={card.id} card={card} index={index} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { Button } from "@/components/ui/button";
import { ArrowLeft, Tablet } from "lucide-react";
import { translations } from "@/lib/i18n";

const PromoBanner = () => {
  return (
    <section className="py-8">
      <div className="container">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-l from-cyan to-cyan-dark min-h-[200px]">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-background rounded-full -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-background rounded-full translate-y-1/2" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12">
            <div className="flex items-center gap-8 mb-6 md:mb-0">
              {/* Icon */}
              <div className="hidden md:flex w-24 h-24 rounded-full bg-primary-foreground/20 items-center justify-center">
                <Tablet className="h-12 w-12 text-primary-foreground" />
              </div>

              <div className="text-center md:text-right">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                  {translations.promo.savingOff}
                </h3>
                <p className="text-primary-foreground/80">
                  {translations.promo.limitedOffer}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Button variant="orange" size="xl" className="group">
                {translations.hero.shopNow}
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
              <div className="text-left hidden sm:block">
                <p className="text-primary-foreground/60 text-sm">{translations.hero.startingFrom}</p>
                <p className="font-display text-3xl font-bold text-primary-foreground">$۱۴۰</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;

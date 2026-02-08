import { useState, useEffect } from "react";
import { Rocket, LockKeyhole, ArrowLeftRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const TopBar = () => {
  const { t, isRTL } = useLanguage();
  const [showSecurePayment, setShowSecurePayment] = useState(false);

  // Toggle between Free Returns and Secure Payment every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowSecurePayment((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // All features for desktop
  const allFeatures = [
    {
      icon: Rocket,
      text: t.footer.freeShipping,
      subtext: t.footer.ordersOver,
    },
    {
      icon: LockKeyhole,
      text: t.footer.securePayment,
      subtext: t.footer.protected,
    },
    {
      icon: ArrowLeftRight,
      text: t.footer.easyReturns,
      subtext: t.footer.daysReturn,
    },
  ];

  // Dynamic right feature for mobile
  const rightFeature = showSecurePayment
    ? { icon: LockKeyhole, text: t.footer.securePayment, subtext: t.footer.protected }
    : { icon: ArrowLeftRight, text: t.footer.easyReturns, subtext: t.footer.daysReturn };

  const RightIcon = rightFeature.icon;

  return (
    <>
      {/* Desktop Layout */}
      <div className="bg-[hsl(var(--brand-neutral))] py-1.5 hidden lg:block" dir={isRTL ? "rtl" : "ltr"}>
        <div className="container">
          <div className="flex items-center justify-center gap-16">
            {allFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <Icon className="h-4 w-4 text-foreground/70 flex-shrink-0" />
                  <span className="font-semibold text-foreground">{feature.text}</span>
                  <span className="text-foreground/60">{feature.subtext}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout - aligned to the same container width as other sections */}
      <div className="lg:hidden overflow-x-hidden" dir={isRTL ? "rtl" : "ltr"}>
        <div className="container px-1 sm:px-1.5 lg:px-2 pt-1">
          <div className="bg-[hsl(var(--brand-neutral))] px-2 sm:px-3 py-1.5 rounded-sm w-full max-w-full box-border overflow-hidden">
            <div className="grid grid-cols-2 items-center gap-2 w-full">
              {/* Left - Free Shipping */}
              <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] min-w-0 overflow-hidden">
                <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground/70 flex-shrink-0" />
                <div className="flex flex-col leading-tight min-w-0 overflow-hidden">
                  <span className="font-semibold text-foreground truncate">{t.footer.freeShipping}</span>
                  <span className="text-foreground/60 truncate">{t.footer.ordersOver}</span>
                </div>
              </div>

              {/* Right - Rotating between Free Returns and Secure Payment */}
              <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] transition-opacity duration-300 min-w-0 overflow-hidden justify-start">
                <RightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground/70 flex-shrink-0" />
                <div className="flex flex-col leading-tight min-w-0 overflow-hidden">
                  <span className="font-semibold text-foreground truncate">{rightFeature.text}</span>
                  <span className="text-foreground/60 truncate">{rightFeature.subtext}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopBar;

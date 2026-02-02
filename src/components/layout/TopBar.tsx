import { useState, useEffect } from "react";
import { Truck, Shield, RotateCcw } from "lucide-react";
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
      icon: Truck,
      text: t.footer.freeShipping,
      subtext: t.footer.ordersOver,
    },
    {
      icon: Shield,
      text: t.footer.securePayment,
      subtext: t.footer.protected,
    },
    {
      icon: RotateCcw,
      text: t.footer.easyReturns,
      subtext: t.footer.daysReturn,
    },
  ];

  // Dynamic right feature for mobile
  const rightFeature = showSecurePayment
    ? { icon: Shield, text: t.footer.securePayment, subtext: t.footer.protected }
    : { icon: RotateCcw, text: t.footer.easyReturns, subtext: t.footer.daysReturn };

  const RightIcon = rightFeature.icon;

  return (
    <>
      {/* Desktop Layout */}
      <div className="bg-[#b6b6b6] py-1.5 hidden lg:block" dir={isRTL ? "rtl" : "ltr"}>
        <div className="container">
          <div className="flex items-center justify-center gap-16">
            {allFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <Icon className="h-4 w-4 text-black/70 flex-shrink-0" />
                  <span className="font-semibold text-black">{feature.text}</span>
                  <span className="text-black/60">{feature.subtext}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout - 2 columns with margins to align with other sections */}
      <div className="lg:hidden mx-1 sm:mx-16 " dir={isRTL ? "rtl" : "ltr"}>
        <div className="bg-[#b6b6b6] px-3 sm:px-4 py-1.5 rounded-sm">
          <div className="flex items-center justify-between">
            {/* Left - Free Shipping */}
            <div className="flex items-center gap-1.5 text-[10px]">
              <Truck className="h-4 w-4 text-black/70 flex-shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-black">{t.footer.freeShipping}</span>
                <span className="text-black/60">{t.footer.ordersOver}</span>
              </div>
            </div>

            {/* Right - Rotating between Free Returns and Secure Payment */}
            <div className="flex items-center gap-1.5 text-[10px] transition-opacity duration-300">
              <RightIcon className="h-4 w-4 text-black/70 flex-shrink-0" />
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-black">{rightFeature.text}</span>
                <span className="text-black/60">{rightFeature.subtext}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopBar;

import { Truck, Shield, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const TopBar = () => {
  const { t, isRTL } = useLanguage();

  // Static features for mobile (left and right)
  const staticFeatures = [
    {
      icon: Truck,
      text: t.footer.freeShipping,
      subtext: t.footer.ordersOver,
    },
    {
      icon: RotateCcw,
      text: t.footer.easyReturns,
      subtext: t.footer.daysReturn,
    },
  ];

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

  return (
    <div className="bg-[#b6b6b6] py-1.5" dir={isRTL ? "rtl" : "ltr"}>
      {/* Desktop Layout - All 3 features centered */}
      <div className="container hidden lg:block">
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

      {/* Mobile/Tablet Layout - 2 columns */}
      <div className="lg:hidden px-2">
        <div className="flex items-center justify-between">
          {/* Left - Free Shipping */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <Truck className="h-4 w-4 text-black/70 flex-shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-black">{staticFeatures[0].text}</span>
              <span className="text-black/60">{staticFeatures[0].subtext}</span>
            </div>
          </div>

          {/* Right - Free Returns */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <RotateCcw className="h-4 w-4 text-black/70 flex-shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-black">{staticFeatures[1].text}</span>
              <span className="text-black/60">{staticFeatures[1].subtext}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
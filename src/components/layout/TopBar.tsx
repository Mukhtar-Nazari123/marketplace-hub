import { Truck, Shield, RotateCcw } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const TopBar = () => {
  const { t, isRTL } = useLanguage();

  const features = [
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
    <div className="bg-[#b6b6b6] py-1.5 hidden lg:block" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container">
        <div className="flex items-center justify-center gap-16">
          {features.map((feature, index) => {
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
  );
};

export default TopBar;
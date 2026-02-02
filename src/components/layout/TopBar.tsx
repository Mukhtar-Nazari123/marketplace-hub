import { Phone, Globe, User, Truck, Shield, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useContactSettings } from "@/hooks/useContactSettings";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const TopBar = () => {
  const {
    t,
    language,
    setLanguage,
    isRTL
  } = useLanguage();

  const { phone } = useContactSettings();
  const { user, role } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === "fa" ? "en" : "fa");
  };

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
    <TooltipProvider>
      {/* Features Bar - SHEIN style */}
      <div className="bg-[#f5f0e6] py-1.5 hidden lg:block" dir={isRTL ? "rtl" : "ltr"}>
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

      {/* Main TopBar */}
      <div className="bg-[#b6b6b6] text-black py-1 text-sm" dir={isRTL ? "rtl" : "ltr"}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-[#eb1d31]" />
              <span>
                {t.topBar.callUs} <span dir="ltr" className="inline-block">{phone}</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <button 
                    onClick={toggleLanguage} 
                    className="flex items-center gap-1 hover:text-[#eb1d31] transition-colors p-1.5"
                  >
                    <Globe className="h-5 w-5 text-[#eb1d31]" />
                    <span className="text-xs hidden sm:inline">{language === "fa" ? "دری" : "EN"}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white font-medium px-3 py-2 text-sm shadow-lg">
                  <p>{language === "fa" ? "Switch to English" : "تغییر به دری"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell - Only for buyers and sellers */}
            {user && (role === 'buyer' || role === 'seller') && (
              <div className="[&_button]:text-[#eb1d31] [&_button:hover]:text-[#eb1d31]/80 [&_svg]:h-5 [&_svg]:w-5">
                <NotificationBell />
              </div>
            )}
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Link to="/dashboard/profile" className="hover:text-[#eb1d31] transition-colors p-1.5">
                  <User className="h-5 w-5 text-[#eb1d31]" />
                </Link>
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white font-medium px-3 py-2 text-sm shadow-lg">
                <p>{t.topBar.myAccount}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TopBar;
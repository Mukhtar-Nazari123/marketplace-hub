import { Phone, Globe, User } from "lucide-react";
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

  return (
    <TooltipProvider>
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
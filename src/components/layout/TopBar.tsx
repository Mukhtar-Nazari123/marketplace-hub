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
      <div className="bg-[#b6b6b6] text-black py-2 text-sm" dir={isRTL ? "rtl" : "ltr"}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#eb1d31]" />
              <span>
                {t.topBar.callUs} {phone}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={toggleLanguage} 
                    className="flex items-center gap-1 hover:text-[#eb1d31] transition-colors p-1"
                  >
                    <Globe className="h-4 w-4 text-[#eb1d31]" />
                    <span className="text-xs hidden sm:inline">{language === "fa" ? "دری" : "EN"}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{language === "fa" ? "Switch to English" : "تغییر به دری"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell - Only for buyers and sellers */}
            {user && (role === 'buyer' || role === 'seller') && (
              <div className="[&_button]:text-[#eb1d31] [&_button:hover]:text-[#eb1d31]/80 [&_button]:h-8 [&_button]:w-8">
                <NotificationBell />
              </div>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/dashboard/profile" className="hover:text-[#eb1d31] transition-colors p-1">
                  <User className="h-4 w-4 text-[#eb1d31]" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
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
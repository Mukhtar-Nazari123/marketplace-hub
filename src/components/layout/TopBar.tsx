import { Phone, Globe, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TopBar = () => {
  const {
    t,
    language,
    setLanguage,
    isRTL
  } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "fa" ? "en" : "fa");
  };

  return (
    <TooltipProvider>
      <div className="bg-foreground text-background py-2 text-sm" dir={isRTL ? "rtl" : "ltr"}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-cyan" />
              <span>
                {t.topBar.callUs} {isRTL ? "+۹۳ ۱۲۳-۴۵۶-۷۸۹" : "+93 123-456-789"}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={toggleLanguage} 
                    className="flex items-center gap-1 hover:text-cyan transition-colors p-1"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-xs">{language === "fa" ? "دری" : "EN"}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{language === "fa" ? "Switch to English" : "تغییر به دری"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/dashboard/profile" className="hover:text-cyan transition-colors p-1">
                  <User className="h-4 w-4" />
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
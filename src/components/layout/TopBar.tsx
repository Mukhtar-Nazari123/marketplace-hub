import { Phone, Globe, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useWishlist } from "@/hooks/useWishlist";
const TopBar = () => {
  const {
    t,
    language,
    setLanguage,
    isRTL
  } = useLanguage();
  const {
    itemCount: wishlistCount
  } = useWishlist();

  // Format count for RTL
  const formatCount = (count: number) => {
    if (isRTL) {
      return count.toString().replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
    }
    return count.toString();
  };
  const toggleLanguage = () => {
    setLanguage(language === "fa" ? "en" : "fa");
  };
  return <div className="bg-foreground text-background py-2 text-sm" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-cyan" />
            <span>
              {t.topBar.callUs} {isRTL ? "+۹۳ ۱۲۳-۴۵۶-۷۸۹" : "+93 123-456-789"}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleLanguage} className="flex items-center gap-1 hover:text-cyan transition-colors">
              <Globe className="h-4 w-4" />
              <span>{language === "fa" ? "English" : "دری"}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard/profile" className="hover:text-cyan transition-colors">
            {t.topBar.myAccount}
          </Link>
          <span className="text-muted-foreground">|</span>
          
          <span className="text-muted-foreground hidden sm:inline">|</span>
          
        </div>
      </div>
    </div>;
};
export default TopBar;
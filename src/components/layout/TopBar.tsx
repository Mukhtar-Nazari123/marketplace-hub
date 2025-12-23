import { Phone, Globe, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { translations } from "@/lib/i18n";

const TopBar = () => {
  return (
    <div className="bg-foreground text-background py-2 text-sm" dir="rtl">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-cyan" />
            <span>{translations.topBar.callUs} +۹۳ ۱۲۳-۴۵۶-۷۸۹</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-cyan transition-colors">
              <Globe className="h-4 w-4" />
              <span>{translations.topBar.language}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1 hover:text-cyan transition-colors">
              <span>{translations.topBar.currency}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="hover:text-cyan transition-colors">{translations.topBar.myAccount}</Link>
          <span className="text-muted-foreground">|</span>
          <Link to="/wishlist" className="hover:text-cyan transition-colors">{translations.topBar.wishlist} (۰)</Link>
          <span className="text-muted-foreground hidden sm:inline">|</span>
          <Link to="/checkout" className="hidden sm:inline hover:text-cyan transition-colors">{translations.topBar.checkout}</Link>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

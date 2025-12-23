import { Phone, Globe, ChevronDown } from "lucide-react";

const TopBar = () => {
  return (
    <div className="bg-foreground text-background py-2 text-sm">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-cyan" />
            <span>Call Us: +93 123-456-789</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-cyan transition-colors">
              <Globe className="h-4 w-4" />
              <span>English</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-1 hover:text-cyan transition-colors">
              <span>USD</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-cyan transition-colors">My Account</a>
          <span className="text-muted-foreground">|</span>
          <a href="#" className="hover:text-cyan transition-colors">Wishlist (0)</a>
          <span className="text-muted-foreground hidden sm:inline">|</span>
          <a href="#" className="hidden sm:inline hover:text-cyan transition-colors">Checkout</a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

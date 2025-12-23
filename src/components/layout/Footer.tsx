import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, CreditCard, Truck, Shield, Headphones } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { translations } from "@/lib/i18n";

const Footer = () => {
  const quickLinks = [
    { label: translations.footer.aboutUs, href: "/about" },
    { label: translations.footer.contactUs, href: "/contact" },
    { label: translations.footer.privacyPolicy, href: "/privacy" },
    { label: translations.footer.termsConditions, href: "/terms" },
    { label: translations.footer.faq, href: "/faq" },
    { label: translations.footer.sitemap, href: "/sitemap" },
  ];

  const customerLinks = [
    { label: translations.footer.myAccount, href: "/account" },
    { label: translations.footer.orderTracking, href: "/orders" },
    { label: translations.footer.wishlist, href: "/wishlist" },
    { label: translations.footer.returns, href: "/returns" },
    { label: translations.footer.shippingInfo, href: "/shipping" },
    { label: translations.footer.giftCards, href: "/gift-cards" },
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Features Bar */}
      <div className="border-b border-muted-foreground/20">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan/20 flex items-center justify-center">
                <Truck className="h-6 w-6 text-cyan" />
              </div>
              <div>
                <h4 className="font-semibold">{translations.footer.freeShipping}</h4>
                <p className="text-sm text-muted-foreground">{translations.footer.ordersOver}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange" />
              </div>
              <div>
                <h4 className="font-semibold">{translations.footer.securePayment}</h4>
                <p className="text-sm text-muted-foreground">{translations.footer.protected}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan/20 flex items-center justify-center">
                <Headphones className="h-6 w-6 text-cyan" />
              </div>
              <div>
                <h4 className="font-semibold">{translations.footer.support}</h4>
                <p className="text-sm text-muted-foreground">{translations.footer.dedicatedHelp}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange/20 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange" />
              </div>
              <div>
                <h4 className="font-semibold">{translations.footer.easyReturns}</h4>
                <p className="text-sm text-muted-foreground">{translations.footer.daysReturn}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-xl">M</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">مارکت</h3>
                <p className="text-xs text-muted-foreground -mt-1">{translations.footer.onlineStore}</p>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              {translations.footer.description}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-cyan transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-cyan transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-cyan transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-cyan transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">{translations.footer.quickLinks}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-muted-foreground hover:text-cyan transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">{translations.footer.customerService}</h4>
            <ul className="space-y-2">
              {customerLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-muted-foreground hover:text-cyan transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">{translations.footer.newsletter}</h4>
            <p className="text-muted-foreground text-sm mb-4">
              {translations.footer.subscribeText}
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={translations.footer.enterEmail}
                className="bg-background/10 border-background/20 text-background placeholder:text-muted-foreground"
                dir="rtl"
              />
              <Button variant="orange" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-cyan" />
                <span>+۹۳ ۱۲۳-۴۵۶-۷۸۹</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-cyan" />
                <span>support@market.af</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-cyan" />
                <span>کابل، افغانستان</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-muted-foreground/20">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © ۱۴۰۳ مارکت. {translations.footer.allRightsReserved}
            </p>
            <div className="flex items-center gap-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" className="h-6 opacity-70 hover:opacity-100 transition-opacity" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6 opacity-70 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

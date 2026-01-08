import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  Headphones,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useContactSettings } from "@/hooks/useContactSettings";
import NewsletterForm from "@/components/newsletter/NewsletterForm";

const Footer = () => {
  const { t, isRTL } = useLanguage();
  const { address, phone: contactPhone, email: contactEmail } = useContactSettings();

  const quickLinks = [
    { label: t.footer.aboutUs, href: "/about" },
    { label: t.footer.contactUs, href: "/contact" },
    { label: t.footer.privacyPolicy, href: "/privacy" },
    { label: t.footer.termsConditions, href: "/terms" },
    { label: t.footer.faq, href: "/faq" },
    { label: t.footer.sitemap, href: "/sitemap" },
  ];

  const customerLinks = [
    { label: t.footer.myAccount, href: "/dashboard/profile" },
    { label: t.footer.orderTracking, href: "/dashboard/buyer/orders" },
    { label: t.footer.wishlist, href: "/dashboard/buyer/wishlist" },
    { label: t.footer.returns, href: "/returns" },
    { label: t.footer.shippingInfo, href: "/dashboard/buyer/orders" },
    { label: t.footer.giftCards, href: "/gift-cards" },
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
                <h4 className="font-semibold">{t.footer.freeShipping}</h4>
                <p className="text-sm text-muted-foreground">{t.footer.ordersOver}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange" />
              </div>
              <div>
                <h4 className="font-semibold">{t.footer.securePayment}</h4>
                <p className="text-sm text-muted-foreground">{t.footer.protected}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan/20 flex items-center justify-center">
                <Headphones className="h-6 w-6 text-cyan" />
              </div>
              <div>
                <h4 className="font-semibold">{t.footer.support}</h4>
                <p className="text-sm text-muted-foreground">{t.footer.dedicatedHelp}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange/20 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange" />
              </div>
              <div>
                <h4 className="font-semibold">{t.footer.easyReturns}</h4>
                <p className="text-sm text-muted-foreground">{t.footer.daysReturn}</p>
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
                <h3 className="font-display text-xl font-bold">{isRTL ? "مارکت" : "Market"}</h3>
                <p className="text-xs text-muted-foreground -mt-1">{t.footer.onlineStore}</p>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">{t.footer.description}</p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-cyan transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-cyan transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-cyan transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-cyan transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4">{t.footer.quickLinks}</h4>
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
            <h4 className="font-display font-bold text-lg mb-4">{t.footer.customerService}</h4>
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
            <h4 className="font-display font-bold text-lg mb-4">{t.footer.newsletter}</h4>
            <p className="text-muted-foreground text-sm mb-4">{t.footer.subscribeText}</p>
            <NewsletterForm variant="compact" />
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-cyan" />
                <span dir="ltr">{contactPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-cyan" />
                <span dir="ltr">{contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-cyan" />
                <span>{address}</span>
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
              © {isRTL ? "۱۴۰۳" : "2024"} {isRTL ? "مارکت" : "Market"}. {t.footer.allRightsReserved}
            </p>
            <div className="flex items-center gap-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                alt="PayPal"
                className="h-6 opacity-70 hover:opacity-100 transition-opacity"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg"
                alt="Mastercard"
                className="h-6 opacity-70 hover:opacity-100 transition-opacity"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                alt="Visa"
                className="h-6 opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

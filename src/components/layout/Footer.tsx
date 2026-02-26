import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Globe,
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
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import NewsletterForm from "@/components/newsletter/NewsletterForm";
import visaLogo from "@/assets/payment/visa.svg";
import mastercardLogo from "@/assets/payment/mastercard.svg";
import paypalLogo from "@/assets/payment/paypal.svg";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  YouTube: Youtube,
  LinkedIn: Linkedin,
  Linkedin,
  GitHub: Github,
  Github,
  Other: Globe,
  Globe,
};

const Footer = () => {
  const { t, isRTL } = useLanguage();
  const { address, phone: contactPhone, email: contactEmail } = useContactSettings();
  const { data: socialLinks } = useSocialLinks();
  const { siteName, logoUrl } = useSiteSettings();

  const quickLinks = [
    { label: t.footer.aboutUs, href: "/about" },
    { label: t.footer.contactUs, href: "/contact" },
    { label: t.footer.privacyPolicy, href: "/privacy-policy" },
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
  ];

  return (
    <footer className="hidden lg:block bg-[#1a1a1a] text-white">
      {/* Features Bar */}
      <div className="border-b border-white/10">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{t.footer.freeShipping}</h4>
                <p className="text-sm text-[#b6b6b6]">{t.footer.ordersOver}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{t.footer.securePayment}</h4>
                <p className="text-sm text-[#b6b6b6]">{t.footer.protected}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{t.footer.support}</h4>
                <p className="text-sm text-[#b6b6b6]">{t.footer.dedicatedHelp}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{t.footer.easyReturns}</h4>
                <p className="text-sm text-[#b6b6b6]">{t.footer.daysReturn}</p>
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
            <Link to="/" className="flex-shrink-0 mb-4 inline-block pb-2">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-10 sm:h-12 w-auto object-contain" />
              ) : (
                <span className="text-primary font-bold text-2xl">{siteName}</span>
              )}
            </Link>
            <p className="text-[#b6b6b6] text-sm mb-4">{t.footer.description}</p>
            <div className="flex gap-3">
              {socialLinks?.map((link) => {
                const IconComponent = ICON_MAP[link.icon] || Globe;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#b6b6b6] hover:bg-primary hover:text-white transition-colors"
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-white">{t.footer.quickLinks}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-[#b6b6b6] hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-white">{t.footer.customerService}</h4>
            <ul className="space-y-2">
              {customerLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-[#b6b6b6] hover:text-primary transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-white">{t.footer.newsletter}</h4>
            <p className="text-[#b6b6b6] text-sm mb-4">{t.footer.subscribeText}</p>
            <NewsletterForm variant="compact" />
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#b6b6b6]">
                <Phone className="h-4 w-4 text-primary" />
                <span dir="ltr">{contactPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#b6b6b6]">
                <Mail className="h-4 w-4 text-primary" />
                <span dir="ltr">{contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#b6b6b6]">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#b6b6b6]">
              © {isRTL ? "۱۴۰۴" : "2025"} {siteName}. {t.footer.allRightsReserved}
            </p>
            <div className="flex items-center gap-3">
              <img src={visaLogo} alt="Visa" className="h-8 rounded" />
              <img src={mastercardLogo} alt="Mastercard" className="h-8" />
              <img src={paypalLogo} alt="PayPal" className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

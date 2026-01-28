import { Package, ShoppingCart, Store, LayoutGrid } from "lucide-react";
import { useLanguage, Language } from "@/lib/i18n";
import { NotificationType } from "@/hooks/useAdminNotifications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FilterType = NotificationType | 'ALL';

interface NotificationFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const NotificationFilters = ({ activeFilter, onFilterChange }: NotificationFiltersProps) => {
  const { isRTL, language } = useLanguage();
  const lang = language as Language;

  const getLabel = (en: string, fa: string, ps: string) => {
    if (lang === 'ps') return ps;
    if (lang === 'fa') return fa;
    return en;
  };

  const filters: { type: FilterType; label: string; icon: React.ReactNode }[] = [
    { type: 'ALL', label: getLabel('All', 'همه', 'ټول'), icon: <LayoutGrid className="h-4 w-4" /> },
    { type: 'NEW_PRODUCT', label: getLabel('Products', 'محصولات', 'محصولات'), icon: <Package className="h-4 w-4" /> },
    { type: 'NEW_ORDER', label: getLabel('Orders', 'سفارشات', 'امرونه'), icon: <ShoppingCart className="h-4 w-4" /> },
    { type: 'NEW_STORE', label: getLabel('Stores', 'فروشگاه‌ها', 'پلورنځي'), icon: <Store className="h-4 w-4" /> },
  ];

  return (
    <div className={cn(
      "flex items-center gap-2 flex-wrap",
      isRTL && "flex-row-reverse"
    )}>
      {filters.map((filter) => (
        <Button
          key={filter.type}
          variant={activeFilter === filter.type ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.type)}
          className={cn(
            "gap-2 transition-all",
            isRTL && "flex-row-reverse"
          )}
        >
          {filter.icon}
          <span>{filter.label}</span>
        </Button>
      ))}
    </div>
  );
};

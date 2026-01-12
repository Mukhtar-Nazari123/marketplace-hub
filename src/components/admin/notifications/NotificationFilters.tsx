import { Package, ShoppingCart, Store, LayoutGrid } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { NotificationType } from "@/hooks/useAdminNotifications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FilterType = NotificationType | 'ALL';

interface NotificationFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const NotificationFilters = ({ activeFilter, onFilterChange }: NotificationFiltersProps) => {
  const { isRTL } = useLanguage();

  const filters: { type: FilterType; label: string; labelFa: string; icon: React.ReactNode }[] = [
    { type: 'ALL', label: 'All', labelFa: 'همه', icon: <LayoutGrid className="h-4 w-4" /> },
    { type: 'NEW_PRODUCT', label: 'Products', labelFa: 'محصولات', icon: <Package className="h-4 w-4" /> },
    { type: 'NEW_ORDER', label: 'Orders', labelFa: 'سفارشات', icon: <ShoppingCart className="h-4 w-4" /> },
    { type: 'NEW_STORE', label: 'Stores', labelFa: 'فروشگاه‌ها', icon: <Store className="h-4 w-4" /> },
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
          <span>{isRTL ? filter.labelFa : filter.label}</span>
        </Button>
      ))}
    </div>
  );
};

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
  variants: {
    variant: {
      // Default - Red background (brand primary)
      default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      // Secondary - Grey border, no fill
      secondary: "border-muted-foreground/30 bg-transparent text-muted-foreground hover:bg-muted",
      // Destructive - Same as primary
      destructive: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      // Outline - Grey border
      outline: "border-muted-foreground/30 text-foreground",
      // Sale badge - Red with pulse
      sale: "border-transparent bg-primary text-primary-foreground animate-pulse",
      // New badge - Red solid
      new: "border-transparent bg-primary text-primary-foreground",
      // Hot badge - Red solid
      hot: "border-transparent bg-primary text-primary-foreground",
      // Discount badge - Red solid
      discount: "border-transparent bg-primary text-primary-foreground",
      // Notification badge - Red solid
      notification: "border-transparent bg-primary text-primary-foreground"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({
  className,
  variant,
  ...props
}: BadgeProps) {
  return;
}
export { Badge, badgeVariants };
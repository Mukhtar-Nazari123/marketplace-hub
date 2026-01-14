import { ReactNode } from 'react';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { cn } from '@/lib/utils';

interface StickyNavbarProps {
  children: ReactNode;
  className?: string;
}

export const StickyNavbar = ({ children, className }: StickyNavbarProps) => {
  const { isNavbarVisible, isAtTop } = useScrollDirection({ threshold: 15 });

  return (
    <div
      className={cn(
        // Base styles
        "sticky top-0 z-50 w-full",
        // Smooth transition
        "transition-transform duration-300 ease-in-out",
        // Shadow when scrolled
        !isAtTop && "shadow-md",
        // Hide/show based on scroll direction
        !isNavbarVisible && "-translate-y-full",
        className
      )}
    >
      {children}
    </div>
  );
};

export default StickyNavbar;

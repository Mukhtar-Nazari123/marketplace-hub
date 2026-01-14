import { useState, useEffect, useCallback } from 'react';

type ScrollDirection = 'up' | 'down' | null;

interface UseScrollDirectionOptions {
  threshold?: number;
  initialDirection?: ScrollDirection;
}

export function useScrollDirection({
  threshold = 10,
  initialDirection = null,
}: UseScrollDirectionOptions = {}) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(initialDirection);
  const [isAtTop, setIsAtTop] = useState(true);

  const updateScrollDirection = useCallback(() => {
    const scrollY = window.scrollY;
    
    // Always show navbar at top of page
    if (scrollY < 100) {
      setIsAtTop(true);
      setScrollDirection(null);
      return;
    }
    
    setIsAtTop(false);

    // Get previous scroll position from data attribute
    const prevScrollY = Number(document.body.dataset.prevScrollY) || 0;
    const diff = scrollY - prevScrollY;

    // Only update if scroll difference exceeds threshold
    if (Math.abs(diff) > threshold) {
      setScrollDirection(diff > 0 ? 'down' : 'up');
      document.body.dataset.prevScrollY = String(scrollY);
    }
  }, [threshold]);

  useEffect(() => {
    // Initialize previous scroll position
    document.body.dataset.prevScrollY = String(window.scrollY);
    
    // Use passive listener for better scroll performance
    window.addEventListener('scroll', updateScrollDirection, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', updateScrollDirection);
      delete document.body.dataset.prevScrollY;
    };
  }, [updateScrollDirection]);

  // Navbar should be visible when:
  // - At top of page
  // - Scrolling up
  // - Not scrolling down
  const isNavbarVisible = isAtTop || scrollDirection !== 'down';

  return {
    scrollDirection,
    isAtTop,
    isNavbarVisible,
  };
}

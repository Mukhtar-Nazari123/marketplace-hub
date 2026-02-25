import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component ensures pages open from the top on route changes.
 * Handles both window scroll and dashboard content containers.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  const scrollToTop = useCallback(() => {
    // Use requestAnimationFrame for smoother scroll reset
    requestAnimationFrame(() => {
      // Reset window scroll
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
      });

      // Reset any dashboard/main content scroll containers
      const mainContent = document.querySelector('[data-main-content]');
      if (mainContent) {
        mainContent.scrollTop = 0;
        mainContent.scrollLeft = 0;
      }

      // Reset SidebarInset scroll if present (dashboard layout)
      const sidebarInset = document.querySelector('[data-sidebar="inset"]');
      if (sidebarInset) {
        sidebarInset.scrollTop = 0;
        sidebarInset.scrollLeft = 0;
      }

      // Reset any scroll-area containers
      const scrollAreas = document.querySelectorAll('[data-radix-scroll-area-viewport]');
      scrollAreas.forEach((area) => {
        if (area instanceof HTMLElement) {
          area.scrollTop = 0;
          area.scrollLeft = 0;
        }
      });
    });
  }, []);

  // Scroll on route change
  useEffect(() => {
    scrollToTop();
  }, [pathname, scrollToTop]);

  // Scroll on initial page load/reload
  useEffect(() => {
    scrollToTop();
    // Also handle when browser restores scroll position after load
    const handleLoad = () => scrollToTop();
    window.addEventListener('load', handleLoad);
    return () => window.removeEventListener('load', handleLoad);
  }, [scrollToTop]);

  return null;
}

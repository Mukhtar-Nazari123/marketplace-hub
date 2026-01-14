import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window scroll
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });

    // Also reset any dashboard/main content scroll containers
    const mainContent = document.querySelector('[data-main-content]');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    // Reset SidebarInset scroll if present
    const sidebarInset = document.querySelector('[data-sidebar="inset"]');
    if (sidebarInset) {
      sidebarInset.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
}

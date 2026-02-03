import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to top when the route changes.
 * Place inside BrowserRouter so navigation always starts at the top.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;

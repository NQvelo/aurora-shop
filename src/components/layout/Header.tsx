import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Button } from "glisse";
import { useTranslation } from "react-i18next";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/hooks/useLocale";
import logoImg from "@/assets/logo.png";
import logoWhite from "@/assets/aurora white.png";

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathFor } = useLocale();
  const { user } = useAuth();
  const {
    cartCount,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useShop();
  const isAdmin = location.pathname.startsWith("/admin");
  const isHome = /^\/(en|ka)\/?$/.test(location.pathname);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24);
  const hiddenRef = useRef(false);
  const lastScrollY = useRef(0);
  const scrollDelta = useRef(0);

  useEffect(() => {
    hiddenRef.current = false;
    lastScrollY.current = window.scrollY;
    scrollDelta.current = 0;
    setHidden(false);
    setScrolled(window.scrollY > 24);
  }, [location.pathname]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");

    const setHeaderHidden = (next: boolean) => {
      if (hiddenRef.current === next) return;
      hiddenRef.current = next;
      setHidden(next);
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      lastScrollY.current = y;

      setScrolled((prev) => {
        const next = y > 24;
        return prev === next ? prev : next;
      });

      if (!media.matches || y < 12) {
        scrollDelta.current = 0;
        setHeaderHidden(false);
        return;
      }

      if (delta === 0) return;
      if ((scrollDelta.current > 0 && delta < 0) || (scrollDelta.current < 0 && delta > 0)) {
        scrollDelta.current = 0;
      }
      scrollDelta.current += delta;

      if (scrollDelta.current > 8) setHeaderHidden(true);
      else if (scrollDelta.current < -8) setHeaderHidden(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`main-header top-0 z-30 ${isHome ? "fixed inset-x-0" : "sticky"}`}
      data-hidden={hidden ? "true" : "false"}
      data-overlay={isHome && !scrolled ? "true" : "false"}
    >
      <div className="flex min-w-0 items-center gap-1">
        {isAdmin && (
          <div className="lg:hidden">
            <Button
              icon={
                isMobileMenuOpen ? (
                  <X strokeWidth={1.5} />
                ) : (
                  <Menu strokeWidth={1.5} />
                )
              }
              aria-label="Toggle menu"
              data-theme="light"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        )}

        <Link to={pathFor("/")} className="relative inline-flex lg:ml-[var(--nav-width)]">
          <img
            src={logoImg}
            alt="Aurora by Tekla"
            className={`h-14 w-auto object-contain transition-opacity duration-300 lg:h-20 ${
              isHome && !scrolled ? "opacity-0" : "opacity-100"
            }`}
          />
          <img
            src={logoWhite}
            alt=""
            aria-hidden
            className={`header-logo-light absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
              isHome && !scrolled ? "opacity-100" : "opacity-0"
            }`}
          />
        </Link>
      </div>

      {isAdmin ? (
        <span className="w-9" aria-hidden />
      ) : (
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            {user ? (
              <Button
                icon={<User strokeWidth={1.5} />}
                aria-label={t("auth.myProfile")}
                data-theme="light"
                onClick={() => navigate(pathFor("/profile"))}
              />
            ) : (
              <Button
                data-theme="light"
                onClick={() => navigate(pathFor("/login"))}
                className="text-[11px] uppercase tracking-[0.2em]"
              >
                {t("auth.signIn")}
              </Button>
            )}
          </div>

          <Button
            icon={<Search strokeWidth={1.5} />}
            aria-label="Search"
            data-theme="light"
            onClick={() => setIsSearchOpen(true)}
          />

          <div className="hidden items-center gap-2 lg:flex">
            <span className="relative">
              <Button
                icon={<Heart strokeWidth={1.5} />}
                aria-label="Wishlist"
                data-theme="light"
                onClick={() => setIsWishlistOpen(true)}
              />
              {wishlist.length > 0 && (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-foreground text-[8px] font-medium text-background">
                  {wishlist.length}
                </span>
              )}
            </span>

            <span className="relative">
              <Button
                icon={<ShoppingBag strokeWidth={1.5} />}
                aria-label="Shopping bag"
                data-theme="light"
                onClick={() => setIsCartOpen(true)}
              />
              {cartCount > 0 && (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-foreground text-[8px] font-medium text-background">
                  {cartCount}
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

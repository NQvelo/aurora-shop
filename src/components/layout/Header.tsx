import { Link, useNavigate } from "react-router-dom";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/hooks/useLocale";
import logoImg from "@/assets/logo.png";

const Header = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathFor } = useLocale();
  const { user, signOut } = useAuth();
  const {
    cartCount,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setIsLoginOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useShop();

  return (
    <header className="main-header sticky top-0 z-30">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden p-2 transition-colors flex items-center justify-center"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" strokeWidth={1.5} />
        ) : (
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        )}
      </button>

      {/* Logo */}
      <Link
        to={pathFor("/")}
        className="absolute left-1/2 transform -translate-x-1/2 lg:static lg:transform-none lg:ml-[var(--nav-width)]"
      >
        <img
          src={logoImg}
          alt="Aurora by Tekla"
          className="h-16 md:h-[4.25rem] w-auto object-contain"
        />
      </Link>

      {/* Right icons */}
      <div className="flex items-center gap-0 md:gap-1">
        {user ? (
          <Link
            to={pathFor("/profile")}
            className="hidden md:flex p-2 transition-colors items-center justify-center"
            aria-label={t("auth.myProfile")}
          >
            <User className="w-5 h-5" strokeWidth={1.5} />
          </Link>
        ) : (
          <button
            onClick={() => navigate(pathFor("/login"))}
            className="hidden md:flex items-center px-3 py-2 hover:underline transition-all text-[11px] uppercase tracking-[0.2em] font-normal"
          >
            {t("auth.signIn")}
          </button>
        )}

        <button
          onClick={() => setIsWishlistOpen(true)}
          className="relative p-2 transition-colors flex items-center justify-center"
          aria-label="Wishlist"
        >
          <Heart className="w-5 h-5" strokeWidth={1.5} />
          {wishlist.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-foreground text-background text-[8px] flex items-center justify-center rounded-full font-medium">
              {wishlist.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 transition-colors flex items-center justify-center"
          aria-label="Shopping bag"
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
          {cartCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-foreground text-background text-[8px] flex items-center justify-center rounded-full font-medium">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;

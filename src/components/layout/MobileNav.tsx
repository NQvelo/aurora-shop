import { Link, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/hooks/useLocale";

const MobileNav = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { pathFor, switchLanguage } = useLocale();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useShop();
  const isAdmin = location.pathname.startsWith("/admin");

  const navItems = [
    { label: t("nav.sale"), path: "/sale" },
    { label: t("nav.new"), path: "/new" },
    { label: t("nav.clothing"), path: "/clothing" },
    { label: t("nav.bestsellers"), path: "/bestsellers" },
    { label: t("nav.collections"), path: "/collections" },
    { label: t("nav.about"), path: "/about" },
  ];

  const adminNavItems = [
    { label: t("admin.orders"), path: "/admin/orders" },
    { label: t("admin.products"), path: "/admin/products" },
  ];

  const items = isAdmin ? adminNavItems : navItems;
  const getPath = (path: string) =>
    path.startsWith("/admin") ? path : pathFor(path);

  if (!isMobileMenuOpen) return null;

  return (
    <div className="mobile-nav animate-fade-in">
      <button
        onClick={() => setIsMobileMenuOpen(false)}
        className="absolute top-6 right-6 p-2"
        aria-label="Close menu"
      >
        <X className="w-6 h-6" />
      </button>

      <nav className="flex-1 flex flex-col justify-center">
        <ul className="space-y-6">
          {items.map((item, index) => (
            <li
              key={item.path}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Link
                to={getPath(item.path)}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-body text-3xl font-normal hover:opacity-60 transition-opacity"
              >
                {item.label}
              </Link>
            </li>
          ))}

          {/* Profile / Sign In */}
          <li
            className="animate-slide-up"
            style={{ animationDelay: `${items.length * 0.05}s` }}
          >
            {user ? (
              <Link
                to={pathFor("/profile")}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-body text-3xl font-normal hover:opacity-60 transition-opacity"
              >
                {t("auth.myProfile")}
              </Link>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate(pathFor("/login"));
                }}
                className="font-body text-3xl font-normal hover:opacity-60 transition-opacity"
              >
                {t("auth.signIn")}
              </button>
            )}
          </li>
        </ul>

        {/* Mobile language switcher - same style as footer */}
        <div className="mt-10 flex justify-start gap-4 font-body text-xs uppercase tracking-[0.2em] text-foreground/70">
          <button
            onClick={() => switchLanguage("en")}
            className={`px-2 py-1 ${
              i18n.language === "en" ? "opacity-100" : "opacity-60"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => switchLanguage("ka")}
            className={`px-2 py-1 ${
              i18n.language === "ka" ? "opacity-100" : "opacity-60"
            }`}
          >
            KA
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileNav;

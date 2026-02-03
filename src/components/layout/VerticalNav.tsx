import { Link, useLocation } from "react-router-dom";
import { Search, Package, ShoppingBag, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useShop } from "@/context/ShopContext";
import { useLocale } from "@/hooks/useLocale";

const VerticalNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { pathFor } = useLocale();
  const { setIsSearchOpen } = useShop();
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
    { label: t("admin.home"), path: "/admin/home", icon: Home },
    { label: t("admin.orders"), path: "/admin/orders", icon: Package },
    { label: t("admin.products"), path: "/admin/products", icon: ShoppingBag },
  ];

  const items = isAdmin ? adminNavItems : navItems;
  const getPath = (path: string) => (path.startsWith("/admin") ? path : pathFor(path));

  return (
    <nav className="vertical-nav px-6">
      {!isAdmin && (
        <button
          onClick={() => setIsSearchOpen(true)}
          className="mb-8 p-2 transition-colors duration-200 self-start flex items-center justify-center"
          aria-label="Search"
        >
          <Search className="w-5 h-5" strokeWidth={1.5} />
        </button>
      )}

      <ul className="space-y-1">
        {items.map((item) => {
          const path = getPath(item.path);
          const isActive = location.pathname === path;
          const Icon = "icon" in item ? item.icon : null;
          return (
            <li key={item.path}>
              <Link
                to={path}
                className={`nav-link block flex items-center gap-2 ${
                  isActive ? "nav-link-active" : ""
                }`}
              >
                {Icon && (
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                )}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default VerticalNav;

import { Link, useLocation } from "react-router-dom";
import { Search, Package, ShoppingBag, Home } from "lucide-react";
import { useShop } from "@/context/ShopContext";

const navItems = [
  { label: "Sale", path: "/sale" },
  { label: "New In", path: "/new" },
  { label: "Clothing", path: "/clothing" },
  { label: "Bestsellers", path: "/bestsellers" },
  { label: "Collections", path: "/collections" },

  { label: "About", path: "/about" },
];

const adminNavItems = [
  { label: "Home", path: "/admin/home", icon: Home },
  { label: "Orders", path: "/admin/orders", icon: Package },
  { label: "Products", path: "/admin/products", icon: ShoppingBag },
];

const VerticalNav = () => {
  const location = useLocation();
  const { setIsSearchOpen } = useShop();
  const isAdmin = location.pathname.startsWith("/admin");
  const items = isAdmin ? adminNavItems : navItems;

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
          const isActive = location.pathname === item.path;
          const Icon = "icon" in item ? item.icon : null;
          return (
            <li key={item.path}>
              <Link
                to={item.path}
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

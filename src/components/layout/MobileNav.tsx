import { Link, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { label: "Sale", path: "/sale" },
  { label: "New In", path: "/new" },
  { label: "Clothing", path: "/clothing" },
  { label: "Bestsellers", path: "/bestsellers" },
  { label: "Collections", path: "/collections" },

  { label: "About", path: "/about" },
];

const adminNavItems = [
  { label: "Orders", path: "/admin/orders" },
  { label: "Products", path: "/admin/products" },
];

const MobileNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useShop();
  const isAdmin = location.pathname.startsWith("/admin");
  const items = isAdmin ? adminNavItems : navItems;

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
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-display text-3xl tracking-wide hover:opacity-60 transition-opacity"
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
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-display text-3xl tracking-wide hover:opacity-60 transition-opacity"
              >
                My Profile
              </Link>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="font-display text-3xl tracking-wide hover:opacity-60 transition-opacity"
              >
                Sign In
              </button>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MobileNav;

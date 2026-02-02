import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { label: 'Sale', path: '/sale' },
  { label: 'New In', path: '/new' },
  { label: 'Clothing', path: '/clothing' },
  { label: 'Bestsellers', path: '/bestsellers' },
  { label: 'Collections', path: '/collections' },
  { label: 'Stockists', path: '/stockists' },
  { label: 'About', path: '/about' },
];

const MobileNav = () => {
  const { user } = useAuth();
  const { isMobileMenuOpen, setIsMobileMenuOpen, setIsLoginOpen } = useShop();

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
          {navItems.map((item, index) => (
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
            style={{ animationDelay: `${navItems.length * 0.05}s` }}
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
                  setIsLoginOpen(true);
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

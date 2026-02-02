import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

const navItems = [
  { label: 'Sale', path: '/sale' },
  { label: 'New In', path: '/new' },
  { label: 'Clothing', path: '/clothing' },
  { label: 'Bestsellers', path: '/bestsellers' },
  { label: 'Collections', path: '/collections' },
  { label: 'Stockists', path: '/stockists' },
  { label: 'About', path: '/about' },
];

const VerticalNav = () => {
  const location = useLocation();
  const { setIsSearchOpen } = useShop();

  return (
    <nav className="vertical-nav px-6">
      <button
        onClick={() => setIsSearchOpen(true)}
        className="mb-8 p-2 transition-colors duration-200 self-start flex items-center justify-center"
        aria-label="Search"
      >
        <Search className="w-5 h-5" strokeWidth={1.5} />
      </button>
      
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`nav-link block ${
                location.pathname === item.path ? 'nav-link-active' : ''
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default VerticalNav;

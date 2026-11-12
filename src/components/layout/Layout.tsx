import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useShop } from '@/context/ShopContext';
import Header from './Header';
import VerticalNav from './VerticalNav';
import Footer from './Footer';
import MobileNav from './MobileNav';
import BottomNav from './BottomNav';
import CartDrawer from '@/components/drawers/CartDrawer';
import WishlistDrawer from '@/components/drawers/WishlistDrawer';
import SearchModal from '@/components/modals/SearchModal';
import LoginModal from '@/components/modals/LoginModal';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isMobileMenuOpen } = useShop();
  const isAdmin = useLocation().pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <VerticalNav />
      <MobileNav />
      
      <main className="flex-1 lg:ml-[var(--nav-width)]">
        {children}
      </main>
      
      <div className={`lg:ml-[var(--nav-width)] ${isAdmin ? "" : "max-lg:pb-32"}`}>
        <Footer />
      </div>

      <BottomNav />

      {/* Drawers and Modals */}
      <CartDrawer />
      <WishlistDrawer />
      <SearchModal />
      <LoginModal />
    </div>
  );
};

export default Layout;

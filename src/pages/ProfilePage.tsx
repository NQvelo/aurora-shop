import { useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut, Package, Heart, Mail, Settings } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { useShop } from '@/context/ShopContext';
import ProductCard from '@/components/product/ProductCard';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { wishlist } = useShop();
  const navigate = useNavigate();

  if (!user) {
    // Redirect if not logged in
    navigate('/');
    return null;
  }

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut();
      navigate('/');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="mb-12 border-b border-border pb-8">
            <h1 className="font-display text-4xl mb-2">My Profile</h1>
            <p className="text-muted-foreground uppercase tracking-widest text-[10px]">
              Manage your account and view your saved items
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar - Profile Info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-muted/30 p-8 border border-border">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 bg-muted flex items-center justify-center rounded-full mb-4">
                    <UserIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-xl mb-1">
                    {user.user_metadata?.full_name || 'Valued Member'}
                  </h2>
                  <p className="text-xs text-muted-foreground lowecase">{user.email}</p>
                </div>

                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest text-foreground bg-white border border-border hover:bg-muted transition-colors">
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest text-foreground bg-white border border-border hover:bg-muted transition-colors">
                    <Package className="w-4 h-4" />
                    Order History
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest text-destructive bg-white border border-border hover:bg-destructive/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>

              <div className="bg-muted/10 p-6 border border-border">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Customer Support
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[11px] uppercase tracking-widest">support@aurora.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Saved Items */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-2xl flex items-center gap-3">
                  <Heart className="w-6 h-6" />
                  Saved Items
                </h2>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {wishlist.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlist.map((item) => (
                    <ProductCard key={item.product.id} product={item.product} />
                  ))}
                </div>
              ) : (
                <div className="bg-muted/20 border border-dashed border-border py-24 flex flex-col items-center justify-center text-center px-4">
                  <Heart className="w-12 h-12 text-muted/50 mb-4" />
                  <p className="text-muted-foreground text-sm font-light mb-6">
                    You haven't saved any items yet. Explore the collection to find pieces you love.
                  </p>
                  <button 
                    onClick={() => navigate('/clothing')}
                    className="btn-luxury-outline"
                  >
                    Browse Collection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;

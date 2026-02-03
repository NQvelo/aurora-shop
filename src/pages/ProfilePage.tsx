import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  LogOut,
  Package,
  Heart,
  Mail,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useShop } from "@/context/ShopContext";
import ProductCard from "@/components/product/ProductCard";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  size: string;
  price: number;
  image?: string;
}

interface ProfileOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  status: string;
  items: OrderItem[];
  created_at: string;
}

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { wishlist, currency } = useShop();
  const navigate = useNavigate();
  const [orderHistory, setOrderHistory] = useState<ProfileOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrder = (id: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!user?.id || !user?.email) return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
        .order("created_at", { ascending: false });
      if (!error && data) setOrderHistory(data as ProfileOrder[]);
      setOrdersLoading(false);
    };
    fetchOrders();
  }, [user?.id, user?.email]);

  if (!user) {
    // Redirect if not logged in
    navigate("/");
    return null;
  }

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await signOut();
      navigate("/");
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
                    {user.user_metadata?.full_name || "Valued Member"}
                  </h2>
                  <p className="text-xs text-muted-foreground lowecase">
                    {user.email}
                  </p>
                </div>

                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest text-foreground bg-white border border-border hover:bg-muted transition-colors">
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOrderHistory(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest transition-colors ${
                      !showOrderHistory
                        ? "text-foreground bg-muted border border-border"
                        : "text-foreground bg-white border border-border hover:bg-muted"
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    Saved Items
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOrderHistory(true)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest transition-colors ${
                      showOrderHistory
                        ? "text-foreground bg-muted border border-border"
                        : "text-foreground bg-white border border-border hover:bg-muted"
                    }`}
                  >
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
                    <span className="text-[11px] uppercase tracking-widest">
                      support@aurora.com
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Saved Items (hidden when Order History is shown) */}
            <div className="lg:col-span-3">
              {!showOrderHistory && (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-display text-2xl flex items-center gap-3">
                      <Heart className="w-6 h-6" />
                      Saved Items
                    </h2>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {wishlist.length}{" "}
                      {wishlist.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {wishlist.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {wishlist.map((item) => (
                        <ProductCard
                          key={item.product.id}
                          product={item.product}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/20 border border-dashed border-border py-24 flex flex-col items-center justify-center text-center px-4">
                      <Heart className="w-12 h-12 text-muted/50 mb-4" />
                      <p className="text-muted-foreground text-sm font-light mb-6">
                        You haven't saved any items yet. Explore the collection
                        to find pieces you love.
                      </p>
                      <button
                        onClick={() => navigate("/clothing")}
                        className="btn-luxury-outline"
                      >
                        Browse Collection
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Order History - shown only when user clicks Order History button; expandable items like admin */}
              {showOrderHistory && (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-display text-2xl flex items-center gap-3">
                      <Package className="w-6 h-6" />
                      Order History
                    </h2>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {orderHistory.length}{" "}
                      {orderHistory.length === 1 ? "order" : "orders"}
                    </span>
                  </div>

                  {ordersLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Loading orders...
                    </p>
                  ) : orderHistory.length > 0 ? (
                    <div className="space-y-4">
                      {orderHistory.map((order) => {
                        const isExpanded = expandedOrders.has(order.id);
                        return (
                          <div
                            key={order.id}
                            className="bg-white border border-border overflow-hidden shadow-sm transition-all hover:border-muted-foreground/30"
                          >
                            <div
                              onClick={() => toggleOrder(order.id)}
                              className="p-6 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-muted/5 transition-colors"
                            >
                              <div className="flex items-center gap-6">
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                    Order ID
                                  </p>
                                  <p className="text-xs font-mono font-medium">
                                    {order.id.slice(0, 8)}...
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                    Date
                                  </p>
                                  <p className="text-xs font-medium">
                                    {format(
                                      new Date(order.created_at),
                                      "MMM dd, yyyy"
                                    )}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                    Time
                                  </p>
                                  <p className="text-xs font-medium">
                                    {format(
                                      new Date(order.created_at),
                                      "HH:mm"
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <span
                                  className={`text-[10px] uppercase tracking-widest font-medium ${
                                    order.status === "delivered"
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {order.status}
                                </span>
                                <span className="font-mono text-sm">
                                  {currency.symbol}
                                  {order.total_amount.toLocaleString()}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                                )}
                              </div>
                            </div>

                            {isExpanded &&
                              order.items &&
                              order.items.length > 0 && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-t border-border">
                                    <div className="col-span-1 md:col-span-2 p-6">
                                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                                        Purchased Items
                                      </p>
                                      <ul className="space-y-3">
                                        {order.items.map((item, i) => (
                                          <li
                                            key={i}
                                            className="flex gap-3 justify-between items-center text-sm"
                                          >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                              {item.image ? (
                                                <img
                                                  src={item.image}
                                                  alt={item.name}
                                                  className="w-12 h-12 object-cover shrink-0 border border-border"
                                                />
                                              ) : (
                                                <div className="w-12 h-12 shrink-0 border border-border bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                                                  —
                                                </div>
                                              )}
                                              <span className="font-medium min-w-0">
                                                {item.name}{" "}
                                                <span className="text-muted-foreground font-light ml-1">
                                                  Size: {item.size} ×{" "}
                                                  {item.quantity}
                                                </span>
                                              </span>
                                            </div>
                                            <span className="font-mono text-xs shrink-0">
                                              {currency.symbol}
                                              {(
                                                item.price * item.quantity
                                              ).toLocaleString()}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                      <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
                                        <span className="text-[11px] uppercase tracking-[0.2em] font-bold">
                                          Total Amount
                                        </span>
                                        <span className="text-lg font-display">
                                          {currency.symbol}
                                          {order.total_amount.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="p-6 bg-muted/5">
                                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                                        Shipping & Contact
                                      </p>
                                      <div className="space-y-4 text-xs">
                                        <div>
                                          <p className="text-muted-foreground uppercase tracking-widest text-[9px] mb-1">
                                            Email
                                          </p>
                                          <p className="font-medium">
                                            {order.customer_email}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground uppercase tracking-widest text-[9px] mb-1">
                                            Phone
                                          </p>
                                          <p className="font-medium">
                                            {order.customer_phone}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground uppercase tracking-widest text-[9px] mb-1">
                                            Address
                                          </p>
                                          <p className="font-light leading-relaxed">
                                            {order.shipping_address}
                                          </p>
                                        </div>
                                        <div className="pt-2">
                                          <p className="text-muted-foreground uppercase tracking-widest text-[9px] mb-1">
                                            Full Date
                                          </p>
                                          <p className="font-medium">
                                            {format(
                                              new Date(order.created_at),
                                              "MMMM dd, yyyy HH:mm"
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                            {isExpanded &&
                              (!order.items || order.items.length === 0) && (
                                <div className="p-6 border-t border-border text-sm text-muted-foreground">
                                  No items in this order.
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-muted/20 border border-dashed border-border py-16 flex flex-col items-center justify-center text-center px-4">
                      <Package className="w-12 h-12 text-muted/50 mb-4" />
                      <p className="text-muted-foreground text-sm font-light">
                        No orders yet. When you place an order and it’s marked
                        delivered by us, it will appear here.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;

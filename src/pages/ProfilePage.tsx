import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Package,
  Heart,
  Mail,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useShop } from "@/context/ShopContext";
import ProductCard from "@/components/product/ProductCard";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/hooks/useLocale";
import { useProducts } from "@/hooks/useProducts";

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
  arriving_date?: string | null;
  accepted_at?: string | null;
  processing_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
}

const ORDER_STATUS_STEPS = [
  "pending",
  "accepted",
  "processing",
  "shipped",
  "delivered",
] as const;

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Ordered",
  accepted: "Accepted",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function OrderStatusProgress({
  status,
  created_at,
  arriving_date,
  accepted_at,
  processing_at,
  shipped_at,
  delivered_at,
}: {
  status: string;
  created_at: string;
  arriving_date?: string | null;
  accepted_at?: string | null;
  processing_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
}) {
  const stepIndex = ORDER_STATUS_STEPS.indexOf(
    status?.toLowerCase() as (typeof ORDER_STATUS_STEPS)[number]
  );
  const currentStep = stepIndex >= 0 ? stepIndex : 0;
  const progress =
    ORDER_STATUS_STEPS.length <= 1
      ? 0
      : (currentStep / (ORDER_STATUS_STEPS.length - 1)) * 100;

  const stageDates: (string | null)[] = [
    created_at ? format(new Date(created_at), "MMM d, HH:mm") : null,
    accepted_at ? format(new Date(accepted_at), "MMM d, HH:mm") : null,
    processing_at ? format(new Date(processing_at), "MMM d, HH:mm") : null,
    shipped_at ? format(new Date(shipped_at), "MMM d, HH:mm") : null,
    delivered_at ? format(new Date(delivered_at), "MMM d, HH:mm") : null,
  ];

  return (
    <div className="space-y-4">
      <p className="text-center text-sm font-medium text-foreground">
        {ORDER_STATUS_LABELS[status?.toLowerCase()] || status}
      </p>
      {/* Mobile: vertical progress bar - grey track, black fill from top */}
      <div className="flex sm:hidden gap-3">
        <div className="relative flex-shrink-0 w-6 flex flex-col items-center">
          {ORDER_STATUS_STEPS.map((step, i) => {
            const isComplete = i <= currentStep;
            const isLast = i === ORDER_STATUS_STEPS.length - 1;
            const isSegmentFilled = currentStep > i;
            return (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex-shrink-0 z-10 ${
                    isComplete
                      ? "bg-foreground border-foreground"
                      : "bg-background border-gray-200"
                  }`}
                />
                {!isLast && (
                  <div className="w-1 min-h-[28px] bg-gray-200 rounded-full overflow-hidden my-0.5 flex flex-col">
                    <div
                      className={`w-full rounded-full transition-all duration-300 flex-1 min-h-0 ${
                        isSegmentFilled ? "bg-foreground" : ""
                      }`}
                      style={{ height: isSegmentFilled ? "100%" : "0" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-col justify-between py-0.5 flex-1">
          {ORDER_STATUS_STEPS.map((step, i) => {
            const isComplete = i <= currentStep;
            const date = stageDates[i] ?? null;
            return (
              <div
                key={step}
                className="flex flex-col py-1.5 min-h-[44px] justify-center"
              >
                <span
                  className={`text-[10px] uppercase tracking-wider ${
                    isComplete
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {ORDER_STATUS_LABELS[step] || step}
                </span>
                {date && (
                  <span
                    className={`text-[10px] mt-0.5 ${
                      isComplete ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {date}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Desktop: horizontal progress bar */}
      <div className="hidden sm:block relative">
        <div className="absolute top-[10px] left-0 right-0 h-1 rounded-full bg-gray-200" />
        <div
          className="absolute top-[10px] left-0 h-1 rounded-full bg-foreground transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
        <div className="relative flex justify-between">
          {ORDER_STATUS_STEPS.map((step, i) => {
            const isComplete = i <= currentStep;
            const date = stageDates[i] ?? null;
            return (
              <div
                key={step}
                className="flex flex-col items-center"
                style={{ flex: 1 }}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex-shrink-0 z-10 ${
                    isComplete
                      ? "bg-foreground border-foreground"
                      : "bg-background border-gray-200"
                  }`}
                />
                <span
                  className={`mt-2 text-[10px] uppercase tracking-wider text-center ${
                    isComplete
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {ORDER_STATUS_LABELS[step] || step}
                </span>
                {date && (
                  <span
                    className={`text-[10px] mt-0.5 ${
                      isComplete ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {date}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {arriving_date && (
        <p className="text-center text-xs text-muted-foreground pt-1 border-t border-border mt-3 pt-3">
          Estimate arriving date –{" "}
          {format(new Date(arriving_date), "MMMM d, yyyy")}
        </p>
      )}
    </div>
  );
}

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { wishlist, currency } = useShop();
  const navigate = useNavigate();
  const { pathFor } = useLocale();
  const { data: products = [] } = useProducts();
  const [orderHistory, setOrderHistory] = useState<ProfileOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    "saved" | "orders" | "account"
  >("saved");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [accountName, setAccountName] = useState<string>("");

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
    setAccountName(user.user_metadata?.full_name || "");
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
    navigate(pathFor("/"));
    return null;
  }

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      await signOut();
      navigate("/");
    }
  };

  const handleAccountSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.auth.updateUser({
        data: { full_name: accountName },
      });
      toast.success("Account details updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update account");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="mb-12 border-b border-border pb-8">
            <h1 className="font-body text-2xl md:text-3xl mb-2 font-normal">
              My Profile
            </h1>
            <p className="text-muted-foreground uppercase tracking-widest text-[10px]">
              Manage your account and view your saved items
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar - Profile Info / Navigation (Zara-style text list) */}
            <div className="lg:col-span-1">
              <div className="mb-10">
                <h2 className="font-display text-xl mb-1">
                  {user.user_metadata?.full_name || "Valued Member"}
                </h2>
                <p className="text-xs text-muted-foreground lowercase">
                  {user.email}
                </p>
              </div>

              <nav className="space-y-3 text-sm">
                <button
                  type="button"
                  onClick={() => setActiveSection("account")}
                  className={`flex items-center gap-2 uppercase tracking-[0.15em] text-[11px] ${
                    activeSection === "account"
                      ? "underline underline-offset-4"
                      : "hover:underline underline-offset-4"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Account settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("saved")}
                  className={`flex items-center gap-2 uppercase tracking-[0.15em] text-[11px] ${
                    activeSection === "saved"
                      ? "underline underline-offset-4"
                      : "hover:underline underline-offset-4"
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Saved items</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("orders")}
                  className={`flex items-center gap-2 uppercase tracking-[0.15em] text-[11px] ${
                    activeSection === "orders"
                      ? "underline underline-offset-4"
                      : "hover:underline underline-offset-4"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Purchases</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 uppercase tracking-[0.15em] text-[11px] text-destructive hover:underline underline-offset-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </nav>

              <div className="mt-10 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4" />
                  <span className="uppercase tracking-widest">
                    teklaqvelidze@gmail.com
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeSection === "saved" && (
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
                      <p className="text-muted-foreground text-sm font-light mb-6">
                        You haven't saved any items yet. Explore the collection
                        to find pieces you love.
                      </p>
                      <button
                        onClick={() => navigate(pathFor("/clothing"))}
                        className="btn-luxury-outline"
                      >
                        Browse Collection
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Order History - expandable items */}
              {activeSection === "orders" && (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-display text-2xl flex items-center gap-3">
                      <Package className="w-6 h-6" />
                      Purchases
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
                              <div className="flex items-center gap-4 sm:gap-6">
                                <div className="hidden sm:block w-24 flex-shrink-0">
                                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-foreground rounded-full transition-all"
                                      style={{
                                        width: `${(() => {
                                          const idx =
                                            ORDER_STATUS_STEPS.indexOf(
                                              order.status?.toLowerCase() as (typeof ORDER_STATUS_STEPS)[number]
                                            );
                                          if (idx < 0) return 0;
                                          return (
                                            (idx /
                                              Math.max(
                                                1,
                                                ORDER_STATUS_STEPS.length - 1
                                              )) *
                                            100
                                          );
                                        })()}%`,
                                      }}
                                    />
                                  </div>
                                </div>
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
                                  <div className="px-6 pt-4 pb-2 border-t border-border">
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                                      Order status
                                    </p>
                                    <OrderStatusProgress
                                      status={order.status}
                                      created_at={order.created_at}
                                      arriving_date={order.arriving_date}
                                      accepted_at={order.accepted_at}
                                      processing_at={order.processing_at}
                                      shipped_at={order.shipped_at}
                                      delivered_at={order.delivered_at}
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-t border-border">
                                    <div className="col-span-1 md:col-span-2 p-6">
                                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                                        Purchased Items
                                      </p>
                                      <ul className="space-y-3">
                                        {order.items.map((item, i) => {
                                          const productImage =
                                            item.image ||
                                            products.find(
                                              (p) => p.id === item.product_id
                                            )?.images?.[0];
                                          return (
                                            <li
                                              key={i}
                                              className="flex gap-3 justify-between items-center text-sm"
                                            >
                                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                                {productImage ? (
                                                  <img
                                                    src={productImage}
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
                                          );
                                        })}
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
                        delivered, it will appear here.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Account Settings */}
              {activeSection === "account" && (
                <section aria-label="Account settings" className="space-y-6">
                  <div className="mb-4">
                    <h2 className="font-display text-2xl">Account Settings</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Update your personal details used for orders and
                      communication.
                    </p>
                  </div>
                  <form
                    onSubmit={handleAccountSave}
                    className="space-y-6 max-w-md"
                  >
                    <div>
                      <label className="form-label text-[11px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="form-input w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label text-[11px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={user.email ?? ""}
                        disabled
                        className="form-input w-full px-4 py-3 border border-border bg-muted/40 text-sm text-muted-foreground cursor-not-allowed"
                      />
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Email changes are not available from this page.
                      </p>
                    </div>
                    <button
                      type="submit"
                      className="btn-luxury-primary px-8 py-3 text-[11px] uppercase tracking-[0.15em]"
                    >
                      Save changes
                    </button>
                  </form>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;

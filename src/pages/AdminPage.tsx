import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  Plus,
  Trash2,
  Edit2,
  Upload,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types/product";

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  size: string;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  order_number?: string | null;
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

/** Parse stored shipping address (e.g. "Street, № 12, 0108, Tbilisi") into labeled parts */
function parseShippingAddress(raw: string): {
  street: string;
  houseNumber: string;
  postCode: string;
  city: string;
  floor: string;
  raw: string;
} {
  const trimmed = (raw || "").trim();
  if (!trimmed)
    return {
      street: "",
      houseNumber: "",
      postCode: "",
      city: "",
      floor: "",
      raw: trimmed,
    };
  const parts = trimmed
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const housePart = parts.find((p) => /^№\s*.+/.test(p));
  const houseNumber = housePart ? housePart.replace(/^№\s*/, "").trim() : "";
  const postCode = parts.find((p) => /^\d+$/.test(p)) ?? "";
  const floorPart = parts.find((p) => /^Floor\s*.+/i.test(p));
  const floor = floorPart ? floorPart.replace(/^Floor\s*/i, "").trim() : "";
  const city = parts.length > 1 ? parts[parts.length - 1] : "";
  const rest = parts.filter(
    (p, i) =>
      i < parts.length - 1 &&
      !/^№\s*/.test(p) &&
      !/^\d+$/.test(p) &&
      !/^Floor\s*.+/i.test(p)
  );
  const street = rest.join(", ");
  return { street, houseNumber, postCode, city, floor, raw: trimmed };
}

interface HomeSettings {
  left_title: string;
  left_subtitle: string;
  left_image: string;
  right_image: string;
  cta_text: string;
  cta_link: string;
}

const CATEGORY_OPTIONS = [
  { value: "dresses", label: "Dresses" },
  { value: "makeup", label: "Makeup" },
  { value: "jewelry", label: "Jewelry" },
  { value: "for your pet", label: "For your pet" },
  { value: "for your best friend", label: "For your best friend" },
  { value: "for your girlfriend", label: "For your girlfriend" },
] as const;

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab handling based on URL
  const activeTab = location.pathname.includes("products")
    ? "products"
    : location.pathname.includes("home")
    ? "home"
    : "orders";

  useEffect(() => {
    if (location.pathname === "/admin") {
      navigate("/admin/orders", { replace: true });
    }
  }, [location.pathname, navigate]);

  const setActiveTab = (tab: "orders" | "products" | "home") => {
    navigate(`/admin/${tab}`);
  };

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [orderEditDraft, setOrderEditDraft] = useState<
    Record<string, { status: string; arriving_date: string }>
  >({});
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

  const toggleOrder = (id: string) => {
    const next = new Set(expandedOrders);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedOrders(next);
  };

  const filteredOrders = useMemo(() => {
    const q = orderSearchQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (order) =>
        (order.order_number ?? order.id).toLowerCase().includes(q) ||
        order.customer_name?.toLowerCase().includes(q) ||
        order.customer_email?.toLowerCase().includes(q) ||
        order.customer_phone?.toLowerCase().includes(q) ||
        order.id.toLowerCase().includes(q)
    );
  }, [orders, orderSearchQuery]);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

  const [homeForm, setHomeForm] = useState<HomeSettings>({
    left_title: "Autumn/Winter 2025",
    left_subtitle: "New Season",
    left_image: "",
    right_image: "",
    cta_text: "Shop the Collection",
    cta_link: "/collections/aw25",
  });
  const [homeId, setHomeId] = useState<string | null>(null);
  const [isSavingHome, setIsSavingHome] = useState(false);
  const leftHeroFileRef = useRef<HTMLInputElement>(null);
  const rightHeroFileRef = useRef<HTMLInputElement>(null);
  const [uploadingLeftHero, setUploadingLeftHero] = useState(false);
  const [uploadingRightHero, setUploadingRightHero] = useState(false);

  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: "",
    price: 0,
    currency: "GEL",
    category: "",
    collection: "",
    description: "",
    images: [],
    details: [],
    sizes: DEFAULT_SIZES.map((s) => ({ label: s, available: true })),
    isNew: false,
    isBestseller: false,
    onSale: false,
    salePrice: 0,
    hasSizes: true,
    deliveryDays: null as number | null,
  });

  const normalizeSizes = (sizes: any) => {
    if (
      Array.isArray(sizes) &&
      sizes.every((s) => typeof s === "object" && "label" in s)
    ) {
      return sizes;
    }
    // Handle old format {"clothing": ["XS", ...]} or missing/invalid format
    const baseSizes = DEFAULT_SIZES;
    let availableLabels: string[] = [];

    if (sizes && typeof sizes === "object" && sizes.clothing) {
      availableLabels = sizes.clothing;
    } else if (Array.isArray(sizes) && typeof sizes[0] === "string") {
      availableLabels = sizes;
    }

    return baseSizes.map((label) => ({
      label,
      available:
        availableLabels.length > 0 ? availableLabels.includes(label) : true,
    }));
  };

  const handleSizeToggle = (label: string) => {
    const currentSizes = normalizeSizes(productForm.sizes);
    const sizeIndex = currentSizes.findIndex((s: any) => s.label === label);

    if (sizeIndex > -1) {
      currentSizes[sizeIndex] = {
        ...currentSizes[sizeIndex],
        available: !currentSizes[sizeIndex].available,
      };
    } else {
      currentSizes.push({ label, available: true });
    }

    setProductForm({ ...productForm, sizes: currentSizes });
  };
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = async () => {
      if (!user) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session && isMounted) {
          navigate("/");
          return;
        }
        if (!session) return;
      }

      const userId = user?.id || (await supabase.auth.getUser()).data.user?.id;

      if (!userId) {
        if (isMounted) navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .single();

      if (isMounted) {
        if (error || !data?.is_admin) {
          navigate("/");
          return;
        }
        setIsAdmin(true);
        fetchOrders();
        fetchProducts();
        fetchHomeSettings();
      }
    };

    checkAdmin();
    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(
        data.map((p: Record<string, unknown>) => ({
          ...p,
          isNew: p.is_new,
          isBestseller: p.is_bestseller,
          onSale: p.on_sale,
          salePrice: p.sale_price,
          hasSizes: p.has_sizes !== false,
          deliveryDays: p.delivery_days != null ? Number(p.delivery_days) : null,
          sizes: normalizeSizes(p.sizes),
        })) as Product[]
      );
    }
  };

  const fetchHomeSettings = async () => {
    const { data, error } = await supabase
      .from("home_settings")
      .select("*")
      .limit(1)
      .single();

    if (!error && data) {
      setHomeId(data.id);
      setHomeForm({
        left_title: data.left_title || "Autumn/Winter 2025",
        left_subtitle: data.left_subtitle || "New Season",
        left_image: data.left_image || "",
        right_image: data.right_image || "",
        cta_text: data.cta_text || "Shop the Collection",
        cta_link: data.cta_link || "/collections/aw25",
      });
    }
  };

  const handleHomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHome(true);

    try {
      if (homeId) {
        const { error } = await supabase
          .from("home_settings")
          .update({
            left_title: homeForm.left_title,
            left_subtitle: homeForm.left_subtitle,
            left_image: homeForm.left_image,
            right_image: homeForm.right_image,
            cta_text: homeForm.cta_text,
            cta_link: homeForm.cta_link,
          })
          .eq("id", homeId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("home_settings")
          .insert([
            {
              left_title: homeForm.left_title,
              left_subtitle: homeForm.left_subtitle,
              left_image: homeForm.left_image,
              right_image: homeForm.right_image,
              cta_text: homeForm.cta_text,
              cta_link: homeForm.cta_link,
            },
          ])
          .select()
          .single();
        if (error) throw error;
        setHomeId(data.id);
      }
      toast.success("Homepage header updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to save homepage settings");
    } finally {
      setIsSavingHome(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const now = new Date().toISOString();
    const updates: Record<string, string | null> = { status: newStatus };
    if (newStatus === "accepted") updates.accepted_at = now;
    else if (newStatus === "processing") updates.processing_at = now;
    else if (newStatus === "shipped") updates.shipped_at = now;
    else if (newStatus === "delivered") updates.delivered_at = now;

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId);

    if (!error) {
      const updatedOrder = orders.find((o) => o.id === orderId);
      if (updatedOrder) {
        supabase.functions
          .invoke("send-order-notification", {
            body: {
              type: "status_update",
              orderData: updatedOrder,
              newStatus: newStatus,
            },
          })
          .catch((err) => console.error("Error triggering notification:", err));
      }
      setOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus, ...updates } : o
        )
      );
      toast.success("Status updated");
    } else {
      toast.error("Failed to update status");
    }
  };

  const updateOrderArrivingDate = async (orderId: string, date: string) => {
    const value = date || null;
    const { error } = await supabase
      .from("orders")
      .update({ arriving_date: value })
      .eq("id", orderId);

    if (!error) {
      setOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, arriving_date: value } : o
        )
      );
      toast.success("Arriving date updated");
    } else {
      toast.error("Failed to update arriving date");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImages(true);

    const files = Array.from(e.target.files);
    const newImages: string[] = [...(productForm.images || [])];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Error uploading ${file.name}`);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      newImages.push(publicUrl);
    }

    setProductForm({ ...productForm, images: newImages });
    setUploadingImages(false);
  };

  const handleHeroImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "left" | "right"
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const setUploading =
      side === "left" ? setUploadingLeftHero : setUploadingRightHero;

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `hero-${side}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Error uploading ${file.name}`);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      setHomeForm((prev) => ({
        ...prev,
        left_image: side === "left" ? publicUrl : prev.left_image,
        right_image: side === "right" ? publicUrl : prev.right_image,
      }));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...(productForm.images || [])];
    newImages.splice(index, 1);
    setProductForm({ ...productForm, images: newImages });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const dataToSave = {
      name: productForm.name,
      price: productForm.price,
      images: productForm.images,
      description: productForm.description,
      category: productForm.category,
      collection: productForm.collection,
      details: productForm.details,
      sizes: productForm.sizes,
      is_new: productForm.isNew,
      is_bestseller: productForm.isBestseller,
      on_sale: productForm.onSale,
      sale_price: productForm.salePrice,
      has_sizes: productForm.hasSizes !== false,
      delivery_days: productForm.deliveryDays != null && productForm.deliveryDays > 0 ? productForm.deliveryDays : null,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(dataToSave)
          .eq("id", editingProduct.id);
        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        const { error } = await supabase.from("products").insert([dataToSave]);
        if (error) throw error;
        toast.success("Product created successfully");
      }

      setIsAddingProduct(false);
      setEditingProduct(null);
      fetchProducts();
      setProductForm({
        name: "",
        price: 0,
        currency: "GEL",
        category: "",
        collection: "",
        description: "",
        images: [],
        details: [],
        sizes: DEFAULT_SIZES.map((s) => ({ label: s, available: true })),
        isNew: false,
        isBestseller: false,
        onSale: false,
        salePrice: 0,
        hasSizes: true,
        deliveryDays: null,
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (!error) {
      toast.success("Product deleted");
      fetchProducts();
    } else {
      toast.error(error.message);
    }
  };

  if (isAdmin === null || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-luxury-caps animate-pulse">
          Checking Permissions...
        </p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="py-12 md:py-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {activeTab === "products" && !isAddingProduct && !editingProduct && (
            <div className="flex justify-end mb-8">
              <button
                onClick={() => setIsAddingProduct(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3 h-3" /> Add Product
              </button>
            </div>
          )}

          {activeTab === "orders" ? (
            <div className="space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by Order ID, customer name, email, phone..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-foreground placeholder:text-muted-foreground"
                />
              </div>
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                return (
                  <div
                    key={order.id}
                    className="bg-white border border-border overflow-hidden shadow-sm transition-all hover:border-muted-foreground/30"
                  >
                    <div
                      onClick={() => {
                        toggleOrder(order.id);
                        if (!expandedOrders.has(order.id)) {
                          setOrderEditDraft((d) => ({
                            ...d,
                            [order.id]: {
                              status: order.status,
                              arriving_date: order.arriving_date || "",
                            },
                          }));
                        }
                      }}
                      className="p-6 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-muted/5 transition-colors"
                    >
                      <div className="flex items-center gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Order ID
                          </p>
                          <p className="text-xs font-mono font-medium">
                            {order.order_number ?? order.id}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Customer
                          </p>
                          <p className="text-xs font-medium">
                            {order.customer_name}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Time
                          </p>
                          <p className="text-xs font-medium">
                            {format(new Date(order.created_at), "HH:mm")}
                          </p>
                        </div>
                        {!isExpanded && (
                          <div className="space-y-1 hidden md:block border-l border-border pl-6">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                              Date
                            </p>
                            <p className="text-xs font-medium text-muted-foreground">
                              {format(
                                new Date(order.created_at),
                                "MMM dd, yyyy"
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {order.status}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-t border-border">
                          <div className="col-span-1 md:col-span-2 p-6">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                              Purchased Items
                            </p>
                            <ul className="space-y-3">
                              {order.items.map((item, i) => {
                                const productImage =
                                  item.image ||
                                  products.find((p) => p.id === item.product_id)
                                    ?.images?.[0];
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
                                          Size: {item.size} × {item.quantity}
                                        </span>
                                      </span>
                                    </div>
                                    <span className="font-mono text-xs shrink-0">
                                      ₾
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
                                ₾{order.total_amount.toLocaleString()}
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
                              {(() => {
                                const addr = parseShippingAddress(
                                  order.shipping_address
                                );
                                const hasStructured =
                                  addr.street ||
                                  addr.houseNumber ||
                                  addr.postCode ||
                                  addr.city ||
                                  addr.floor;
                                return hasStructured ? (
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-muted-foreground uppercase tracking-widest text-[9px] mb-1">
                                        Street / Address
                                      </p>
                                      <p className="font-light leading-relaxed">
                                        {addr.street || "—"}
                                      </p>
                                    </div>
                                    {addr.houseNumber && (
                                      <div>
                                        <p className="text-muted-foreground uppercase tracking-widest text-[9px] mb-1">
                                          House number
                                        </p>
                                        <p className="font-medium">
                                          {addr.houseNumber}
                                        </p>
                                      </div>
                                    )}
                                    {addr.floor && (
                                      <div>
                                        <p className="text-muted-foreground uppercase tracking-widest text-[9px] mb-1">
                                          Floor
                                        </p>
                                        <p className="font-medium">
                                          {addr.floor}
                                        </p>
                                      </div>
                                    )}
                                    {addr.postCode && (
                                      <div>
                                        <p className="text-muted-foreground uppercase tracking-widest text-[9px] mb-1">
                                          Post code
                                        </p>
                                        <p className="font-medium">
                                          {addr.postCode}
                                        </p>
                                      </div>
                                    )}
                                    {addr.city && (
                                      <div>
                                        <p className="text-muted-foreground uppercase tracking-widest text-[9px] mb-1">
                                          City
                                        </p>
                                        <p className="font-medium">
                                          {addr.city}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-muted-foreground uppercase tracking-widest text-[9px] mb-1">
                                      Street / Address
                                    </p>
                                    <p className="font-light leading-relaxed">
                                      {addr.raw || "—"}
                                    </p>
                                  </div>
                                );
                              })()}
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
                        {/* Status & arriving date at bottom with Save */}
                        <div
                          className="p-6 border-t border-border bg-muted/5 flex flex-wrap items-end gap-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                              Status
                            </label>
                            <select
                              value={
                                orderEditDraft[order.id]?.status ?? order.status
                              }
                              onChange={(e) => {
                                setOrderEditDraft((d) => ({
                                  ...d,
                                  [order.id]: {
                                    status: e.target.value,
                                    arriving_date:
                                      d[order.id]?.arriving_date ??
                                      order.arriving_date ??
                                      "",
                                  },
                                }));
                              }}
                              className="text-xs font-medium bg-background border border-border px-3 py-2 focus:outline-none focus:border-foreground min-w-[140px]"
                            >
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                              Arriving date
                            </label>
                            <input
                              type="date"
                              value={
                                orderEditDraft[order.id]?.arriving_date ??
                                order.arriving_date ??
                                ""
                              }
                              onChange={(e) =>
                                setOrderEditDraft((d) => ({
                                  ...d,
                                  [order.id]: {
                                    status: d[order.id]?.status ?? order.status,
                                    arriving_date: e.target.value,
                                  },
                                }))
                              }
                              className="text-xs font-medium bg-background border border-border px-3 py-2 focus:outline-none focus:border-foreground"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={savingOrderId === order.id}
                            onClick={async (e) => {
                              e.stopPropagation();
                              const draft = orderEditDraft[order.id];
                              if (!draft) return;
                              setSavingOrderId(order.id);
                              try {
                                await updateOrderStatus(order.id, draft.status);
                                await updateOrderArrivingDate(
                                  order.id,
                                  draft.arriving_date || ""
                                );
                                setOrderEditDraft((d) => {
                                  const next = { ...d };
                                  delete next[order.id];
                                  return next;
                                });
                              } finally {
                                setSavingOrderId(null);
                              }
                            }}
                            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {savingOrderId === order.id ? "Saving…" : "Save"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredOrders.length === 0 && (
                <div className="text-center py-24 border border-dashed border-border">
                  <p className="text-luxury-caps text-muted-foreground">
                    {orderSearchQuery.trim()
                      ? "No orders match your search."
                      : "No orders found."}
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === "products" ? (
            <div>
              {isAddingProduct || editingProduct ? (
                <div className="bg-white border border-border p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-bold">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </h2>
                    <button
                      onClick={() => {
                        setIsAddingProduct(false);
                        setEditingProduct(null);
                      }}
                      className="p-2 hover:bg-muted transition-colors rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form
                    onSubmit={handleProductSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                          Product Name
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                            Price (₾)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={productForm.price}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                price: parseFloat(e.target.value),
                              })
                            }
                            className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                            Sale Price (₾)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productForm.salePrice}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                salePrice: parseFloat(e.target.value),
                                onSale: parseFloat(e.target.value) > 0,
                              })
                            }
                            className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                            Category
                          </label>
                          <select
                            value={
                              CATEGORY_OPTIONS.some(
                                (opt) => opt.value === productForm.category
                              )
                                ? productForm.category || ""
                                : productForm.category
                                ? "custom"
                                : ""
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "custom") {
                                setProductForm({
                                  ...productForm,
                                  category: "",
                                });
                              } else {
                                setProductForm({
                                  ...productForm,
                                  category: value,
                                });
                              }
                            }}
                            className="w-full bg-transparent border-b border-border py-2 text-xs focus:outline-none focus:border-foreground uppercase tracking-widest"
                          >
                            <option value="" disabled>
                              Select category
                            </option>
                            {CATEGORY_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                            <option value="custom">Custom / Other</option>
                          </select>
                          {(!productForm.category ||
                            !CATEGORY_OPTIONS.some(
                              (opt) => opt.value === productForm.category
                            )) && (
                            <input
                              type="text"
                              placeholder="Enter custom category"
                              value={productForm.category || ""}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  category: e.target.value,
                                })
                              }
                              className="mt-3 w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                            />
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                            Collection
                          </label>
                          <input
                            type="text"
                            value={productForm.collection}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                collection: e.target.value,
                              })
                            }
                            className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                          Description
                        </label>
                        <textarea
                          rows={4}
                          value={productForm.description}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              description: e.target.value,
                            })
                          }
                          className="w-full bg-transparent border border-border p-3 text-sm focus:outline-none focus:border-foreground resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                          Product Details
                        </label>
                        <textarea
                          rows={4}
                          placeholder="One detail per line (e.g. 100% Cotton)"
                          value={(productForm.details ?? []).join("\n")}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              details: e.target.value
                                .split("\n")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          className="w-full bg-transparent border border-border p-3 text-sm focus:outline-none focus:border-foreground resize-none"
                        />
                        <p className="text-[9px] text-muted-foreground mt-1">
                          One bullet point per line. Shown on the product page.
                        </p>
                      </div>
                      <div className="flex gap-6 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={productForm.isNew}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                isNew: e.target.checked,
                              })
                            }
                            className="w-3 h-3 border-border rounded-none"
                          />
                          <span className="text-[10px] uppercase tracking-widest">
                            Mark as New
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={productForm.isBestseller}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                isBestseller: e.target.checked,
                              })
                            }
                            className="w-3 h-3 border-border rounded-none"
                          />
                          <span className="text-[10px] uppercase tracking-widest">
                            Bestseller
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-4">
                          Product Images
                        </label>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {productForm.images?.map((url, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-square border border-border group"
                            >
                              <img
                                src={url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute -top-2 -right-2 bg-background border border-border p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImages}
                            className="aspect-square border border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors"
                          >
                            <Upload
                              className={`w-4 h-4 ${
                                uploadingImages ? "animate-bounce" : ""
                              }`}
                            />
                            <span className="text-[8px] uppercase tracking-widest">
                              {uploadingImages ? "Uploading..." : "Upload"}
                            </span>
                          </button>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                        />
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={productForm.hasSizes !== false}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                hasSizes: e.target.checked,
                              })
                            }
                            className="w-3 h-3 border-border rounded-none"
                          />
                          <span className="text-[10px] uppercase tracking-widest">
                            Has sizes
                          </span>
                        </label>
                      </div>

                      {productForm.hasSizes !== false && (
                        <div className="pt-4">
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-4">
                            Available Sizes
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {DEFAULT_SIZES.map((size) => {
                              const sizesArray = Array.isArray(productForm.sizes)
                                ? productForm.sizes
                                : [];
                              const isAvailable = sizesArray.find(
                                (s: { label: string; available: boolean }) =>
                                  s.label === size
                              )?.available;
                              return (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => handleSizeToggle(size)}
                                  className={`px-4 py-2 text-[10px] border transition-all ${
                                    isAvailable
                                      ? "border-foreground bg-foreground text-background"
                                      : "border-border text-muted-foreground hover:border-foreground"
                                  }`}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="pt-4">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                          Delivery (days)
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          required
                          placeholder="e.g. 3"
                          value={productForm.deliveryDays ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setProductForm({
                              ...productForm,
                              deliveryDays: v === "" ? null : Math.max(1, parseInt(v, 10) || 1),
                            });
                          }}
                          className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                        />
                        <p className="text-[9px] text-muted-foreground mt-1">
                          Shown on product & checkout
                        </p>
                      </div>

                      <div className="pt-8">
                        <button
                          type="submit"
                          className="btn-luxury-primary w-full flex items-center justify-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {editingProduct ? "Update Product" : "Save Product"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-border group overflow-hidden"
                    >
                      <div className="aspect-[3/4] overflow-hidden relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setProductForm({
                                ...product,
                                sizes: normalizeSizes(product.sizes),
                              });
                            }}
                            className="bg-white p-2 rounded-full border border-border hover:bg-primary hover:text-white transition-all shadow-sm"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="bg-white p-2 rounded-full border border-border hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 border-t border-border">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                          {product.category}
                        </p>
                        <h3 className="text-sm md:text-base font-medium mb-1">
                          {product.name}
                        </h3>
                        <p className="text-sm md:text-base">
                          ₾{product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-border p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold">
                  Home Page Header
                </h2>
              </div>

              <form
                onSubmit={handleHomeSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                      Left Subtitle
                    </label>
                    <input
                      type="text"
                      value={homeForm.left_subtitle}
                      onChange={(e) =>
                        setHomeForm({
                          ...homeForm,
                          left_subtitle: e.target.value,
                        })
                      }
                      className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                      Left Title
                    </label>
                    <input
                      type="text"
                      value={homeForm.left_title}
                      onChange={(e) =>
                        setHomeForm({
                          ...homeForm,
                          left_title: e.target.value,
                        })
                      }
                      className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                      Left Image
                    </label>
                    {homeForm.left_image && (
                      <div className="mb-3 aspect-video border border-border overflow-hidden">
                        <img
                          src={homeForm.left_image}
                          alt="Left hero"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => leftHeroFileRef.current?.click()}
                      disabled={uploadingLeftHero}
                      className="w-full border border-dashed border-border py-2 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-muted transition-colors disabled:opacity-60"
                    >
                      <Upload
                        className={`w-4 h-4 ${
                          uploadingLeftHero ? "animate-bounce" : ""
                        }`}
                      />
                      {uploadingLeftHero
                        ? "Uploading..."
                        : "Upload from device"}
                    </button>
                    <input
                      ref={leftHeroFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleHeroImageUpload(e, "left")}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">
                      Right Image
                    </label>
                    {homeForm.right_image && (
                      <div className="mb-3 aspect-video border border-border overflow-hidden">
                        <img
                          src={homeForm.right_image}
                          alt="Right hero"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => rightHeroFileRef.current?.click()}
                      disabled={uploadingRightHero}
                      className="w-full border border-dashed border-border py-2 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-muted transition-colors disabled:opacity-60"
                    >
                      <Upload
                        className={`w-4 h-4 ${
                          uploadingRightHero ? "animate-bounce" : ""
                        }`}
                      />
                      {uploadingRightHero
                        ? "Uploading..."
                        : "Upload from device"}
                    </button>
                    <input
                      ref={rightHeroFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleHeroImageUpload(e, "right")}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={homeForm.cta_text}
                      onChange={(e) =>
                        setHomeForm({
                          ...homeForm,
                          cta_text: e.target.value,
                        })
                      }
                      className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-1">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={homeForm.cta_link}
                      onChange={(e) =>
                        setHomeForm({
                          ...homeForm,
                          cta_link: e.target.value,
                        })
                      }
                      className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSavingHome}
                      className="btn-luxury-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingHome ? "Saving..." : "Save Header"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useShop } from "@/context/ShopContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/hooks/useLocale";
import { generateOrderNumber } from "@/lib/utils";

// All cities/municipalities in Georgia (country) – self-governing cities + municipalities
const GEORGIAN_CITIES = [
  "Tbilisi",
  "Batumi",
  "Kutaisi",
  "Rustavi",
  "Poti",
  "Abasha",
  "Adigeni",
  "Akhalkalaki",
  "Akhaltsikhe",
  "Akhmeta",
  "Ambrolauri",
  "Aspindza",
  "Baghdati",
  "Bolnisi",
  "Borjomi",
  "Chiatura",
  "Chokhatauri",
  "Chkhorotsku",
  "Dedoplistskaro",
  "Dmanisi",
  "Dusheti",
  "Gardabani",
  "Gori",
  "Gurjaani",
  "Kareli",
  "Kaspi",
  "Kazbegi",
  "Keda",
  "Kharagauli",
  "Khashuri",
  "Khelvachauri",
  "Khobi",
  "Khoni",
  "Khulo",
  "Kobuleti",
  "Lagodekhi",
  "Lanchkhuti",
  "Lentekhi",
  "Marneuli",
  "Martvili",
  "Mestia",
  "Mtskheta",
  "Ninotsminda",
  "Oni",
  "Ozurgeti",
  "Sachkhere",
  "Sagarejo",
  "Senaki",
  "Shuakhevi",
  "Sighnaghi",
  "Samtredia",
  "Telavi",
  "Terjola",
  "Tetritskaro",
  "Tianeti",
  "Tsageri",
  "Tsalenjikha",
  "Tsalka",
  "Tskaltubo",
  "Tkibuli",
  "Vani",
  "Zestaponi",
  "Zugdidi",
  "Other",
];

const CheckoutPage = () => {
  const { cart, cartTotal, currency, clearCart } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathFor } = useLocale();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    houseNumber: "",
    postCode: "",
    city: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (cart.length === 0 && !isSubmitting) {
      navigate(pathFor("/"));
    }
  }, [cart, navigate, isSubmitting, pathFor]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const PAYMENT_URL = "https://egreve.bog.ge/teklaqvelidze";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Open payment in new tab immediately (same tick as user click) so popup isn't blocked
    window.open(PAYMENT_URL, "_blank", "noopener,noreferrer");
    setIsSubmitting(true);

    try {
      // Create order with items as JSONB
      const orderItems = cart.map((item) => ({
        product_id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        size: item.size,
        price:
          item.product.onSale && item.product.salePrice
            ? item.product.salePrice
            : item.product.price,
      }));

      const shippingAddress = [
        formData.address,
        formData.houseNumber && `№ ${formData.houseNumber}`,
        formData.postCode && formData.postCode,
        formData.city,
      ]
        .filter(Boolean)
        .join(", ");

      let orderData: { id: string; order_number: string | null } | null = null;
      let orderError: Error | null = null;
      const maxAttempts = 5;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const orderNumber = generateOrderNumber();
        const { data, error } = await supabase
          .from("orders")
          .insert({
            user_id: user?.id,
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            shipping_address: shippingAddress,
            total_amount: cartTotal,
            status: "pending",
            items: orderItems,
            order_number: orderNumber,
          })
          .select()
          .single();
        orderData = data;
        orderError = error;
        if (!error) break;
        if (error.code === "23505") continue; // unique violation, retry with new number
        throw error;
      }
      if (orderError) throw orderError;
      if (!orderData) throw new Error("Failed to create order");

      // Notify Admin via Supabase Edge Function
      if (orderData) {
        supabase.functions
          .invoke("send-order-notification", {
            body: {
              type: "new_order",
              orderData: orderData,
            },
          })
          .catch((err) => console.error("Error triggering notification:", err));
      }

      clearCart();
      // Show thank you page in this tab (payment already opened in new tab above)
      navigate(pathFor("/thank-you"), {
        state: {
          orderId: orderData.order_number || orderData.id,
          orderUuid: orderData.id,
          items: orderItems,
          total: cartTotal,
          currencySymbol: currency.symbol,
        },
      });
    } catch (error) {
      console.error(
        "Error creating order:",
        error instanceof Error ? error.message : error
      );
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return `${currency.symbol}${price.toLocaleString()}`;
  };

  return (
    <Layout>
      <div className="min-h-screen py-16 md:py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-body text-2xl md:text-3xl font-normal mb-12 text-center">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Checkout Form */}
            <div>
              <h2 className="text-[11px] uppercase tracking-[0.15em] mb-6 font-normal">
                Shipping Information
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1">
                    Street / Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. Rustaveli Avenue"
                    className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider mb-1">
                      House number
                    </label>
                    <input
                      type="text"
                      name="houseNumber"
                      value={formData.houseNumber}
                      onChange={handleChange}
                      placeholder="e.g. 12"
                      className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider mb-1">
                      Post code
                    </label>
                    <input
                      type="text"
                      name="postCode"
                      value={formData.postCode}
                      onChange={handleChange}
                      placeholder="e.g. 0108"
                      className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1">
                    City
                  </label>
                  <select
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-border py-2 text-sm focus:outline-none focus:border-foreground appearance-none cursor-pointer"
                  >
                    <option value="">Select city</option>
                    {GEORGIAN_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-luxury-primary w-full mt-8"
                >
                  {isSubmitting ? "Processing..." : "Complete Order"}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-muted/30 p-8">
              <h2 className="text-[11px] uppercase tracking-[0.15em] mb-6 font-normal text-center">
                Order Summary
              </h2>
              <div className="space-y-4 mb-8">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="font-light">
                      {item.product.name} (x{item.quantity}, {item.size})
                    </span>
                    <span>
                      {formatPrice(
                        (item.product.onSale && item.product.salePrice
                          ? item.product.salePrice
                          : item.product.price) * item.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 flex justify-between font-normal">
                <span className="text-[11px] uppercase tracking-widest">
                  Total
                </span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-8 text-center leading-relaxed">
                By clicking "Complete Order", you will be redirected to our
                secure payment page to finish your transaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;

import { useLocation, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useShop } from "@/context/ShopContext";
import { useLocale } from "@/hooks/useLocale";
import { Check } from "lucide-react";

export interface ThankYouOrderItem {
  product_id: string;
  name: string;
  quantity: number;
  size: string;
  price: number;
}

export interface ThankYouLocationState {
  orderId: string;
  items: ThankYouOrderItem[];
  total: number;
  currencySymbol: string;
}

const PAYMENT_URL = "https://egreve.bog.ge/teklaqvelidze";

const ThankYouPage = () => {
  const { pathFor } = useLocale();
  const location = useLocation();
  const { clearCart } = useShop();

  const state = location.state as ThankYouLocationState | null;
  const hasOrder = state?.items?.length && state.total != null;

  const handleProceedToPayment = () => {
    window.open(PAYMENT_URL, "_blank", "noopener,noreferrer");
    clearCart();
    // Stay on thank you page in this tab
  };

  const formatPrice = (price: number, symbol: string) =>
    `${symbol}${price.toLocaleString()}`;

  return (
    <Layout>
      <div className="min-h-screen py-16 md:py-24 px-6 lg:px-12">
        <div className="max-w-2xl mx-auto text-center">
          {hasOrder ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-foreground text-background mb-8">
                <Check className="w-8 h-8" strokeWidth={2.5} />
              </div>
              <h1 className="font-body text-2xl md:text-3xl font-normal mb-3">
                Thank you for your order
              </h1>
              <p className="text-sm text-muted-foreground mb-10">
                Your order has been received. Review the items below, then
                proceed to complete payment.
              </p>

              <div className="bg-muted/30 border border-border p-6 md:p-8 text-left">
                <h2 className="text-[11px] uppercase tracking-[0.15em] mb-6 font-normal text-center">
                  Order summary
                </h2>
                {state.orderId && (
                  <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                      Order ID
                    </p>
                    <p className="text-xs font-mono font-medium break-all">
                      {state.orderId}
                    </p>
                  </div>
                )}
                <ul className="space-y-4 mb-6">
                  {state.items.map((item, i) => (
                    <li
                      key={`${item.product_id}-${item.size}-${i}`}
                      className="flex justify-between text-sm border-b border-border/50 pb-4 last:border-0 last:pb-0"
                    >
                      <span className="font-light">
                        {item.name}{" "}
                        <span className="text-muted-foreground">
                          × {item.quantity}, {item.size}
                        </span>
                      </span>
                      <span className="font-medium">
                        {formatPrice(
                          item.price * item.quantity,
                          state.currencySymbol
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border pt-4 flex justify-between font-normal">
                  <span className="text-[11px] uppercase tracking-widest">
                    Total
                  </span>
                  <span>{formatPrice(state.total, state.currencySymbol)}</span>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="btn-luxury-outline w-full"
                >
                  Open payment page again
                </button>
                <p className="text-[10px] text-muted-foreground">
                  Payment will open in a new tab. This page will stay here.
                </p>
                <Link
                  to={pathFor("/")}
                  className="inline-block text-sm underline underline-offset-4 hover:no-underline mt-4"
                >
                  Continue shopping
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-body text-2xl md:text-3xl font-normal mb-4">
                Thank you
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                If you just placed an order, you can view it in your{" "}
                <Link to={pathFor("/profile")} className="underline">
                  profile
                </Link>
                .
              </p>
              <Link to={pathFor("/")} className="btn-luxury-outline">
                Back to home
              </Link>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ThankYouPage;

import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useShop } from "@/context/ShopContext";
import { useLocale } from "@/hooks/useLocale";

const CartDrawer = () => {
  const { pathFor } = useLocale();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
    currency,
  } = useShop();

  if (!isCartOpen) return null;

  const formatPrice = (price: number) => {
    return `${currency.symbol}${price.toLocaleString()}`;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="drawer-overlay animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="drawer-panel animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-body font-normal">
            Shopping Bag ({cart.length})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <p className="text-sm font-light text-muted-foreground text-center py-12">
              Your shopping bag is empty
            </p>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex gap-4"
                >
                  {/* Product image */}
                  <div className="w-24 h-32 bg-muted flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product details */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-sm font-normal mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-1">
                      Size: {item.size}
                    </p>
                    <p className="text-sm mb-auto">
                      {item.product.onSale && item.product.salePrice
                        ? formatPrice(item.product.salePrice)
                        : formatPrice(item.product.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          className="p-1 hover:bg-muted transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          className="p-1 hover:bg-muted transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          removeFromCart(item.product.id, item.size)
                        }
                        className="p-1 hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-light">Subtotal</span>
              <span className="text-sm font-normal">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <Link
              to={pathFor("/checkout")}
              onClick={() => setIsCartOpen(false)}
              className="btn-luxury-primary w-full text-center"
            >
              Proceed to Checkout
            </Link>
            <p className="text-[10px] text-center text-muted-foreground mt-4">
              Shipping and taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

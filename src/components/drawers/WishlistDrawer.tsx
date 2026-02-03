import { X, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useShop } from "@/context/ShopContext";
import { useLocale } from "@/hooks/useLocale";

const WishlistDrawer = () => {
  const { pathFor } = useLocale();
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    removeFromWishlist,
    addToCart,
    currency,
  } = useShop();

  if (!isWishlistOpen) return null;

  const formatPrice = (price: number) => {
    return `${currency.symbol}${price.toLocaleString()}`;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="drawer-overlay animate-fade-in"
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Drawer */}
      <div className="drawer-panel animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-body font-normal">
            Wishlist ({wishlist.length})
          </h2>
          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-2 hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist items */}
        <div className="flex-1 overflow-y-auto p-6">
          {wishlist.length === 0 ? (
            <p className="text-sm font-light text-muted-foreground text-center py-12">
              Your wishlist is empty
            </p>
          ) : (
            <div className="space-y-6">
              {wishlist.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  {/* Product image */}
                  <Link
                    to={pathFor(`/product/${item.product.id}`)}
                    onClick={() => setIsWishlistOpen(false)}
                    className="w-24 h-32 bg-muted flex-shrink-0"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Product details */}
                  <div className="flex-1 flex flex-col">
                    <Link
                      to={pathFor(`/product/${item.product.id}`)}
                      onClick={() => setIsWishlistOpen(false)}
                    >
                      <h3 className="text-sm font-normal mb-1 hover:underline">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-sm mb-auto">
                      {item.product.onSale && item.product.salePrice ? (
                        <>
                          <span className="text-destructive mr-2">
                            {formatPrice(item.product.salePrice)}
                          </span>
                          <span className="line-through text-muted-foreground">
                            {formatPrice(item.product.price)}
                          </span>
                        </>
                      ) : (
                        formatPrice(item.product.price)
                      )}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-2">
                      <Link
                        to={pathFor(`/product/${item.product.id}`)}
                        onClick={() => setIsWishlistOpen(false)}
                        className="flex-1 btn-luxury-outline text-[10px] py-2"
                      >
                        <ShoppingBag className="w-3 h-3 mr-2" />
                        View Product
                      </Link>
                      <button
                        onClick={() => removeFromWishlist(item.product.id)}
                        className="p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
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
      </div>
    </>
  );
};

export default WishlistDrawer;

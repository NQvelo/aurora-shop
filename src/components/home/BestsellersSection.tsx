import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useShop } from "@/context/ShopContext";

const BestsellersSection = () => {
  const { currency, addToWishlist, removeFromWishlist, isInWishlist } =
    useShop();
  const { data: allProducts, isLoading } = useProducts();

  const bestsellers = (allProducts || [])
    .filter((p) => p.isBestseller)
    .slice(0, 4);

  const formatPrice = (price: number) => {
    return `${currency.symbol}${price.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 px-6 lg:px-12">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
          Most Loved
        </p>
        <h2 className="font-display text-3xl md:text-4xl tracking-wide">
          Bestsellers
        </h2>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {bestsellers.map((product) => (
          <div key={product.id} className="group">
            <Link to={`/product/${product.id}`} className="block">
              <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-4">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Wishlist button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isInWishlist(product.id)) {
                      removeFromWishlist(product.id);
                    } else {
                      addToWishlist(product);
                    }
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Add to wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isInWishlist(product.id) ? "fill-current" : ""
                    }`}
                  />
                </button>

                {/* Product info overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-medium">
                    {product.name}
                  </p>
                  <p className="text-white/80 text-sm">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center mt-12">
        <Link to="/bestsellers" className="btn-luxury-outline">
          View All Bestsellers
        </Link>
      </div>
    </section>
  );
};

export default BestsellersSection;

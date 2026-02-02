import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Product } from '@/types/product';
import { useShop } from '@/context/ShopContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { currency, addToWishlist, removeFromWishlist, isInWishlist } = useShop();

  const formatPrice = (price: number) => {
    return `${currency.symbol}${price.toLocaleString()}`;
  };

  return (
    <div className="group">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isNew && (
              <span className="bg-foreground text-background text-[9px] uppercase tracking-wider px-2 py-1">
                New
              </span>
            )}
            {product.onSale && (
              <span className="bg-destructive text-destructive-foreground text-[9px] uppercase tracking-wider px-2 py-1">
                Sale
              </span>
            )}
          </div>

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
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-4 h-4 ${
                isInWishlist(product.id) ? 'fill-current' : ''
              }`}
            />
          </button>

          {/* Product info overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-white text-sm font-medium">{product.name}</p>
            <p className="text-white/80 text-sm">
              {product.onSale && product.salePrice ? (
                <>
                  <span className="mr-2">{formatPrice(product.salePrice)}</span>
                  <span className="line-through opacity-60">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                formatPrice(product.price)
              )}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;

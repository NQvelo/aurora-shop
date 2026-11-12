import { Link } from "react-router-dom";
import { Heart, Share2 } from "lucide-react";
import { Product } from "@/types/product";
import { useShop } from "@/context/ShopContext";
import { useLocale } from "@/hooks/useLocale";

interface ShopItemProps {
  product: Product;
  onNavigate?: () => void;
}

const ShopItem = ({ product, onNavigate }: ShopItemProps) => {
  const { pathFor } = useLocale();
  const { currency, addToWishlist, removeFromWishlist, isInWishlist } =
    useShop();

  const formatPrice = (price: number) => {
    return `${currency.symbol}${price.toLocaleString()}`;
  };

  const shareProduct = async () => {
    const url = `${window.location.origin}${pathFor(`/product/${product.id}`)}`;
    const payload = { title: product.name, url };
    if (navigator.share) {
      try {
        await navigator.share(payload);
      } catch {
        // The share sheet was dismissed.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard access was blocked.
    }
  };

  return (
    <div className="group">
      <div className="relative mb-3">
        <Link
          to={pathFor(`/product/${product.id}`)}
          onClick={onNavigate}
          className="block"
        >
          <div className="aspect-[3/4] overflow-hidden rounded-[5px] bg-muted">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </Link>
        <div className="absolute bottom-2 right-2 z-10 flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (isInWishlist(product.id)) {
                removeFromWishlist(product.id);
              } else {
                addToWishlist(product);
              }
            }}
            className="flex h-9 w-9 items-center justify-center bg-white/45 backdrop-blur-md"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`h-4 w-4 ${
                isInWishlist(product.id) ? "fill-current" : ""
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => void shareProduct()}
            className="flex h-9 w-9 items-center justify-center bg-white/45 backdrop-blur-md"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <Link
        to={pathFor(`/product/${product.id}`)}
        onClick={onNavigate}
        className="block"
      >
        <p className="font-body text-xs font-normal md:text-sm">{product.name}</p>
        <p className="mt-1 font-body text-xs text-muted-foreground md:text-sm">
          {product.onSale && product.salePrice ? (
            <>
              <span className="mr-2 text-foreground">
                {formatPrice(product.salePrice)}
              </span>
              <span className="line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            formatPrice(product.price)
          )}
        </p>
      </Link>
    </div>
  );
};

export default ShopItem;

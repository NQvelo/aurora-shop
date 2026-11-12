import { Product } from "@/types/product";
import ShopItem from "./ShopItem";

interface ProductCardProps {
  product: Product;
  onNavigate?: () => void;
}

const ProductCard = ({ product, onNavigate }: ProductCardProps) => {
  return <ShopItem product={product} onNavigate={onNavigate} />;
};

export default ProductCard;

import { useEffect, useRef, useState } from "react";
import { Product } from "@/types/product";
import ShopItem from "./ShopItem";

const PAGE_SIZE = 10;

interface ProgressiveGridProps {
  products: Product[];
  onNavigate?: () => void;
  className?: string;
}

const ProgressiveGrid = ({
  products,
  onNavigate,
  className = "grid grid-cols-2 gap-x-2 gap-y-8 px-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-3 lg:px-12 xl:grid-cols-5",
}: ProgressiveGridProps) => {
  const [count, setCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const listKey = products.map((product) => product.id).join("|");

  useEffect(() => {
    setCount(PAGE_SIZE);
  }, [listKey]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || count >= products.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setCount((current) => Math.min(current + PAGE_SIZE, products.length));
        }
      },
      { rootMargin: "480px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [count, products.length]);

  if (products.length === 0) return null;

  return (
    <div>
      <div className={className}>
        {products.slice(0, count).map((product) => (
          <ShopItem
            key={product.id}
            product={product}
            onNavigate={onNavigate}
          />
        ))}
      </div>
      {count < products.length && (
        <div ref={sentinelRef} className="h-16" aria-hidden />
      )}
    </div>
  );
};

export default ProgressiveGrid;

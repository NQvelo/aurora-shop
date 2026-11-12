import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types/product";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import ShopItem from "./ShopItem";

interface ProductRowProps {
  products: Product[];
  nextLabel?: string;
  onNavigate?: () => void;
}

const ProductRow = ({
  products,
  nextLabel = "Next",
  onNavigate,
}: ProductRowProps) => {
  const [api, setApi] = useState<CarouselApi>();

  if (products.length === 0) return null;

  return (
    <Carousel
      opts={{
        align: "start",
        loop: products.length > 1,
        dragFree: true,
        duration: 45,
      }}
      setApi={setApi}
      className="w-full"
    >
      <CarouselContent className="-ml-2 lg:-ml-3">
        {products.map((product) => (
          <CarouselItem
            key={product.id}
            className="basis-[46%] pl-2 sm:basis-1/4 lg:basis-1/5 lg:pl-3"
          >
            <ShopItem product={product} onNavigate={onNavigate} />
          </CarouselItem>
        ))}
      </CarouselContent>

      {products.length > 1 && (
        <button
          type="button"
          onClick={() => api?.scrollNext()}
          className="absolute right-1 top-[26%] z-10 flex h-9 w-9 items-center justify-center border border-foreground/15 bg-white shadow-sm"
          aria-label={nextLabel}
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </Carousel>
  );
};

export default ProductRow;

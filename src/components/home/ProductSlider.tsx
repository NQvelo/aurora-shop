import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import { useLocale } from "@/hooks/useLocale";
import ProductRow from "@/components/product/ProductRow";

interface ProductSliderProps {
  title: string;
  eyebrow?: string;
  products: Product[];
  viewAllTo: string;
  viewAllLabel: string;
  nextLabel: string;
  isLoading: boolean;
}

const ProductSlider = ({
  title,
  eyebrow,
  products,
  viewAllTo,
  viewAllLabel,
  nextLabel,
  isLoading,
}: ProductSliderProps) => {
  const { pathFor } = useLocale();

  if (isLoading) {
    return (
      <section className="py-8 lg:px-12">
        <div className="mb-4 ml-6 h-8 w-40 bg-muted animate-pulse lg:ml-0" />
        <div className="flex gap-2 overflow-hidden lg:gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] w-[42%] shrink-0 bg-muted animate-pulse sm:w-1/4 lg:w-1/5"
            />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-8 lg:px-12 lg:py-10">
      <div className="mb-5 px-6 font-body lg:px-0">
        {eyebrow && (
          <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h2 className="font-body text-2xl font-normal md:text-3xl">{title}</h2>
      </div>

      <ProductRow products={products} nextLabel={nextLabel} />

      <div className="mt-8 px-6 text-center font-body lg:px-0">
        <Link to={pathFor(viewAllTo)} className="btn-luxury-outline">
          {viewAllLabel}
        </Link>
      </div>
    </section>
  );
};

export default ProductSlider;

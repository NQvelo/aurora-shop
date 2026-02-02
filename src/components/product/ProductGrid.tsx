import { useState } from 'react';
import { Product, SortOption } from '@/types/product';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  title?: string;
  showSort?: boolean;
}

const ProductGrid = ({ products, title, showSort = true }: ProductGridProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.onSale && a.salePrice ? a.salePrice : a.price) -
               (b.onSale && b.salePrice ? b.salePrice : b.price);
      case 'price-desc':
        return (b.onSale && b.salePrice ? b.salePrice : b.price) -
               (a.onSale && a.salePrice ? a.salePrice : a.price);
      case 'bestseller':
        return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      case 'newest':
      default:
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    }
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-6 lg:px-12 pt-8">
        {title && (
          <h1 className="font-display text-2xl md:text-3xl tracking-wide">
            {title}
          </h1>
        )}
        
        {showSort && (
          <div className="flex items-center gap-4">
            <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground hidden md:inline">
              Sort by
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-[11px] uppercase tracking-[0.1em] focus:outline-none cursor-pointer border border-border px-3 py-2"
            >
              <option value="newest">Newest</option>
              <option value="bestseller">Bestseller</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        )}
      </div>

      {/* Products count */}
      <div className="px-6 lg:px-12 mb-4">
        <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Grid */}
      <div className="product-grid">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-24 px-6">
          <p className="text-muted-foreground">No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

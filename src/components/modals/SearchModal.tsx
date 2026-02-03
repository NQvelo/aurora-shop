import { useState, useEffect, useMemo } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useShop } from "@/context/ShopContext";
import { useProducts } from "@/hooks/useProducts";
import { products as staticProducts } from "@/data/products";
import { Product } from "@/types/product";

const DEBOUNCE_MS = 200;
const SEARCH_FIELDS = [
  "name",
  "category",
  "collection",
  "description",
] as const;

function matchesQuery(product: Product, q: string): boolean {
  const lower = q.toLowerCase().trim();
  if (!lower) return false;
  for (const field of SEARCH_FIELDS) {
    const value =
      field === "name" || field === "category"
        ? product[field]
        : (product as Record<string, unknown>)[field];
    if (typeof value === "string" && value.toLowerCase().includes(lower))
      return true;
  }
  return false;
}

const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, currency } = useShop();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data: apiProducts = [], isLoading } = useProducts();
  const products: Product[] =
    apiProducts.length > 0 ? apiProducts : staticProducts;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return products.filter((p) => matchesQuery(p, debouncedQuery));
  }, [products, debouncedQuery]);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setDebouncedQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  const popularTerms = useMemo(() => {
    const categories = products
      .map((p) => p.category)
      .filter((c): c is string => !!c && c.length >= 2);
    const unique = [...new Set(categories)];
    if (unique.length >= 4) return unique.slice(0, 6);
    const fallback = ["Cashmere", "Wool Coat", "Blazer", "Silk", "Knitwear"];
    return [...new Set([...unique, ...fallback])].slice(0, 6);
  }, [products]);

  if (!isSearchOpen) return null;

  const formatPrice = (price: number) => {
    return `${currency.symbol}${price.toLocaleString()}`;
  };

  const imageUrl = (product: Product) => product.images?.[0] ?? "";

  return (
    <div className="fixed inset-0 bg-background z-50 animate-fade-in overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[11px] uppercase tracking-[0.15em] font-medium">
            Search
          </h2>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-2 hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-12">
          <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, category, collection..."
            className="w-full pl-8 pr-4 py-4 border-b border-border bg-transparent text-lg font-light placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
            autoFocus
          />
        </div>

        {query.trim() && (
          <div>
            {isLoading && !apiProducts.length ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Loading products...</span>
              </div>
            ) : (
              <>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-6">
                  {query !== debouncedQuery
                    ? "Searching..."
                    : `${results.length} ${
                        results.length === 1 ? "result" : "results"
                      }`}
                </p>

                {query === debouncedQuery && results.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="group"
                      >
                        <div className="aspect-[3/4] bg-muted mb-3 overflow-hidden">
                          {imageUrl(product) ? (
                            <img
                              src={imageUrl(product)}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              No image
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm font-medium mb-1 group-hover:underline">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(
                            product.onSale && product.salePrice != null
                              ? product.salePrice
                              : product.price
                          )}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : query === debouncedQuery && results.length === 0 ? (
                  <p className="text-sm font-light text-muted-foreground text-center py-12">
                    No products found matching &quot;{debouncedQuery}&quot;
                  </p>
                ) : null}
              </>
            )}
          </div>
        )}

        {!query.trim() && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Popular searches
            </p>
            <div className="flex flex-wrap gap-2">
              {popularTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 border border-border hover:border-foreground transition-colors text-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;

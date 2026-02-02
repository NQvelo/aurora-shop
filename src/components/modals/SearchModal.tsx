import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop } from '@/context/ShopContext';
import { products } from '@/data/products';
import { Product } from '@/types/product';

const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, currency } = useShop();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (query.trim()) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const formatPrice = (price: number) => {
    return `${currency.symbol}${price.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-background z-50 animate-fade-in overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
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

        {/* Search input */}
        <div className="relative mb-12">
          <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full pl-8 pr-4 py-4 border-b border-border bg-transparent text-lg font-light placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
            autoFocus
          />
        </div>

        {/* Results */}
        {query.trim() && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-6">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="group"
                  >
                    <div className="aspect-[3/4] bg-muted mb-3 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-sm font-medium mb-1 group-hover:underline">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(product.price)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm font-light text-muted-foreground text-center py-12">
                No products found matching "{query}"
              </p>
            )}
          </div>
        )}

        {/* Popular searches */}
        {!query.trim() && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {['Cashmere', 'Wool Coat', 'Blazer', 'Silk', 'Knitwear'].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 border border-border hover:border-foreground transition-colors text-sm"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;

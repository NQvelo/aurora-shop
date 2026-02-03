import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ChevronDown, ChevronUp } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useShop } from "@/context/ShopContext";
import { useLocale } from "@/hooks/useLocale";

const ProductPage = () => {
  const { id } = useParams();
  const { pathFor } = useLocale();
  const {
    currency,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useShop();

  const { data: product, isLoading: isLoadingProduct } = useProduct(id || "");
  const { data: allProducts } = useProducts();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "details"
  );

  if (isLoadingProduct) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground uppercase tracking-widest text-[10px]">
              Loading
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground uppercase tracking-widest text-[10px]">
            Product not found
          </p>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number) => {
    return `${currency.symbol}${price.toLocaleString()}`;
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    addToCart(product, selectedSize);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Get recommended products (same category, different product)
  const recommended = (allProducts || [])
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative">
            <div className="aspect-[3/4] lg:aspect-auto lg:h-[calc(100vh-var(--top-bar-height)-var(--header-height))] sticky top-[calc(var(--top-bar-height)+var(--header-height))]">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail navigation if multiple images */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div
            className="p-6 lg:p-12 lg:overflow-y-auto"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {/* Breadcrumb */}
            <nav className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-6">
<Link to={pathFor("/")} className="hover:text-foreground transition-colors">
              Home
              </Link>
              <span className="mx-2">/</span>
              <Link
                to={pathFor("/clothing")}
                className="hover:text-foreground transition-colors"
              >
                {product.category}
              </Link>
            </nav>

            {/* Product Name & Price */}
            <h1 className="font-body text-2xl md:text-3xl mb-4 font-normal">
              {product.name}
            </h1>

            <div className="mb-6">
              {product.onSale && product.salePrice ? (
                <div className="flex items-center gap-3">
                  <span className="text-lg text-destructive">
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-lg">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm font-light leading-relaxed text-muted-foreground mb-8">
                {product.description}
              </p>
            )}

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase tracking-[0.15em]">
                  Select Size
                </span>
                <button className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground underline transition-colors">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.label}
                    onClick={() =>
                      size.available && setSelectedSize(size.label)
                    }
                    disabled={!size.available}
                    className={`size-btn ${
                      selectedSize === size.label ? "size-btn-selected" : ""
                    } ${!size.available ? "size-btn-disabled" : ""}`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                className="btn-luxury-primary flex-1"
              >
                Add to Bag
              </button>
              <button
                onClick={() =>
                  isInWishlist(product.id)
                    ? removeFromWishlist(product.id)
                    : addToWishlist(product)
                }
                className="btn-luxury-outline px-4"
                aria-label="Add to wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isInWishlist(product.id) ? "fill-current" : ""
                  }`}
                />
              </button>
            </div>

            {/* Collapsible Sections */}
            <div className="border-t border-border">
              {/* Product Details */}
              <div className="border-b border-border">
                <button
                  onClick={() => toggleSection("details")}
                  className="collapsible-header w-full"
                >
                  Product Details
                  {expandedSection === "details" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {expandedSection === "details" && product.details && (
                  <div className="pb-4">
                    <ul className="space-y-2">
                      {product.details.map((detail, index) => (
                        <li
                          key={index}
                          className="text-sm font-light text-muted-foreground"
                        >
                          • {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Shipping & Returns */}
              <div className="border-b border-border">
                <button
                  onClick={() => toggleSection("shipping")}
                  className="collapsible-header w-full"
                >
                  Shipping & Returns
                  {expandedSection === "shipping" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {expandedSection === "shipping" && (
                  <div className="pb-4 space-y-3">
                    <p className="text-sm font-light text-muted-foreground">
                      Free worldwide shipping on orders over ₾3,500.
                    </p>
                    <p className="text-sm font-light text-muted-foreground">
                      Standard delivery: 3-5 business days.
                    </p>
                    <p className="text-sm font-light text-muted-foreground">
                      Free returns within 14 days of delivery.
                    </p>
                  </div>
                )}
              </div>

              {/* Need Help */}
              <div className="border-b border-border">
                <button
                  onClick={() => toggleSection("help")}
                  className="collapsible-header w-full"
                >
                  Need Help?
                  {expandedSection === "help" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {expandedSection === "help" && (
                  <div className="pb-4 space-y-3">
                    <p className="text-sm font-light text-muted-foreground">
                      Contact our customer service team for assistance.
                    </p>
                    <p className="text-sm font-light text-muted-foreground">
                      Email: support@yourbrand.com
                    </p>
                    <p className="text-sm font-light text-muted-foreground">
                      Phone: +44 20 1234 5678
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        {recommended.length > 0 && (
          <section className="py-16 md:py-24 px-6 lg:px-12 border-t border-border">
            <h2 className="font-display text-2xl md:text-3xl tracking-wide text-center mb-12">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recommended.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductPage;

import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductGrid from "@/components/product/ProductGrid";
import { useProducts } from "@/hooks/useProducts";

interface CategoryPageProps {
  category:
    | "sale"
    | "new"
    | "clothing"
    | "bestsellers"
    | "collections"
    | "dresses"
    | "makeup"
    | "jewelry"
    | "best-friend"
    | "girlfriend";
}

const CategoryPage = ({ category }: CategoryPageProps) => {
  const { collection } = useParams();
  const { data: allProducts, isLoading } = useProducts();

  const getFilteredProducts = () => {
    if (!allProducts) return [];

    switch (category) {
      case "sale":
        return allProducts.filter((p) => p.onSale);
      case "new":
        return allProducts.filter((p) => p.isNew);
      case "bestsellers":
        return allProducts.filter((p) => p.isBestseller);
      case "collections":
        if (collection) {
          return allProducts.filter(
            (p) => p.collection?.toLowerCase() === collection.toLowerCase()
          );
        }
        return allProducts;
      case "dresses":
      case "makeup":
      case "jewelry":
      case "best-friend":
      case "girlfriend": {
        const slugToCategory: Record<string, string> = {
          dresses: "dresses",
          makeup: "makeup",
          jewelry: "jewelry",
          "best-friend": "for your best friend",
          girlfriend: "for your girlfriend",
        };
        const desired = slugToCategory[category];
        return allProducts.filter(
          (p) => (p.category || "").toLowerCase() === desired
        );
      }
      case "clothing":
      default:
        return allProducts;
    }
  };

  const getTitle = () => {
    switch (category) {
      case "sale":
        return "Sale";
      case "new":
        return "New In";
      case "bestsellers":
        return "Bestsellers";
      case "collections":
        if (collection) {
          return collection
            .toUpperCase()
            .replace("AW", "Autumn/Winter ")
            .replace("SS", "Spring/Summer ");
        }
        return "All Collections";
      case "dresses":
        return "Dresses";
      case "makeup":
        return "Makeup";
      case "jewelry":
        return "Jewelry";
      case "best-friend":
        return "For your best friend";
      case "girlfriend":
        return "For your girlfriend";
      case "clothing":
      default:
        return "Clothing";
    }
  };

  const filteredProducts = getFilteredProducts();
  const title = getTitle();

  if (isLoading) {
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

  return (
    <Layout>
      <div className="min-h-screen pb-16">
        <ProductGrid products={filteredProducts} title={title} />
      </div>
    </Layout>
  );
};

export default CategoryPage;

import { useTranslation } from "react-i18next";
import { useProducts } from "@/hooks/useProducts";
import ProductSlider from "./ProductSlider";

const NewCollectionSection = () => {
  const { t } = useTranslation();
  const { data: allProducts, isLoading } = useProducts();
  const products = (allProducts || []).filter((p) => p.isNew);

  return (
    <ProductSlider
      title={t("home.newCollection")}
      products={products}
      viewAllTo="/new"
      viewAllLabel={t("home.viewAllNew")}
      nextLabel="Next new collection"
      isLoading={isLoading}
    />
  );
};

export default NewCollectionSection;

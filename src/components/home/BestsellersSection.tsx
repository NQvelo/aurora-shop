import { useTranslation } from "react-i18next";
import { useProducts } from "@/hooks/useProducts";
import ProductSlider from "./ProductSlider";

const BestsellersSection = () => {
  const { t } = useTranslation();
  const { data: allProducts, isLoading } = useProducts();
  const bestsellers = (allProducts || []).filter((p) => p.isBestseller);

  return (
    <ProductSlider
      title={t("home.bestsellers")}
      eyebrow={t("home.mostLoved")}
      products={bestsellers}
      viewAllTo="/bestsellers"
      viewAllLabel={t("home.viewAll")}
      nextLabel="Next bestsellers"
      isLoading={isLoading}
    />
  );
};

export default BestsellersSection;

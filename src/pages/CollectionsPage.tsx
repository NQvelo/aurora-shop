import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { useLocale } from "@/hooks/useLocale";
import dresses from "@/assets/dresses.jpg";
import makeup from "@/assets/makeup.jpg";
import gf from "@/assets/gf.jpg";
import bf from "@/assets/bff.jpg";
import pet from "@/assets/bf.jpg";

import jewelry from "@/assets/jewlry.jpg";

const CollectionsPage = () => {
  const { t } = useTranslation();
  const { pathFor } = useLocale();

  const categoryLinks = [
    {
      title: t("categories.dresses"),
      to: "/collections/dresses",
      image: dresses,
    },
    { title: t("categories.makeup"), to: "/collections/makeup", image: makeup },
    {
      title: t("categories.jewelry"),
      to: "/collections/jewelry",
      image: jewelry,
    },
    { title: t("categories.pet"), to: "/collections/pet", image: pet },
    {
      title: t("categories.bestFriend"),
      to: "/collections/best-friend",
      image: bf,
    },
    {
      title: t("categories.girlfriend"),
      to: "/collections/girlfriend",
      image: gf,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
          <div className="mb-10 border-b border-border pb-6">
            <h1 className="font-body text-2xl md:text-3xl mb-2 font-normal">
              {t("home.collections")}
            </h1>
            <p className="text-muted-foreground uppercase tracking-widest text-[10px]">
              {t("home.browseCategories")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12">
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-6">
                {t("home.categories")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {categoryLinks.map((c) => (
                  <Link
                    key={c.to}
                    to={pathFor(c.to)}
                    className="group relative block overflow-hidden"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={c.image}
                        alt={c.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center text-white px-6 text-center">
                        <h3
                          className="font-normal text-3xl md:text-3xl tracking-wide"
                          style={{ fontFamily: "var(--font-collections)" }}
                        >
                          {c.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollectionsPage;

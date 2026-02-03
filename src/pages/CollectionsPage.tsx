import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import dresses from "@/assets/dresses.jpg";
import makeup from "@/assets/makeup.jpg";
import gf from "@/assets/gf.jpg";
import bf from "@/assets/bf.jpg";
import jewelry from "@/assets/jewlry.jpg";

const categoryLinks = [
  { title: "Dresses", to: "/collections/dresses", image: dresses },
  { title: "Makeup", to: "/collections/makeup", image: makeup },
  { title: "Jewelry", to: "/collections/jewelry", image: jewelry },

  {
    title: "For your best friend",
    to: "/collections/best-friend",
    image: bf,
  },
  {
    title: "For your girlfriend",
    to: "/collections/girlfriend",
    image: gf,
  },
];

const CollectionsPage = () => {
  return (
    <Layout>
      <div className="min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
          <div className="mb-10 border-b border-border pb-6">
            <h1 className="font-display text-4xl mb-2">Collections</h1>
            <p className="text-muted-foreground uppercase tracking-widest text-[10px]">
              Browse curated categories
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12">
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-6">
                Categories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {categoryLinks.map((c) => (
                  <Link
                    key={c.to}
                    to={c.to}
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
                        <h3 className="font-display font-semibold text-3xl md:text-3xl tracking-wide">
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

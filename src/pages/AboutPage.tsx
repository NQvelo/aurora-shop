import Layout from "@/components/layout/Layout";

const AboutPage = () => {
  return (
    <Layout>
      <div className="min-h-screen py-16 md:py-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
              Our Story
            </p>
            <h1 className="font-body text-2xl md:text-3xl font-normal mb-8">
              About Your Brand
            </h1>
          </div>

          {/* Content */}
          <div className="space-y-8 text-sm font-light leading-relaxed text-muted-foreground">
            <p>
              Founded in 2020, Your Brand represents the pinnacle of
              contemporary luxury fashion. Our philosophy centers on the belief
              that true elegance lies in simplicity—in the quiet confidence of
              impeccable craftsmanship and timeless design.
            </p>

            <p>
              Each piece in our collection is meticulously crafted using only
              the finest materials sourced from heritage mills across Europe.
              From the cashmere fields of Mongolia to the silk workshops of
              Como, we partner with artisans who share our commitment to
              excellence.
            </p>

            <p>
              Our design ethos embraces understated sophistication. We believe
              in creating garments that transcend seasonal trends—pieces that
              become cherished elements of your wardrobe for years to come.
              Clean lines, refined silhouettes, and a restrained color palette
              form the foundation of our aesthetic.
            </p>

            <p>
              Sustainability is woven into the fabric of everything we do. We
              are committed to responsible sourcing, ethical manufacturing, and
              reducing our environmental footprint. Every decision we make
              considers its impact on the planet and future generations.
            </p>

            <p>
              Welcome to Your Brand. Welcome to a new definition of modern
              luxury.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-border">
            <div className="text-center">
              <h3 className="font-display text-xl mb-4">Craftsmanship</h3>
              <p className="text-sm font-light text-muted-foreground">
                Every stitch, every seam, every detail is executed with
                precision and care.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-display text-xl mb-4">Sustainability</h3>
              <p className="text-sm font-light text-muted-foreground">
                Committed to responsible practices that respect our planet and
                its people.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-display text-xl mb-4">Timelessness</h3>
              <p className="text-sm font-light text-muted-foreground">
                Designs that transcend trends, becoming lasting elements of your
                wardrobe.
              </p>
            </div>
          </div>

          {/* Stockists */}
          <div className="mt-16 pt-16 border-t border-border">
            <h2 className="font-display text-2xl md:text-3xl tracking-wide text-center mb-12">
              Our Stockists
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-[11px] uppercase tracking-[0.15em] mb-4">
                  Europe
                </h4>
                <ul className="space-y-2 text-sm font-light text-muted-foreground">
                  <li>Selfridges, London</li>
                  <li>Le Bon Marché, Paris</li>
                  <li>KaDeWe, Berlin</li>
                  <li>Rinascente, Milan</li>
                </ul>
              </div>
              <div>
                <h4 className="text-[11px] uppercase tracking-[0.15em] mb-4">
                  Worldwide
                </h4>
                <ul className="space-y-2 text-sm font-light text-muted-foreground">
                  <li>Bergdorf Goodman, New York</li>
                  <li>Nordstrom, Los Angeles</li>
                  <li>Isetan, Tokyo</li>
                  <li>Lane Crawford, Hong Kong</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;

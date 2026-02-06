import Layout from "@/components/layout/Layout";
import { useTranslation } from "react-i18next";

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="min-h-screen py-16 md:py-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-body text-2xl md:text-3xl font-normal mb-8">
              {t("terms.title")}
            </h1>
            <p className="text-sm font-light leading-relaxed text-muted-foreground mb-8">
              {t("terms.intro")}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-sm font-light leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section>
              <h2 className="font-display text-lg mb-4 text-foreground">
                {t("terms.section1.title")}
              </h2>
              <p className="mb-2">{t("terms.section1.p1")}</p>
              <p className="mb-2">{t("terms.section1.p2")}</p>
              <p>{t("terms.section1.p3")}</p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="font-display text-lg mb-4 text-foreground">
                {t("terms.section2.title")}
              </h2>
              <p className="mb-2">{t("terms.section2.p1")}</p>
              <p className="mb-2">{t("terms.section2.p2")}</p>
              <p>{t("terms.section2.p3")}</p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="font-display text-lg mb-4 text-foreground">
                {t("terms.section3.title")}
              </h2>
              <p className="mb-2">{t("terms.section3.p1")}</p>
              <p className="mb-2">{t("terms.section3.p2")}</p>
              <p>{t("terms.section3.p3")}</p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="font-display text-lg mb-4 text-foreground">
                {t("terms.section4.title")}
              </h2>
              <p className="mb-2">{t("terms.section4.p1")}</p>
              <p className="mb-2">{t("terms.section4.p2")}</p>
              <p className="mb-2">{t("terms.section4.p3")}</p>
              <p>{t("terms.section4.p4")}</p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="font-display text-lg mb-4 text-foreground">
                {t("terms.section5.title")}
              </h2>
              <p className="mb-2">{t("terms.section5.p1")}</p>
              <p>{t("terms.section5.p2")}</p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="font-display text-lg mb-4 text-foreground">
                {t("terms.section6.title")}
              </h2>
              <p className="mb-2">{t("terms.section6.p1")}</p>
              <p className="mb-2">{t("terms.section6.p2")}</p>
              <p>{t("terms.section6.p3")}</p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="font-display text-lg mb-4 text-foreground">
                {t("terms.section7.title")}
              </h2>
              <p className="mb-2">{t("terms.section7.p1")}</p>
              <ul className="list-disc pl-5 mb-2 space-y-1">
                <li>{t("terms.section7.li1")}</li>
                <li>{t("terms.section7.li2")}</li>
              </ul>
              <p className="mb-2">{t("terms.section7.p2")}</p>
              <p>{t("terms.section7.p3")}</p>
              <p>{t("terms.section7.p4")}</p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="font-display text-lg mb-4 text-foreground">
                {t("terms.section8.title")}
              </h2>
              <p className="mb-2">{t("terms.section8.p1")}</p>
              <p>{t("terms.section8.p2")}</p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="font-display text-lg mb-4 text-foreground">
                {t("terms.section9.title")}
              </h2>
              <p className="mb-2">{t("terms.section9.p1")}</p>
              <p>{t("terms.section9.p2")}</p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="font-display text-lg mb-4 text-foreground">
                {t("terms.section10.title")}
              </h2>
              <p className="mb-2">{t("terms.section10.p1")}</p>
              <p>{t("terms.section10.p2")}</p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="font-display text-lg mb-4 text-foreground">
                {t("terms.section11.title")}
              </h2>
              <p className="mb-2">{t("terms.section11.p1")}</p>
              <p>{t("terms.section11.p2")}</p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsPage;

import Layout from "@/components/layout/Layout";
import { useTranslation } from "react-i18next";

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="min-h-screen py-16 md:py-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
              {t("about.subtitle")}
            </p>
            <h1 className="font-body text-2xl md:text-3xl font-normal mb-8">
              {t("about.title")}
            </h1>
          </div>

          {/* Content */}
          <div className="space-y-8 text-sm font-light leading-relaxed text-muted-foreground">
            <p>{t("about.paragraph1")}</p>
            <p>{t("about.paragraph2")}</p>
            <p>{t("about.paragraph3")}</p>
            <p>{t("about.paragraph4")}</p>
            <p>{t("about.paragraph5")}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;

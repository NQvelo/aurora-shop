import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/hooks/useLocale";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

const CollectionsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathFor } = useLocale();

  const menuItems = [
    { label: t("nav.sale"), path: "/sale" },
    { label: t("nav.new"), path: "/new" },
    { label: t("nav.clothing"), path: "/clothing" },
    { label: t("nav.bestsellers"), path: "/bestsellers" },
    { label: t("nav.collections"), path: "/collections" },
    { label: t("nav.about"), path: "/about" },
  ];

  return (
    <Layout>
      <div className="min-h-screen px-8 pt-16 pb-32">
        <nav aria-label={t("tabs.label")}>
          <ul className="space-y-6">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={pathFor(item.path)}
                  className="font-body text-3xl font-normal hover:opacity-60 transition-opacity"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              {user ? (
                <Link
                  to={pathFor("/profile")}
                  className="font-body text-3xl font-normal hover:opacity-60 transition-opacity"
                >
                  {t("auth.myProfile")}
                </Link>
              ) : (
                <button
                  onClick={() => navigate(pathFor("/login"))}
                  className="font-body text-3xl font-normal hover:opacity-60 transition-opacity"
                >
                  {t("auth.signIn")}
                </button>
              )}
            </li>
          </ul>

          <div className="mt-10">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </Layout>
  );
};

export default CollectionsPage;

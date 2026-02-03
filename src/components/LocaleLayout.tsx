import { useEffect } from "react";
import { Outlet, useParams, Navigate } from "react-router-dom";
import i18n from "@/i18n/config";

const SUPPORTED = ["en", "ka"];

export default function LocaleLayout() {
  const { lang } = useParams<{ lang: string }>();

  useEffect(() => {
    if (lang && SUPPORTED.includes(lang)) {
      i18n.changeLanguage(lang);
      document.documentElement.lang = lang;
      localStorage.setItem("i18nextLng", lang);
    }
  }, [lang]);

  if (lang && !SUPPORTED.includes(lang)) {
    return <Navigate to="/en" replace />;
  }

  return <Outlet />;
}

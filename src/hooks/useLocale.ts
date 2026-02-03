import { useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SUPPORTED_LOCALES = ["en", "ka"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function useLocale() {
  const { lang: paramLang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const lang: Locale = useMemo(() => {
    if (paramLang && SUPPORTED_LOCALES.includes(paramLang as Locale)) {
      return paramLang as Locale;
    }
    const current = i18n.language?.split("-")[0];
    return SUPPORTED_LOCALES.includes(current as Locale) ? (current as Locale) : "en";
  }, [paramLang, i18n.language]);

  /** Path with current locale prefix. Use for all in-app links (except /admin). */
  function pathFor(path: string): string {
    if (path.startsWith("/admin")) return path;
    const clean = path === "/" ? "" : path.replace(/^\//, "");
    return `/${lang}${clean ? `/${clean}` : ""}`;
  }

  /** Switch language and navigate to same page with /en or /ka. */
  function switchLanguage(newLang: string) {
    if (!SUPPORTED_LOCALES.includes(newLang as Locale)) return;
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
    localStorage.setItem("i18nextLng", newLang);

    const pathname = location.pathname;
    const match = pathname.match(/^\/(en|ka)(\/.*|$)/);
    if (match) {
      const rest = match[2] || "";
      navigate(`/${newLang}${rest}`);
    } else if (!pathname.startsWith("/admin")) {
      navigate(`/${newLang}${pathname === "/" ? "" : pathname}`);
    }
  }

  return { lang, pathFor, switchLanguage };
}

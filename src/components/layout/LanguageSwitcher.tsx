import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";

const LanguageSwitcher = ({
  kaLabel = "KA",
  className = "text-muted-foreground",
}: {
  kaLabel?: string;
  className?: string;
}) => {
  const { i18n } = useTranslation();
  const { switchLanguage } = useLocale();
  const value = i18n.language?.split("-")[0] === "ka" ? "ka" : "en";

  return (
    <div
      className={`flex items-center gap-3 text-xs tracking-wider font-light ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => switchLanguage("en")}
        className={`transition-opacity hover:opacity-100 ${
          value === "en" ? "font-normal opacity-100" : "opacity-60"
        }`}
      >
        EN
      </button>
      <span aria-hidden>/</span>
      <button
        type="button"
        onClick={() => switchLanguage("ka")}
        className={`transition-opacity hover:opacity-100 ${
          value === "ka" ? "font-normal opacity-100" : "opacity-60"
        }`}
      >
        {kaLabel}
      </button>
    </div>
  );
};

export default LanguageSwitcher;

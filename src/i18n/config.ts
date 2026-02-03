import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en.json";
import kaTranslations from "./locales/ka.json";

// Detect language synchronously first (from localStorage or browser)
const getInitialLanguage = () => {
  // Check localStorage first
  const savedLang = localStorage.getItem("i18nextLng");
  if (savedLang && (savedLang === "en" || savedLang === "ka")) {
    return savedLang;
  }

  // Check browser language
  const browserLang = navigator.language || navigator.languages?.[0];
  if (browserLang?.startsWith("ka")) {
    return "ka";
  }

  return "en"; // Default to English
};

// Initialize i18n with initial language
const initialLang = getInitialLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    ka: { translation: kaTranslations },
  },
  lng: initialLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Update HTML lang attribute
document.documentElement.lang = initialLang;

// Detect country asynchronously and update language if needed
const detectCountryAndSetLanguage = async () => {
  // Skip if language already set in localStorage
  if (localStorage.getItem("i18nextLng")) {
    return;
  }

  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    
    if (data.country_code === "GE" && i18n.language !== "ka") {
      i18n.changeLanguage("ka");
      document.documentElement.lang = "ka";
    }
  } catch (error) {
    console.log("Could not detect country, using default language");
  }
};

// Run country detection in background
detectCountryAndSetLanguage();

export default i18n;

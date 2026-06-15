import translationENG from "@/locales/en/translation.json";
import translationAR from "@/locales/ar/translation.json";
import translationFA from "@/locales/fa/translation.json";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const resources = {
  en: { translation: translationENG },
  ar: { translation: translationAR },
  fa: { translation: translationFA },
};

const storedLanguage = localStorage.getItem("userLanguage") || "ar";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: storedLanguage, // اللغة الافتراضية
    fallbackLng: "ar",
    debug: process.env.NODE_ENV === "development",
    supportedLngs: ["en", "ar", "fa"],
    interpolation: {
      escapeValue: false, // حتى لا يعمل escape على النصوص
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18n;

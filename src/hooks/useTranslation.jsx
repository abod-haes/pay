import { useTranslation as useI18nTranslation } from "react-i18next";

// Custom hook that wraps react-i18next useTranslation
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = lng => {
    localStorage.setItem("i18nextLng", lng);
    localStorage.setItem("userLanguage", lng);

    // Update document language and direction
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === "en" ? "ltr" : "rtl";

    // Change language using i18next
    i18n.changeLanguage(lng);

    // Dispatch custom event for backward compatibility
    window.dispatchEvent(new CustomEvent("languageChanged", { detail: lng }));
  };

  return {
    t,
    i18n: {
      language: i18n.language,
      changeLanguage,
    },
  };
};

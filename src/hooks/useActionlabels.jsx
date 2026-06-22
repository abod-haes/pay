import { useTranslation } from "react-i18next";

const ACTION_LABEL_FALLBACKS = {
  assign_admin: {
    ar: "إسناد أدمن للمريض",
    en: "Assign admin to patient",
    fa: "اختصاص مدیر به بیمار",
  },
};

const useActionLabel = () => {
  const { t, i18n } = useTranslation();

  const getActionLabel = type => {
    const language = i18n.language?.split("-")[0] || "ar";
    const fallback = ACTION_LABEL_FALLBACKS[type]?.[language] || type;

    return t(`permissions.actions.${type}`, fallback);
  };

  return getActionLabel;
};

export default useActionLabel;

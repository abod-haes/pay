import { useTranslation } from "react-i18next";

const useActionLabel = () => {
  const { t } = useTranslation();

  const getActionLabel = type => {
    return t(`permissions.actions.${type}`, type);
  };

  return getActionLabel;
};

export default useActionLabel;

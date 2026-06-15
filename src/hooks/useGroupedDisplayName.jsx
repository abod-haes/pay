import { useTranslation } from "react-i18next";

const useGroupDisplayName = () => {
  const { t } = useTranslation();

  const getGroupDisplayName = groupName => {
    return t(`permissions.${groupName}`, groupName);
  };

  return getGroupDisplayName;
};

export default useGroupDisplayName;

import { ExaminationStatus } from "@/constants/constants";
import { useTranslation } from "react-i18next";

const useExaminationStatus = clickHandlers => {
  const { t } = useTranslation();
  const bookingStatus = Object.values(ExaminationStatus)?.map(item => ({
    value: item.value,
    label: t(item.label),
    onClick: clickHandlers ? clickHandlers[item.value] || (() => {}) : null,
  }));
  return { bookingStatus };
};

export default useExaminationStatus;

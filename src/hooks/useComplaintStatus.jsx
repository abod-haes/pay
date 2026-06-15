import { useTranslation } from "react-i18next";
import { ComplaintsStatus } from "@/constants/constants";

const useComplaintStatus = clickHandlers => {
  const { t } = useTranslation();
  const complaintStatus = Object.values(ComplaintsStatus)?.map(item => ({
    value: item.value,
    label: t(item.label),
    onClick: clickHandlers ? clickHandlers[item.value] || (() => {}) : null,
  }));
  return { complaintStatus };
};

export default useComplaintStatus;

import { useTranslation } from "react-i18next";
import { maintenanceStatus } from "@/constants/constants";
const useMaintenanceStatus = clickHandlers => {
  const { t } = useTranslation();
  const complaintStatus = Object.values(maintenanceStatus)?.map(item => ({
    value: item.value,
    label: t(item.label),
    onClick: clickHandlers ? clickHandlers[item.value] || (() => {}) : null,
  }));
  return { complaintStatus };
};

export default useMaintenanceStatus;

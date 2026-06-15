import { PatientStatus } from "@/constants/constants";
import { useTranslation } from "react-i18next";

const usePatientStatus = () => {
  const { t } = useTranslation();
  const patientStatus = Object.values(PatientStatus)?.map(item => ({
    value: item.value,
    label: t(item.label),
  }));
  return { patientStatus };
};

export default usePatientStatus;

import { BookingSections } from "@/constants/constants";
import { useTranslation } from "react-i18next";

const useBookingSections = () => {
  const { t } = useTranslation();
  const bookingVia = Object.values(BookingSections)?.map(item => ({
    value: item.value,
    label: t(item.label),
  }));
  return { bookingVia };
};

export default useBookingSections;

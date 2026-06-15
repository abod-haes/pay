import { BookingVia } from "@/constants/constants";
import { useTranslation } from "react-i18next";

const useBookingVia = () => {
  const { t } = useTranslation();
  const bookingVia = Object.values(BookingVia)?.map(item => ({
    value: item.value,
    label: t(item.label),
  }));
  return { bookingVia };
};

export default useBookingVia;

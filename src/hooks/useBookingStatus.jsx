import { BookingStatus } from "@/constants/constants";
import { useTranslation } from "react-i18next";

const useBookingStatus = clickHandlers => {
  const { t } = useTranslation();
  const bookingStatus = Object.values(BookingStatus)?.map(item => ({
    value: item.value,
    label: t(item.label),
    onClick: clickHandlers ? clickHandlers[item.value] || (() => {}) : null,
  }));
  return { bookingStatus };
};

export default useBookingStatus;

import { useTranslation } from "react-i18next";
import { useBookingStatusQueries } from "@/apis/booking-status/query";
import { useMemo } from "react";

const useBookingStatus = ({ onChangeId } = {}) => {
  // <-- object with default
  const { t } = useTranslation();

  const { data: queryData } = useBookingStatusQueries.GetAll({ page: 1, per_page: 1000 });
  const backendStatuses = queryData?.data || [];

  const bookingStatus = useMemo(
    () =>
      backendStatuses.map(status => ({
        id: status.id,
        value: status.type,
        name: status.name,
        color: status.color ?? "#29b4c3",
        is_default: status.is_default,
        need_permission: status.need_permission,
        permission: status.permission,
        onClick: () => onChangeId?.(status.id),
      })),
    [backendStatuses, onChangeId]
  );

  return { bookingStatus };
};

export default useBookingStatus;

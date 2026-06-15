import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({
  per_page,
  page,
  search,
  section,
  booking_via,
  service_id,
  booking_status_id,
  date,
  technician_id,
  employee_id,
}) => {
  const queryResult = useQuery({
    queryKey: [
      "get-all-hair-transplant-booking",
      per_page,
      page,
      search,
      section,
      booking_via,
      service_id,
      booking_status_id,
      date,
      service_id,
      technician_id,
      employee_id,
      technician_id,
      employee_id,
    ],
    queryFn: () =>
      apis.getAll({
        per_page,
        page,
        search,
        section,
        booking_via,
        service_id,
        booking_status_id,
        date,
        technician_id,
        employee_id,
      }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-use-hair-transplant-booking", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
    cacheTime: 0, // لا يخزن بالكاش
    staleTime: 0, // دايمًا يعتبرها قديمة
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return queryResult;
};

export const useHairTransplantQueries = {
  GetAll,
  GetOne,
};

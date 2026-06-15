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
  date_between,
  employee_id,
}) => {
  const queryResult = useQuery({
    queryKey: [
      "get-all-injections-booking",
      per_page,
      page,
      search,
      section,
      booking_via,
      service_id,
      booking_status_id,
      date,
      date_between,
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
        date_between,
        employee_id,
      }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-injections-booking", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const useInjectionsQueries = {
  GetAll,
  GetOne,
};

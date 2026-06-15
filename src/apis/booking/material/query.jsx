import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({
  per_page,
  page,
  search,
  section,
  booking_via,
  service_id,
  status,
  date,
  enable,
  whereHouseId,
}) => {
  const queryResult = useQuery({
    queryKey: [
      "get-all-material-booking",
      per_page,
      page,
      search,
      section,
      booking_via,
      service_id,
      status,
      date,
      whereHouseId,
    ],
    queryFn: () =>
      apis.getAll({
        per_page,
        page,
        search,
        section,
        booking_via,
        service_id,
        status,
        date,
        whereHouseId,
      }),
    enabled: enable,
  });
  return queryResult;
};

const GetOne = ({ id, whereHouseId }) => {
  const queryResult = useQuery({
    queryKey: ["get-material-booking", id, whereHouseId],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id, whereHouseId }),
  });
  return queryResult;
};

export const useMaterialsQueries = {
  GetAll,
  GetOne,
};

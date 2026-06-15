import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({
  per_page,
  page,
  filter,
  date_from,
  date_to,
  patient_id,
  search,
  status,
  guard_type,
}) => {
  const queryResult = useQuery({
    queryKey: [
      "get-all-complaints",
      per_page,
      page,
      filter,
      date_from,
      date_to,
      patient_id,
      search,
      status,
      guard_type,
    ],
    queryFn: () =>
      apis.getAll({
        per_page,
        page,
        filter,
        date_from,
        date_to,
        patient_id,
        search,
        status,
        guard_type,
      }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-complaints", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const useComplaintsQueries = {
  GetAll,
  GetOne,
};

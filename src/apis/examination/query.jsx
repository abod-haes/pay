import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ per_page, page, search, date, status, employee_id }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-examination", per_page, page, search, status, employee_id, date],
    queryFn: () =>
      apis.getAll({
        per_page,
        page,
        search,
        date,
        status,
        employee_id,
      }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-examination", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const useExaminationQueries = {
  GetAll,
  GetOne,
};

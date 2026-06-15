import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({
  per_page,
  page,
  full_name,
  city_id,
  type,
  job_title_id,
  department_id,
  search,
}) => {
  const queryResult = useQuery({
    queryKey: [
      "get-all-employee",
      per_page,
      page,
      full_name,
      city_id,
      type,
      job_title_id,
      department_id,
      search,
    ],
    queryFn: () =>
      apis.getAll({
        per_page,
        page,
        full_name,
        city_id,
        type,
        job_title_id,
        department_id,
        search,
      }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-employee", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const useEmployeeQueries = {
  GetAll,
  GetOne,
};

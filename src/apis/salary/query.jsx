import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ per_page, page, filter, search }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-Salaries", per_page, page, filter, search],
    queryFn: () => apis.getAll({ per_page, page, filter, search }),
  });
  return queryResult;
};

const GetAllStatistic = () => {
  const queryResult = useQuery({
    queryKey: ["get-Salaries-statistic"],
    queryFn: () => apis.getAllStatistic(),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-Salaries", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const useSalariesQueries = {
  GetAll,
  GetOne,
  GetAllStatistic,
};

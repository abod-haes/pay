import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ per_page, search, page, address, name, enabled = true }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-branches", per_page, search, page, address, name],
    enabled,
    queryFn: () => apis.getAll({ per_page, search, page, address, name }),
  });
  return queryResult;
};

const GetAllStatistic = () => {
  const queryResult = useQuery({
    queryKey: ["get-all-branches"],
    queryFn: () => apis.getAllStatistic(),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-branches", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const useBranchesQueries = {
  GetAll,
  GetOne,
  GetAllStatistic,
};

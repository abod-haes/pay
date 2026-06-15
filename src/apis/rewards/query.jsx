import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ per_page, page, search }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-rewards", per_page, page, search],
    queryFn: () => apis.getAll({ per_page, page, search }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-reward", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};
const GetByUser = ({ id, per_page, page, search }) => {
  const queryResult = useQuery({
    queryKey: ["get-user-reward", id, per_page, page, search],
    enabled: !!id && id > 0,
    queryFn: () => apis.getByUser({ id, per_page, page, search }),
  });
  return queryResult;
};
export const useRewardsQueries = {
  GetAll,
  GetOne,
  GetByUser,
};

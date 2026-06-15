import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ per_page, page, search, target, city_id }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-users", per_page, page, search, target, city_id],
    queryFn: () => apis.getAll({ per_page, page, search, target, city_id }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-user", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const useUsersQueries = {
  GetAll,
  GetOne,
};

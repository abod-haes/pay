import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ per_page, page, full_name, search }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-sponsors", per_page, page, full_name, search],
    queryFn: () =>
      apis.getAll({
        per_page,
        page,
        full_name,
        search,
      }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-sponsor", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const useSponsorsQueries = {
  GetAll,
  GetOne,
};

import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ per_page, page, search }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-jobtitles", per_page, page, search],
    queryFn: () => apis.getAll({ per_page, page, search }),
  });
  return queryResult;
};

const GetOne = ({ enabled = true, id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-jobtitles", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const jobTitleQueries = {
  GetAll,
  GetOne,
};

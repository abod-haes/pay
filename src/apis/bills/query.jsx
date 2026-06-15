import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ per_page, page, no, notes, search, vendor_id }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-bills", per_page, page, no, notes, search, vendor_id],
    queryFn: () => apis.getAll({ per_page, page, no, notes, search, vendor_id }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-bill", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const useBillQueries = {
  GetAll,
  GetOne,
};

import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ per_page, page, search }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-vendors", per_page, page, search],
    queryFn: () => apis.getAll({ per_page, page, search }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-vendor", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};
const GetAllVendors = () => {
  const queryResult = useQuery({
    queryKey: ["all-vendors-dropdown"],
    queryFn: async () => {
      const response = await apis.getAll({
        per_page: 10000,
        page: 1,
        search: null,
      });
      return response.data;
    },
  });
  return queryResult;
};

export const useVendorsQueries = {
  GetAll,
  GetOne,
  GetAllVendors,
};

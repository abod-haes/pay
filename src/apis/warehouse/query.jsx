import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ per_page, page, city_id, name, address, search }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-warehouses", per_page, page, city_id, name, address, search],
    queryFn: () => apis.getAll({ per_page, page, city_id, name, address, search }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-warehouse", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};
const GetAllWarehouses = () => {
  const queryResult = useQuery({
    queryKey: ["all-warehouse-dropdown"],
    queryFn: async () => {
      const response = await apis.getAll({
        per_page: 10000,
        page: 1,
        search: null,
        name: null,
        city_id: null,
        address: null,
      });
      return response.data;
    },
  });
  return queryResult;
};
export const useWarehouseQueries = {
  GetAll,
  GetOne,
  GetAllWarehouses,
};

import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ per_page, page, warehouse_id, unit_id, search }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-materials", per_page, page, warehouse_id, unit_id, search],
    queryFn: () => apis.getAll({ per_page, page, warehouse_id, unit_id, search }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-material", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};
const GetAllMaterials = ({ warehouse_id }) => {
  const queryResult = useQuery({
    queryKey: ["all-materials-dropdown", warehouse_id],
    queryFn: async () => {
      const response = await apis.getAll({
        per_page: 10000,
        page: 1,
        search: null,
        unit_id: null,
        warehouse_id,
      });
      return response.data;
    },
  });
  return queryResult;
};
export const useMaterialQueries = {
  GetAll,
  GetOne,
  GetAllMaterials,
};

import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ per_page, page }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-roles", per_page, page],
    queryFn: () => apis.getAll({ per_page, page }),
  });
  return queryResult;
};

const GetAllPermissions = () => {
  const queryResult = useQuery({
    queryKey: ["get-all-permission"],
    queryFn: () => apis.getPermissions(),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-role", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const useRolesQueries = {
  GetAll,
  GetOne,
  GetAllPermissions,
};

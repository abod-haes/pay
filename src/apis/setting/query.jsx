import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ domain_name }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-settings", domain_name],
    queryFn: () => apis.getAll({ domain_name }),
  });
  return queryResult;
};
export const useSettingsQueries = {
  GetAll,
};

import { useQuery } from "@tanstack/react-query";
import { AuthApis } from "./api";

const GetUserInfo = ({ enabled }) => {
  const queryResult = useQuery({ queryKey: "get-user-info", enabled, queryFn: () => AuthApis() });
  return queryResult;
};

export const useAuthQueries = {
  GetUserInfo,
};

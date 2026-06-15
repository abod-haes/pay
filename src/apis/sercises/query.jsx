import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({ type, section }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-services", type, section],
    queryFn: () => apis.getAll({ type, section }),
  });
  return queryResult;
};
const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-service", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const useServicesQueries = {
  GetAll,
  GetOne,
};

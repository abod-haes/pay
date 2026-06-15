import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAllStates = () => {
  const queryResult = useQuery({
    queryKey: ["get-all-states"],
    queryFn: () => apis.getAllStates(),
  });
  return queryResult;
};

const GetAllCities = ({ state_id }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-cities", state_id],
    queryFn: () => apis.getAllCities({ state_id }),
    // enabled: !!state_id && state_id > 0,
  });
  return queryResult;
};

export const useAddressQueries = {
  GetAllStates,
  GetAllCities,
};

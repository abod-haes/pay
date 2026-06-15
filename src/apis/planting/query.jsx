import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = () => {
  const queryResult = useQuery({
    queryKey: ["get-all-planting"],
    queryFn: () => apis.getAll(),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-planting", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

export const usePlantingQueries = {
  GetAll,
  GetOne,
};

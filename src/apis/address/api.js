import ApiInstance from "@/constants/api-instance";
import { ROUTES } from "./routes";

const getAllStates = async () => {
  const { data } = await ApiInstance.get(ROUTES.GET_STATES);
  return data;
};

const getAllCities = async ({ state_id }) => {
  const { data } = await ApiInstance.get(
    state_id ? `${ROUTES.GET_STATES}/cities/${state_id}` : `${ROUTES.GET_STATES}/cities`
  );
  return data;
};

export const apis = { getAllStates, getAllCities };

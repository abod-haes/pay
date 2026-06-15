import ApiInstance from "@/constants/api-instance";
import { ROUTES } from "./routes";

const getAll = async ({ domain_name }) => {
  const params = {
    domain_name,
  };
  const { data } = await ApiInstance.get(ROUTES.GET, { params: { ...params } });
  return data;
};
const update = async ({ payload }) => {
  const { data } = await ApiInstance.put(`${ROUTES.GET}`, payload);
  return { data };
};
export const apis = { getAll, update };

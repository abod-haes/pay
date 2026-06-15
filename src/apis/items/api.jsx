import ApiInstance from "@/constants/api-instance";
import { ROUTES } from "./routes";

const getAll = async ({ per_page, page, warehouse_id, unit_id, search }) => {
  const params = {
    "filter[warehouse_id]": warehouse_id?.value,
    "filter[unit_id]": unit_id?.value,
    "filter[search]": search,
  };
  const { data } = await ApiInstance.get(ROUTES.GET, { params: { per_page, page, ...params } });
  return data;
};

const getOne = async ({ id }) => {
  const { data } = await ApiInstance.get(`${ROUTES.GET}/${id}`);
  return data;
};

const add = async ({ payload }) => {
  const { data } = await ApiInstance.post(`${ROUTES.GET}`, payload);
  return { data };
};

const update = async ({ id, payload }) => {
  const { data } = await ApiInstance.put(`${ROUTES.GET}/${id}`, payload);
  return { data };
};

const deleteApi = async ({ id, payload }) => {
  const { data } = await ApiInstance.delete(`${ROUTES.GET}/${id}`, payload);
  return { data };
};

export const apis = { getAll, getOne, deleteApi, add, update };

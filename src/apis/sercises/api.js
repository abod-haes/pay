import ApiInstance from "@/constants/api-instance";
import { ROUTES } from "./routes";

const getAll = async ({ type, section }) => {
  const params = {
    "filter[type]": type || null,
    "filter[section]": section || null,
  };
  const { data } = await ApiInstance.get(ROUTES.GET, { params: { ...params } });
  return data;
};
const getOne = async ({ id }) => {
  const { data } = await ApiInstance.get(`${ROUTES.GET}/${id}`);
  return { data };
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

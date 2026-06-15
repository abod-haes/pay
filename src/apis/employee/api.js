import ApiInstance from "@/constants/api-instance";
import { ROUTES } from "./routes";

const getAll = async ({
  per_page,
  page,
  full_name,
  city_id,
  type,
  job_title_id,
  department_id,
  search,
}) => {
  const params = {
    "filter[full_name]": full_name,
    "filter[type]": type,
    "filter[city_id]": city_id?.value,
    "filter[job_title_id]": job_title_id?.value,
    "filter[department_id]": department_id?.value,
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
const changePassword = async ({ id, payload }) => {
  const { data } = await ApiInstance.post(`${ROUTES.GET}/change-password/${id}`, payload);
  return { data };
};
export const apis = { getAll, getOne, deleteApi, add, update, changePassword };

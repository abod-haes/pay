import ApiInstance from "@/constants/api-instance";
import { ROUTES } from "./routes";

const getAll = async ({
  page,
  per_page,
  filter,
  date_from,
  date_to,
  patient_id,
  search,
  status,
  guard_type,
}) => {
  const params = {
    "filter[date_from]": date_from,
    "filter[date_to]": date_to,
    "filter[patient_id]": patient_id?.value,
    "filter[search]": search,
    "filter[status]": status,
    "filter[guard_type]": guard_type,
  };
  const { data } = await ApiInstance.get(ROUTES.GET, {
    params: { per_page, page, filter, ...params },
  });
  return data;
};

const getAllStatistic = async () => {
  const { data } = await ApiInstance.get(`${ROUTES.GET}/statistics`);
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
const cancel = async ({ id, cancel_reason }) => {
  const { data } = await ApiInstance.post(`${ROUTES.GET}/${id}/cancel`, { cancel_reason });
  return { data };
};
const changeStatus = async ({ id, status }) => {
  const { data } = await ApiInstance.patch(`${ROUTES.GET}/${id}/status`, { status });
  return { data };
};

export const apis = {
  getAll,
  getOne,
  deleteApi,
  add,
  update,
  getAllStatistic,
  cancel,
  changeStatus,
};

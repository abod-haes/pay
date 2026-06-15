import ApiInstance from "@/constants/api-instance";
import { ROUTES } from "./routes";

const getAll = async ({ per_page, page, search, date, status, employee_id }) => {
  const params = {
    "filter[search]": search,
    "filter[date]": date,
    "filter[status]": status,
    "filter[employee_id]": employee_id,
  };
  const { data } = await ApiInstance.get(ROUTES.GET, { params: { per_page, page, ...params } });
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
  const { data } = await ApiInstance.patch(`${ROUTES.GET}/${id}`, payload);
  return { data };
};

const changeStatus = async ({ id, status, cancel_reason }) => {
  const { data } = await ApiInstance.patch(`${ROUTES.GET}/${id}/change-status`, {
    status,
    cancel_reason,
  });
  return { data };
};

const assignDoctor = async ({ id, doctor_id }) => {
  const { data } = await ApiInstance.patch(`${ROUTES.GET}/${id}/assign-doctor`, {
    doctor_id: doctor_id,
  });
  return { data };
};

const deleteApi = async ({ id, payload }) => {
  const { data } = await ApiInstance.delete(`${ROUTES.GET}/${id}`, payload);
  return { data };
};

export const apis = {
  getAll,
  getOne,
  deleteApi,
  add,
  update,

  changeStatus,
  assignDoctor,
};

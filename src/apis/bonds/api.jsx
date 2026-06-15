import ApiInstance from "@/constants/api-instance";
import { ROUTES } from "./routes";

const getAll = async ({
  per_page,
  page,
  type,
  cashier_id,
  date_from,
  date_to,
  search,
  financier_id,
  employee_id,
  patient_id,
}) => {
  const params = {
    "filter[bond_group]": type?.value,
    "filter[date_from]": date_from ? date_from : null,
    "filter[date_to]": date_to ? date_to : null,
    "filter[cashier_id]": cashier_id?.value,
    "filter[search]": search || null,
    "filter[financier_id]": financier_id?.value || null,
    "filter[user_id]": employee_id?.value || null,
    "filter[patient_id]": patient_id?.value || null,
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
const getNo = async ({ type, bond_group }) => {
  const { data } = await ApiInstance.get(`${ROUTES.GET}/get/next-no`, {
    params: { type, bond_group },
  });
  return data;
};
const approve = async ({ id }) => {
  const { data } = await ApiInstance.patch(`${ROUTES.GET}/${id}/approve`);
  return { data };
};

const payQiCard = async ({ id, date }) => {
  const { data } = await ApiInstance.patch(`${ROUTES.GET}/${id}/pay`, { date });
  return { data };
};

export const apis = { getAll, getOne, deleteApi, add, update, getNo, approve, payQiCard };

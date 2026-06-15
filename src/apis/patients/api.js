import ApiInstance from "@/constants/api-instance";
import { ROUTES } from "./routes";

const getAll = async ({
  per_page,
  page,
  search,
  target,
  city_id,
  available,
  gender,
  register_date,
  birth_date,
  employee_id,
  reason_id,
}) => {
  const params = {
    "filter[search]": search,
    "filter[target]": target,
    "filter[city_id]": city_id?.value,
    "filter[available]": available,
    "filter[gender]": gender,
    "filter[register_date]": register_date,
    "filter[birth_date]": birth_date,
    "filter[employee_id]": employee_id?.value,
    "filter[reason_id]": reason_id?.value,
  };
  const { data } = await ApiInstance.get(ROUTES.GET, { params: { per_page, page, ...params } });
  return data;
};

const getOne = async ({ id }) => {
  const { data } = await ApiInstance.get(`${ROUTES.GET}/${id}`);
  return { data };
};

const getUnPaidPatientOne = async ({ PaitientId }) => {
  const { data } = await ApiInstance.get(`${ROUTES.GET}/${PaitientId}/unpaid-bookings`);
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

const exportToExcel = async () => {
  const response = await ApiInstance.get(`${ROUTES.GET}/export`, {
    responseType: "blob", // مهم جداً
  });

  return response;
};

const deleteApi = async ({ id, payload }) => {
  const { data } = await ApiInstance.delete(`${ROUTES.GET}/${id}`, payload);
  return { data };
};

const addReasonForNotBooking = async ({ id, payload }) => {
  const { data } = await ApiInstance.post(`${ROUTES.GET}/${id}/assign-reason`, payload);
  return { data };
};

export const apis = {
  getAll,
  getOne,
  deleteApi,
  add,
  update,
  addReasonForNotBooking,
  getUnPaidPatientOne,
  exportToExcel,
};

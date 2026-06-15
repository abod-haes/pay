import ApiInstance from "@/constants/api-instance";
import { ROUTES } from "./routes";

const getAll = async ({
  per_page,
  page,
  section,
  search,
  booking_via,
  service_id,
  booking_status_id,
  date,
  technician_id,
  employee_id,
}) => {
  const params = {
    "filter[search]": search,
    "filter[section]": section,
    "filter[booking_via]": booking_via,
    "filter[service_id]": service_id,
    "filter[booking_status_id]": booking_status_id,
    "filter[date]": date,
    "filter[technician_id]": technician_id,
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
const changeOperation = async ({ id, payload }) => {
  const { data } = await ApiInstance.patch(`${ROUTES.GET}/${id}/operation`, payload);
  return { data };
};

const changeStatus = async ({ id, booking_type, cancel_reason, booking_status_id }) => {
  const { data } = await ApiInstance.patch(`${ROUTES.GET}/${id}/status`, {
    booking_type: booking_type,
    cancel_reason,
    booking_status_id,
  });
  return { data };
};

const approve = async ({ id }) => {
  const { data } = await ApiInstance.patch(`${ROUTES.GET}/${id}/approve`);
  return { data };
};
const assignDoctor = async ({ id, doctor_id }) => {
  const { data } = await ApiInstance.patch(`${ROUTES.GET}/${id}/assign-doctor`, {
    doctor_id: doctor_id,
  });
  return { data };
};
const assignTechnician = async ({ id, technician_id, assistant_id }) => {
  const { data } = await ApiInstance.patch(`${ROUTES.GET}/${id}/assign-technician`, {
    technician_id: technician_id,
    assistant_id: assistant_id,
  });
  return { data };
};
const cancel = async ({ id, cancel_reason }) => {
  const { data } = await ApiInstance.patch(`${ROUTES.GET}/${id}/cancel`, { cancel_reason });
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
  approve,
  cancel,
  changeStatus,
  changeOperation,
  assignDoctor,
  assignTechnician,
};

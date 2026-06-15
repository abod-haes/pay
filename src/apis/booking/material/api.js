import ApiInstance from "@/constants/api-instance";
import { ROUTES } from "./routes";

const getAll = async ({
  per_page,
  page,
  section,
  search,
  booking_via,
  service_id,
  status,
  date,
  whereHouseId,
}) => {
  const params = {
    "filter[search]": search,
    "filter[section]": section,
    "filter[booking_via]": booking_via,
    "filter[service_id]": service_id,
    "filter[status]": status,
    "filter[date]": date,
    "filter[warehouse_id]": whereHouseId,
  };
  const { data } = await ApiInstance.get(`${ROUTES.GET}`, {
    params: { per_page, page, ...params },
  });
  return data;
};

const getOne = async ({ id }) => {
  const { data } = await ApiInstance.get(`bookings${ROUTES.GET}/${id}`);
  return { data };
};

const add = async ({ payload, id }) => {
  const { data } = await ApiInstance.post(`bookings/${id}${ROUTES.GET}`, payload);
  return { data };
};

const update = async ({ id, payload, materialId }) => {
  const { data } = await ApiInstance.patch(`bookings/${id}${ROUTES.GET}/${materialId}`, payload);
  return { data };
};
const complete = async ({ id, payload, bookId }) => {
  const { data } = await ApiInstance.patch(
    `bookings/${bookId}${ROUTES.GET}/${id}/complete`,
    payload
  );
  return { data };
};

const deleteApi = async ({ id, payload, bookId }) => {
  const { data } = await ApiInstance.delete(`/bookings/${bookId}${ROUTES.GET}/${id}`, payload);
  return { data };
};

export const apis = { getAll, getOne, deleteApi, add, update, complete };

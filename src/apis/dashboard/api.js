import ApiInstance from "@/constants/api-instance";
import { ROUTES } from "./routes";

const getSecular = async ({ date }) => {
  const { data } = await ApiInstance.get(`${ROUTES.GET}/scheduled-surgeries`, { params: { date } });
  return data;
};

const getBookingsStats = async ({ type, value }) => {
  const { data } = await ApiInstance.get(`${ROUTES.GET}/bookings-stats`, {
    params: { type, value },
  });
  return data;
};

const getServicesStats = async ({ type, value }) => {
  const { data } = await ApiInstance.get(`${ROUTES.GET}/services-stats`, {
    params: { type, value },
  });
  return data;
};

const getBookingsByDate = async ({ year, month, date }) => {
  const params = date ? { date } : { year, month };
  const { data } = await ApiInstance.get(`${ROUTES.GET}/bookings-by-date`, { params });
  return data;
};

const getSummary = async () => {
  const { data } = await ApiInstance.get(`${ROUTES.GET}/summary`);
  return data;
};

const getProfits = async () => {
  const { data } = await ApiInstance.get(`${ROUTES.GET}/profits`);
  return data;
};

const getPatients = async () => {
  const { data } = await ApiInstance.get(`${ROUTES.GET}/patients`);
  return data;
};

export const apis = {
  getSecular,
  getSummary,
  getProfits,
  getPatients,
  getBookingsStats,
  getServicesStats,
  getBookingsByDate,
};

import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAllSecular = ({ date }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-scheduled-surgeries", date],
    queryFn: () => apis.getSecular({ date }),
  });
  return queryResult;
};

const GetSummary = () => {
  const queryResult = useQuery({
    queryKey: ["get-all-summary"],
    queryFn: () => apis.getSummary(),
  });
  return queryResult;
};

const GetPatients = () => {
  const queryResult = useQuery({
    queryKey: ["get-all-patients"],
    queryFn: () => apis.getPatients(),
  });
  return queryResult;
};

const GetProfits = () => {
  const queryResult = useQuery({
    queryKey: ["get-all-GetProfits"],
    queryFn: () => apis.getProfits(),
  });
  return queryResult;
};

const GetBookingsStats = ({ type, value }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-bookings-stats", type, value],
    queryFn: () => apis.getBookingsStats({ type, value }),
  });
  return queryResult;
};

const GetServicesStats = ({ type, value }) => {
  const queryResult = useQuery({
    queryKey: ["get-all-services-stats", type, value],
    queryFn: () => apis.getServicesStats({ type, value }),
  });
  return queryResult;
};

const GetEarliestBooking = ({ year, month, enabled = true }) => {
  const queryResult = useQuery({
    queryKey: ["get-dashboard-earliest-bookings", year, month],
    queryFn: () => apis.getEarliestBooking({ year, month }),
    enabled,
  });
  return queryResult;
};

const GetBookingsByDate = ({ date, enabled = true }) => {
  const queryResult = useQuery({
    queryKey: ["get-dashboard-bookings-by-date", date],
    queryFn: () => apis.getBookingsByDate({ date }),
    enabled,
  });
  return queryResult;
};

export const useDashboardQueries = {
  GetAllSecular,
  GetSummary,
  GetPatients,
  GetProfits,
  GetBookingsStats,
  GetServicesStats,
  GetEarliestBooking,
  GetBookingsByDate,
};

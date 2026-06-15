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

const GetBookingsByDate = ({ year, month, date, enabled = true }) => {
  const queryResult = useQuery({
    queryKey: ["get-dashboard-bookings-by-date", year, month, date],
    queryFn: () => apis.getBookingsByDate({ year, month, date }),
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
  GetBookingsByDate,
};

import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({
  per_page,
  page,
  search,
  section,
  booking_via,
  service_id,
  booking_status_id,
  date,
  employee_id,
  technician_id,
  patient_id,
  delayed_api = false,
}) => {
  const queryResult = useQuery({
    queryKey: [
      "get-all-general-booking",
      per_page,
      page,
      search,
      section,
      booking_via,
      service_id,
      booking_status_id,
      date,
      employee_id,
      technician_id,
      patient_id,
      delayed_api,
    ],
    queryFn: () =>
      apis.getAll({
        per_page,
        page,
        search,
        section,
        booking_via,
        service_id,
        booking_status_id,
        date,
        employee_id,
        technician_id,
        patient_id,
        delayed_api,
      }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-general-booking", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};

const GetAvailableSlot = ({ technician_id, date, booing_id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-general-booking", date, technician_id, booing_id],
    enabled: !!technician_id && technician_id > 0,
    queryFn: () => apis.geteAvailableSlots({ date, technician_id, booing_id }),
  });
  return queryResult;
};

export const useGeneralBookingQueries = {
  GetAll,
  GetOne,
  GetAvailableSlot,
};

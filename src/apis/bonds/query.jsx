import { useQuery } from "@tanstack/react-query";
import { apis } from "./api";

const GetAll = ({
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
  const queryResult = useQuery({
    queryKey: [
      "get-all-bonds",
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
    ],
    queryFn: () =>
      apis.getAll({
        per_page,
        page,
        type,
        cashier_id,
        date_from,
        date_to,
        search,
        employee_id,
        patient_id,
        financier_id,
      }),
  });
  return queryResult;
};

const GetOne = ({ id }) => {
  const queryResult = useQuery({
    queryKey: ["get-one-bond", id],
    enabled: !!id && id > 0,
    queryFn: () => apis.getOne({ id }),
  });
  return queryResult;
};
const GetNo = ({ type, bond_group }) => {
  const queryResult = useQuery({
    queryKey: ["get-no-bonds", type, bond_group],
    queryFn: () => apis.getNo({ type, bond_group }),
    enabled: !!type || !!bond_group,
  });
  return queryResult;
};

export const useBondsQueries = {
  GetAll,
  GetOne,
  GetNo,
};

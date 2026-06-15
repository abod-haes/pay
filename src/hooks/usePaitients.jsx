import { usePatientsQueries } from "@/apis/patients/query";

const usePatients = ({ available = false }) => {
  const { data, isLoading } = usePatientsQueries.GetAll({
    page: 1,
    per_page: 1000,
    available: available,
  });
  const mappedArray = data?.data?.map(item => ({
    label: item.full_name,
    value: item.id,
    ...item,
  }));
  return { isLoadingPatients: isLoading, items: mappedArray };
};

export default usePatients;

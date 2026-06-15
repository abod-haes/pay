import { useEmployeeQueries } from "@/apis/employee/query";

const useEmployees = ({ type }) => {
  const { data, isLoading } = useEmployeeQueries.GetAll({ type, page: 1, per_page: 1000 });
  const mappedArray = data?.data?.map(item => ({
    label: item.full_name,
    value: item.id,
  }));
  return { isLoadingEmployees: isLoading, items: mappedArray };
};

export default useEmployees;

import { useWarehouseQueries } from "@/apis/warehouse/query";

const useWhereHouse = () => {
  const { data, isLoading } = useWarehouseQueries.GetAll({});
  const mappedArray = data?.data?.map(item => ({
    label: item.name,
    value: item.id,
  }));
  return { isLoadingEmployees: isLoading, items: mappedArray };
};

export default useWhereHouse;

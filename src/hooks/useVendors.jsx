import { useVendorsQueries } from "@/apis/vendors/query";
const useVendors = () => {
  const { data, isLoading } = useVendorsQueries.GetAllVendors();
  const mappedArray = data?.map(item => ({
    label: item.full_name,
    value: item.id,
  }));
  return { isLoadingEmployees: isLoading, items: mappedArray };
};

export default useVendors;

import { useAddressQueries } from "@/apis/address/query";

const useStates = () => {
  const { data, isLoading } = useAddressQueries.GetAllStates();
  const mappedArray = data?.data?.map(item => ({
    label: item.name,
    value: item.id,
  }));
  return { isLoadingStates: isLoading, items: mappedArray };
};

export default useStates;

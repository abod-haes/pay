import { useAddressQueries } from "@/apis/address/query";

const useCities = ({ state_id }) => {
  const { data, isLoading } = useAddressQueries.GetAllCities({ state_id });
  const mappedArray = data?.data?.map(item => ({
    label: item.name,
    value: item.id,
  }));
  return { isLoadingCities: isLoading, items: mappedArray };
};

export default useCities;

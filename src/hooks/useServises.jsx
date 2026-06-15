import { useServicesQueries } from "@/apis/sercises/query";

const useServices = ({ type, section }) => {
  const { data, isLoading } = useServicesQueries.GetAll({ type, section });
  const mappedArray = data?.data?.map(item => ({
    label: item.name,
    value: item.id,
    total: item.total,
    type: item.type,
  }));
  return { isLoadingServices: isLoading, services: mappedArray };
};

export default useServices;

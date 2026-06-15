import { useSponsorsQueries } from "@/apis/sponsors/query";

const useFinencar = () => {
  const { data, isLoading } = useSponsorsQueries.GetAll({ page: 1, per_page: 1000 });
  const mappedArray = data?.data?.map(item => ({
    label: item.full_name,
    value: item.id,
  }));
  return { isLoadingFinencar: isLoading, items: mappedArray };
};

export default useFinencar;

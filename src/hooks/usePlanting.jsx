import { usePlantingQueries } from "@/apis/planting/query";

const usePlanting = ({ state_id }) => {
  const { data, isLoading } = usePlantingQueries.GetAll({ state_id });
  const mappedArray = data?.data?.map(item => ({
    label: item.name,
    value: item.id,
  }));
  return { isLoadingPlanting: isLoading, plantingItems: mappedArray };
};

export default usePlanting;

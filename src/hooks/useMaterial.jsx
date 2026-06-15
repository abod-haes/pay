import { useMaterialsQueries } from "@/apis/booking/material/query";

const useMaterials = ({ enable, whereHouseId }) => {
  const { data, isLoading } = useMaterialsQueries.GetAll({ enable, whereHouseId });
  const mappedArray = data?.data?.map(item => ({
    label: item.name,
    value: item.id,
    ...item,
  }));
  return { isLoadingEmployees: isLoading, items: mappedArray };
};

export default useMaterials;

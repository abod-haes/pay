import { useBookingStatusQueries } from "@/apis/booking-status/query";

const useGetBookingStatus = () => {
  const { data, isLoading } = useBookingStatusQueries.GetAll({ page: 1, per_page: 1000 });
  const mappedArray = data?.data?.map(item => ({
    label: item.name,
    value: item.id,
  }));
  return { isLoadingCities: isLoading, items: mappedArray };
};

export default useGetBookingStatus;

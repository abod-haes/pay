import { BondPermissionsMap, BondTypes } from "@/constants/constants";
import { useTranslation } from "@hooks/useTranslation";

const useBookingBondTypes = () => {
  const { t } = useTranslation();

  const bookingBondTypes = Object.values(BondTypes).map(item => ({
    value: item.value,
    label: t(item.label),
    permission: BondPermissionsMap[item.value],
  }));

  return { bookingBondTypes };
};

export default useBookingBondTypes;

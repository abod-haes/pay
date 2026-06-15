import Card from "@/components/card";
import TitleOfSections from "@/components/surgeries/titleOfSections";
import { useTranslation } from "react-i18next";
import CalenderWIthSlot from "@/components/calenderWithSlot";

const DateAndTime = ({
  watch,
  dataToReset,
  isSelected,
  setIsSelected,
  selectDate,
  setSelectedDate,
}) => {
  const { t } = useTranslation();
  return (
    <div className="grid gap-[16px]">
      <TitleOfSections title={t("common.date-and-time")} />
      <Card otherStyle={"grid gap-[16px] !py-8"}>
        <CalenderWIthSlot
          isSelected={isSelected}
          setIsSelected={setIsSelected}
          technician_id={watch("technician_id")?.value}
          value={dataToReset?.date?.split(" ")[0]}
          booing_id={dataToReset?.id}
          selectDate={selectDate}
          setSelectedDate={setSelectedDate}
        />
      </Card>
    </div>
  );
};

export default DateAndTime;

import SlotList from "./slotsSections";
import Calender from "@/components/shared/calender";
import { useTranslation } from "react-i18next";
import { useSettingsQueries } from "@/apis/setting/query";
import { useLocation } from "react-router-dom";
import React, { useMemo } from "react";
const generateSlots = (start, end, interval = 30) => {
  const slots = [];
  const startDate = new Date(`1970-01-01T${start}`);
  const endDate = new Date(`1970-01-01T${end}`);

  while (startDate <= endDate) {
    const hours = String(startDate.getHours()).padStart(2, "0");
    const minutes = String(startDate.getMinutes()).padStart(2, "0");

    slots.push(`${hours}:${minutes}`);
    startDate.setMinutes(startDate.getMinutes() + interval);
  }

  return slots;
};
const CalenderWIthSlot = ({ isSelected, setIsSelected, selectDate, setSelectedDate }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const domain = location.state?.domain || window.location.hostname;
  const { data, isLoading } = useSettingsQueries.GetAll({ domain_name: domain });

  const workStart = data?.data?.work_start_time;
  const workEnd = data?.data?.work_end_time;

  const slots = useMemo(() => {
    if (!workStart || !workEnd) return [];
    return generateSlots(workStart, workEnd, 30);
  }, [workStart, workEnd]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-[320px] relative">
        <Calender
          minDate={new Date(Date.now())}
          value={selectDate}
          onChange={date => setSelectedDate(date)}
        />
      </div>

      <SlotList
        isLoading={isLoading}
        isSelected={isSelected}
        setIsSelected={setIsSelected}
        data={slots}
      />
    </div>
  );
};

export default CalenderWIthSlot;

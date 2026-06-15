// SlotList.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import LoadingSection from "@/components/loadingSection";
import { formatTimeToSHow } from "@/utils/helpers";

const SlotList = ({ isLoading, data = [], isSelected, setIsSelected }) => {
  const { i18n, t } = useTranslation();
  if (isLoading) {
    return (
      <ul className="w-full md:w-[25%] h-[300px] overflow-y-auto grid gap-2 hide-scrollbar">
        <div className="flex items-center h-full w-full relative">
          <LoadingSection isLoading={true} otherStyle="!w-full !h-full" />
        </div>
      </ul>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ul className="w-full md:w-[25%] h-[300px] overflow-y-auto grid gap-2 hide-scrollbar">
        <div className="flex items-center justify-center h-full w-full text-accent font-normal">
          {t("common.noData")}
        </div>
      </ul>
    );
  }

  return (
    <ul className="w-full md:w-[25%] max-h-[300px] overflow-y-auto flex flex-col gap-2 hide-scrollbar">
      {data.map(item => (
        <li
          key={item}
          onClick={() => setIsSelected(item)}
          className={`border h-[40px] px-[29px] py-[6px] rounded-[100px] flex hover:bg-primary transition-all duration-500 cursor-pointer items-center justify-center font-semibold text-[0.75rem] border-accent ${
            isSelected === item ? "bg-primary text-white" : "border-accent text-accent"
          }`}
        >
          {formatTimeToSHow(item, i18n)}
        </li>
      ))}
    </ul>
  );
};

export default SlotList;

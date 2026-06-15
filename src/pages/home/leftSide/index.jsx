/* eslint-disable complexity */
import React, { useState } from "react";
import add from "@assets/svgs/homepage/add-square.svg";
import { useTranslation } from "react-i18next";
import BorderedButton from "@/components/shared/borderedButton";
import Calender from "@/components/shared/calender";
import { useNavigate } from "react-router-dom";
import useServices from "@/hooks/useServises";
import MenuButton from "@/components/menuButton";
import { useDashboardQueries } from "@/apis/dashboard/query";
import { formatTime, formatTimeToSHow } from "@/utils/helpers";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
const InfoCard = ({ patient, end, start, tecsh }) => {
  const { i18n } = useTranslation();

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <p className="font-main text-[#333333] text-[0.75rem] font-bold">{patient}</p>
          <p className="font-main text-[0.75rem] text-accent">{tecsh}</p>
        </div>
        <p className="font-main text-accent text-[0.75rem]">
          {formatTimeToSHow(start, i18n)}- {formatTimeToSHow(end, i18n)}
        </p>
      </div>
      <hr className="text-gray" />
    </>
  );
};

export default function LeftSide() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date(Date.now()));
  const { data } = useDashboardQueries.GetAllSecular({ date });

  const { services } = useServices({});
  const items = services?.filter(item => item.type !== "other");

  const formatDate = dateString => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex flex-col gap-4 bg-white px-4 py-4 md:w-[320px]">
      <div className="mb-5">
        {" "}
        <Calender onChange={e => setDate(e)} />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <p className="font-main text-[#333333] text-[0.75rem]">{t("home.surgical")}</p>
          <p className="font-main text-[0.675rem] text-accent">{formatDate(date)}</p>
        </div>
        <Can group={PERMISSION_GROUP.HairTransplant} type={PERMISSION_ACTION.create}>
          <MenuButton
            items={items}
            customText={<img src={add} alt="add" className="w-[24px] h-[24px] cursor-pointer" />}
            onItemClick={item => {
              if (item.type.includes("eyebrow_transplant")) {
                navigate("/surgeries/operation-bookings/eyebrow-transplant/add");
              } else {
                navigate("/surgeries/operation-bookings/hair-transplant/add");
              }
            }}
          />
        </Can>
      </div>
      {data?.data?.length > 0 &&
        data?.data.map(item => (
          <InfoCard
            end={item?.end}
            patient={item?.patient?.full_name}
            start={item?.start}
            tecsh={item?.technician_name?.full_name}
            key={item.id}
          />
        ))}

      {data?.data?.length === 0 && (
        <p className="h-[50px] flex items-center justify-center">{t("common.noData")}</p>
      )}
      <div className="h-[36px] flex justify-between w-full">
        <Can group={PERMISSION_GROUP.HairTransplant} type={PERMISSION_ACTION.index}>
          <BorderedButton
            text={t("home.scheduled")}
            textColor={"text-primary"}
            border={"border border-primary"}
            otherStyle={"w-full text-[0.75rem]"}
            onClick={() => navigate("/surgeries/operation-bookings")}
          />
        </Can>
      </div>
    </div>
  );
}

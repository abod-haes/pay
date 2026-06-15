/* eslint-disable complexity */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable comma-dangle */
import React from "react";
import SmallCard from "@/components/smallCard";
import calendar from "@/assets/svgs/homepage/calendar.svg";
import money from "@assets/svgs/homepage/moneys.svg";
import user from "@assets/svgs/hair-care/user-square.svg";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Statistics from "./statistics";
import LeftSide from "./leftSide";
import Booking from "../booking/reservation-patients";
import { useDashboardQueries } from "@/apis/dashboard/query";
import PrimaryButton from "@/components/shared/primaryButton";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import BookingsAgenda from "./bookingsAgenda";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: summary } = useDashboardQueries.GetSummary();

  const summaryData = summary?.data;

  return (
    <div className="flex md:flex-row flex-col gap-4 justify-between">
      <div className="flex flex-col gap-4 py-4 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-main text-[1.25rem] text-[#333333]">{t("sidebar.home")}</p>
          <Can group={PERMISSION_GROUP.Patient} type={PERMISSION_ACTION.create}>
            <PrimaryButton text="إضافة مريض" onClick={() => navigate("/patient/add")} />
          </Can>
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
          <div className="flex flex-col col-span-2 gap-4">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <SmallCard
                icon={calendar}
                title={t("home.reservations")}
                text={summaryData?.total_bookings}
              />
              <SmallCard
                icon={calendar}
                title={t("salary.process")}
                text={summaryData?.total_hair_transplant_bookings}
              />
              <SmallCard icon={money} title={t("home.profit")} text={summaryData?.profit} />
              <SmallCard
                icon={user}
                title={t("hair.total-count")}
                text={summaryData?.total_patients}
              />
            </div>

            <BookingsAgenda />
          </div>
          <Statistics />
        </div>
        <Booking hideFilter hideTitle hideSearch customTitle={t("date")} />
      </div>
      <LeftSide />
    </div>
  );
};

export default Home;

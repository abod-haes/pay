/* eslint-disable complexity */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable comma-dangle */
import React from "react";
import SmallCard from "@/components/smallCard";
import calendar from "@/assets/svgs/homepage/calendar.svg";
import money from "@assets/svgs/homepage/moneys.svg";
import user from "@assets/svgs/hair-care/user-square.svg";
import Card from "@/components/card";
import { useTranslation } from "react-i18next";
import Statistics from "./statistics";
import LeftSide from "./leftSide";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

import { Bar } from "react-chartjs-2";
import Booking from "../booking/reservation-patients";
import { useDashboardQueries } from "@/apis/dashboard/query";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);
const Home = () => {
  const { t } = useTranslation();
  const { data: summary } = useDashboardQueries.GetSummary();

  const summaryData = summary?.data;

  // eslint-disable-next-line no-unused-vars
  const dataa = [
    {
      id: 1,
      name: "سيد كريم",
      department: "الزراعة",
      service: "زراعة شعر",

      date: "15/7/2025   14:00 م",
      reserve: "مباشر",
      statue: "انتظار",
    },
    {
      id: 2,
      name: "سيد دعيج",
      department: "الزراعة",
      service: "زراعة شعر",

      date: "15/7/2025   14:00 م",
      reserve: "مباشر",
      statue: "انتظار",
    },
    {
      id: 3,
      name: "سيد فتحي",
      department: "الزراعة",
      service: "زراعة شعر",

      date: "15/7/2025   14:00 م",
      reserve: "مباشر",
      statue: "انتظار",
    },
    {
      id: 4,
      name: "أحمد محمد",
      department: "الزراعة",
      service: "زراعة شعر",

      date: "15/7/2025   14:00 م",
      reserve: "مباشر",
      statue: "انتظار",
    },
    {
      id: 5,
      name: "فاطمة علي",
      department: "الزراعة",
      service: "زراعة شعر",

      date: "15/7/2025   14:00 م",
      reserve: "مباشر",
      statue: "انتظار",
    },
  ];

  const { data: profits } = useDashboardQueries.GetProfits();

  const dataFromApi = profits;

  const data = {
    labels: dataFromApi?.data?.map(item => item.month),
    datasets: [
      {
        label: t("common.income"),
        data: dataFromApi?.data?.map(item => item.income),
        borderColor: "#29b4c3",
        backgroundColor: "#29b4c3",
        tension: 0.3,
      },
      {
        label: t("common.expenses"),
        data: dataFromApi?.data?.map(item => Number(item.expenses)),
        borderColor: "#C3292C",
        backgroundColor: "#C3292C",
        tension: 0.3,
      },
      {
        label: t("common.profit"),
        data: dataFromApi?.data?.map(item => item.profit),
        borderColor: "#8E8E8E",
        borderDash: [6, 6],
        backgroundColor: "#8E8E8E",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // hide Chart.js legend
      },
    },
    scales: {
      x: {
        reverse: true,
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "Noto Kufi Arabic, sans-serif",
            size: 12,
          },
        },
      },
      y: {
        position: "right",
        beginAtZero: true,
        ticks: {
          stepSize: 100,
          font: {
            family: "Noto Kufi Arabic, sans-serif",
            size: 12,
          },
        },
        grid: {
          color: "#E5E5E5",
          drawTicks: false,
        },
      },
    },
  };

  const { data: paitientsData } = useDashboardQueries.GetPatients();

  const apiResult = paitientsData;

  const genderData = {
    labels: apiResult?.result?.map(item => item.month), // أسماء الأشهر
    datasets: [
      {
        label: t("home.men"),
        data: apiResult?.result?.map(item => item.male),
        backgroundColor: "#3B5A92",
        borderRadius: 5,
        barThickness: 30,
      },
      {
        label: t("home.female"),
        data: apiResult?.result?.map(item => item.female),
        backgroundColor: "#29B4C3",
        borderRadius: 5,
        barThickness: 30,
      },
    ],
  };
  const genderOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        reverse: true,
        stacked: true,
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            family: "Noto Kufi Arabic, sans-serif",
            size: 12,
          },
        },
      },
      y: {
        position: "right",
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 100,
          font: {
            family: "Noto Kufi Arabic, sans-serif",
            size: 12,
          },
        },
        grid: {
          color: "#E5E5E5",
          drawTicks: false,
        },
        min: apiResult?.range?.min,
        max: apiResult?.range?.max + 5,
      },
    },
  };

  return (
    <div className="flex md:flex-row flex-col gap-4 justify-between">
      <div className="flex flex-col gap-4 py-4 flex-1">
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
            <Card>
              <div className="flex flex-col gap-4 ">
                <div className="flex items-center justify-between">
                  <p className="text-[0.875rem] font-main">{t("home.profits")}</p>
                  <div className="flex items-center gap-3">
                    <hr className="text-primary w-[18px]" />
                    <p className="font-main text-[#384250] text-[0.75rem]">{t("home.income")}</p>
                    <hr className="text-[#C3292C] w-[18px]" />
                    <p className="font-main text-[#384250] text-[0.75rem]">{t("home.expenses")}</p>
                    <hr className="border-accent border-t-2 border-dashed w-[18px]" />
                    <p className="font-main text-[#384250] text-[0.75rem]">{t("home.net")}</p>
                  </div>
                </div>
                <div className="w-full h-[300px]">
                  <Line data={data} options={options} />
                </div>
              </div>
            </Card>
            <Card>
              {" "}
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <p className="text-[0.875rem] font-main">{t("home.gender")}</p>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-secondary w-[8px] h-[8px]" />
                    <p className="text-[#333333] font-main text-[0.625rem]">{t("home.men")}</p>
                    <div className="rounded-full bg-primary w-[8px] h-[8px]" />
                    <p className="text-[#333333] font-main text-[0.625rem]">{t("home.female")}</p>
                  </div>
                </div>
                <div className="w-full h-[328px]">
                  <Bar data={genderData} options={genderOptions} />
                </div>
              </div>
            </Card>
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

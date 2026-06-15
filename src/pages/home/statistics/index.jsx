/* eslint-disable complexity */
/* eslint-disable comma-dangle */
import React from "react";
import Card from "@/components/card";
import users from "@assets/svgs/homepage/2users.svg";
import { useTranslation } from "react-i18next";
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
import { Doughnut } from "react-chartjs-2";
import { useForm } from "react-hook-form";
import SelectField from "@/components/shared/select";
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
export default function Statistics() {
  const { t } = useTranslation();
  const filterType = [
    { label: t("common.monthly"), value: "monthly " },
    { label: t("common.yearly"), value: "yearly" },
  ];
  const { control, watch } = useForm({
    defaultValues: { month: filterType[0], month1: filterType[0] },
  });
  const { data: result } = useDashboardQueries.GetBookingsStats({
    type: watch("month")?.value,
    value: null,
  });
  const { data: result2 } = useDashboardQueries.GetServicesStats({
    type: watch("month1")?.value,
    value: null,
  });

  const colors2 = ["#29B4C3", "#94D9E1", "#C9ECF0"];

  const apiResponse = result || { data: [] };
  const apiResponse2 = result2 || { data: [] };

  const chartData = {
    labels: apiResponse2?.data?.map(item => t(`home.${item.label}`)),
    datasets: [
      {
        data: apiResponse2?.data?.map(item => item.percentage),
        backgroundColor: colors2,
        borderWidth: 0,
        cutout: "86%",
        borderRadius: 10,
        spacing: 10,
      },
    ],
  };

  const colors = ["#29B4C3", "#94D9E1", "#C9ECF0"];
  const cutoutValues = ["80%", "60%", "40%"];
  const radiusValues = ["100%", "80%", "60%"];

  const patientData = {
    labels: apiResponse?.data?.map(item => t(`home.${item.label}`)),
    datasets: apiResponse?.data?.map((item, index) => ({
      label: t(`home.${item.label}`),
      data: [item.percentage, 100 - item.percentage],
      backgroundColor: [colors[index % colors.length], "#E5E5E5"],
      borderWidth: 0,
      cutout: cutoutValues[index % cutoutValues.length],
      radius: radiusValues[index % radiusValues.length],
    })),
  };
  const patientStatsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <p className="text-[0.875rem] font-main ">{t("home.statistics")}</p>
            <div className="w-[40%]">
              <SelectField
                name="month"
                control={control}
                isClearable={false}
                options={filterType}
                selectStyle={{ border: "1px solid #D3D3D3", minHeight: "30px", overflow: "hidden" }}
                placeholder={"---"}
              />
            </div>
          </div>
          <div className="w-full h-[200px]">
            <Doughnut data={patientData} options={patientStatsOptions} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-accent text-[0.625rem] font-main">{t("common.number")}</p>
            <div className="flex items-center gap-1">
              <img src={users} alt="users" className="w-5 h-5" />
              <p className="font-main text-[0.875rem]">{apiResponse?.total}</p>
            </div>
          </div>
          <hr className="text-gray" />
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary px-4 py-2 rounded-xl font-main text-[0.75rem] ">
                {apiResponse?.data[0]?.percentage}%
              </div>
              <p className="text-[#333333] font-main text-[0.75rem]">{t("booking.wait")}</p>
            </div>
            <div className="flex items-center gap-1">
              <img src={users} alt="users" className="w-5 h-5" />
              <p className="font-main text-[0.875rem]">{apiResponse?.data[0]?.count}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#94D9E1] px-4 py-2 rounded-xl font-main text-[0.75rem] ">
                {apiResponse?.data[1]?.percentage}%
              </div>
              <p className="text-[#333333] font-main text-[0.75rem]">{t("booking.approve")}</p>
            </div>
            <div className="flex items-center gap-1">
              <img src={users} alt="users" className="w-5 h-5" />
              <p className="font-main text-[0.875rem]">{apiResponse?.data[1]?.count}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#C9ECF0] px-4 py-2 rounded-xl font-main text-[0.75rem] ">
                {apiResponse?.data[2]?.percentage}%
              </div>
              <p className="text-[#333333] font-main text-[0.75rem]">{t("booking.done")}</p>
            </div>
            <div className="flex items-center gap-1">
              <img src={users} alt="users" className="w-5 h-5" />
              <p className="font-main text-[0.875rem]">{apiResponse?.data[2]?.count}</p>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <p className="text-[0.875rem] font-main ">{t("home.service")}</p>
            <div className="w-[40%]">
              <SelectField
                name="month1"
                control={control}
                isClearable={false}
                options={filterType}
                selectStyle={{ border: "1px solid #D3D3D3", minHeight: "30px", overflow: "hidden" }}
                placeholder={"---"}
              />
            </div>
          </div>
          <div className="w-full h-[150px] relative flex items-center justify-center">
            <Doughnut
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                rotation: -135,
                circumference: 270,
                radius: "100%",
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: false },
                },
              }}
            />

            <div className="absolute flex flex-col items-center gap-2">
              <p className="text-accent text-[0.625rem] font-main">{t("home.patient-number")}</p>
              <div className="flex items-center gap-1">
                <img src={users} alt="users" className="w-5 h-5" />
                <p className="font-main text-[0.875rem]">{result2?.total}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary px-4 py-2 rounded-xl font-main text-[0.75rem] ">
                {apiResponse2?.data[0]?.percentage}%
              </div>
              <p className="text-[#333333] font-main text-[0.75rem]">{t("sidebar.hair-care")}</p>
            </div>
            <div className="flex items-center gap-1">
              <img src={users} alt="users" className="w-5 h-5" />
              <p className="font-main text-[0.875rem]">{apiResponse2?.data[0]?.count}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#94D9E1] px-4 py-2 rounded-xl font-main text-[0.75rem] ">
                {apiResponse2?.data[1]?.percentage}%
              </div>
              <p className="text-[#333333] font-main text-[0.75rem]">{t("sidebar.injections")}</p>
            </div>
            <div className="flex items-center gap-1">
              <img src={users} alt="users" className="w-5 h-5" />
              <p className="font-main text-[0.875rem]">{apiResponse2?.data[1]?.count}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#C9ECF0] px-4 py-2 rounded-xl font-main text-[0.75rem] ">
                {apiResponse2?.data[2]?.percentage}%
              </div>
              <p className="text-[#333333] font-main text-[0.75rem]">{t("home.implant")}</p>
            </div>
            <div className="flex items-center gap-1">
              <img src={users} alt="users" className="w-5 h-5" />
              <p className="font-main text-[0.875rem]">{apiResponse2?.data[2]?.count}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

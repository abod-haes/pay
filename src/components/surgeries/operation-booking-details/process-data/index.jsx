/* eslint-disable complexity */
import Card from "@/components/card";
import TitleOfSections from "../../titleOfSections";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const ProcessData = ({ dataToReset }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const personalDetails = [
    {
      label: t("surgeries.agriculture-technology"),
      value: dataToReset?.planting_technique?.name,
      show: true,
    },
    {
      label: pathname.includes("/hair-transplant-details")
        ? t("surgeries.number-of-mezo")
        : t("surgeries.number-of-eyebrow"),
      value: dataToReset?.meso_count || 0,
      show: true,
    },
    {
      label: t("surgeries.number-of-bazma"),
      value: dataToReset?.plasma_count || 0,
      show: pathname.includes("/hair-transplant-details"),
    },
    { label: t("surgeries.admin-note"), value: dataToReset?.admin_notes || "-", show: true },
  ];
  return (
    <div className="grid gap-[16px] mt-[24px]">
      <TitleOfSections title={t("surgeries.process-data")} />
      <Card otherStyle={"grid gap-[16px]"}>
        <ul className="grid lg:grid-cols-5 md:grid-col-3 grid-cols-2 w-full">
          {/* Personal Details Section */}
          {personalDetails.map(
            (detail, index) =>
              detail.show && (
                <div key={index} className="grid gap-[10px] text-[0.9rem] justify-between py-2">
                  <span className="font-normal text-accent">{detail.label}</span>
                  <span className="font-normal">{detail.value}</span>
                </div>
              )
          )}
        </ul>
        {/* Personal Details Section */}
        <div className="grid gap-[10px] text-[0.9rem] justify-between py-2">
          <span className="font-normal text-accent">{t("surgeries.accept-technician")}</span>
          {dataToReset?.agree_technology ? t("common.yes") : t("common.no")}
        </div>
        <div className="grid gap-[10px] text-[0.9rem] justify-between py-2">
          <span className="font-normal text-accent">{t("surgeries.accept-drawing")}</span>
          {/* <span className="font-normal">نعم</span> */}
          {dataToReset?.agree_drawing ? t("common.yes") : t("common.no")}
        </div>
        <div className="grid gap-[10px] text-[0.9rem] justify-between py-2">
          <span className="font-normal text-accent">
            {pathname.includes("/hair-transplant-details")
              ? t("surgeries.number-of-grafts")
              : t("surgeries.seen-doctor")}
          </span>
          {pathname.includes("/hair-transplant-details")
            ? dataToReset?.agree_plants_count
              ? t("common.yes")
              : t("common.no")
            : dataToReset?.doctor_agree
            ? t("common.yes")
            : t("common.no")}
        </div>
      </Card>
    </div>
  );
};

export default ProcessData;

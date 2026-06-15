/* eslint-disable complexity */
/* eslint-disable no-console */
import { useTranslation } from "react-i18next";
import TitleOfSections from "../../titleOfSections";
import Card from "@/components/card";
import useBookingVia from "@/hooks/useBookingia";

const PaitientFile = ({ dataToReset }) => {
  const { bookingVia } = useBookingVia();
  const { t } = useTranslation();
  const genderOptions = [
    { value: "male", label: "ذكر" },
    { value: "female", label: "أنثى" },
  ];

  const personalDetails = [
    { label: t("employee.forth"), value: dataToReset?.full_name },
    { label: t("surgeries.phone-number"), value: dataToReset?.first_phone_number },
    { label: t("surgeries.phone-number2"), value: dataToReset?.second_phone_number || "-" },
    {
      label: t("delayed.gender"),
      value: genderOptions?.find(item => item?.value.includes(dataToReset?.gender))?.label,
    },
    { label: t("delayed.birthday"), value: dataToReset?.birth_date?.split("T")[0] || "-" },
  ];

  const personalDetails2 = [
    { label: t("users.city"), value: dataToReset?.state?.name },
    { label: t("delayed.country"), value: dataToReset?.city?.name || "_" },
    { label: t("delayed.area"), value: dataToReset?.address || "-" },
    {
      label: t("delayed.reservation-way"),
      value: bookingVia?.find(item => item?.value.includes(dataToReset?.booking_via))?.label,
    },
    {
      label: t("delayed.reservation-date"),
      value: dataToReset?.register_date?.split("T")[0] || "-",
    },
  ];

  return (
    <div className="my-[24px]">
      <p className="text-[1.25rem] text-black font-normal">{t("delayed.file")}</p>

      <div className="grid gap-[16px] mt-[24px]">
        <TitleOfSections title={t("delayed.info")} />
        <Card otherStyle={"grid gap-[16px] !py-6 !px-6"}>
          <ul className="grid lg:grid-cols-5 md:grid-col-3 grid-cols-2 w-full">
            {/* Personal Details Section */}
            {personalDetails.map((detail, index) => (
              <div key={index} className="grid gap-[10px] text-[0.9rem] justify-between py-2">
                <span className="font-normal text-accent">{detail.label}</span>
                <span className="font-normal">{detail.value}</span>
              </div>
            ))}
          </ul>
          <ul className="grid lg:grid-cols-5 md:grid-col-3 grid-cols-2 w-full">
            {/* Personal Details Section */}
            {personalDetails2.map((detail, index) => (
              <div key={index} className="grid gap-[10px] text-[0.9rem] justify-between py-2">
                <span className="font-normal text-accent">{detail.label}</span>
                <span className="font-normal">{detail.value}</span>
              </div>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default PaitientFile;

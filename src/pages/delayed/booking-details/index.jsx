import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import { decryptId } from "@/utils/helpers";
export default function BookingDetails() {
  const navigate = useNavigate();

  const { id: encryptedId } = useParams();
  const { t } = useTranslation();
  const location = useLocation();
  // const query = new URLSearchParams(location.search);
  const id = encryptedId ? decryptId(encryptedId) : null;
  //const isShow = Boolean(query.get("show") === "true");
  const TITLE = t("complaints.details");
  const bookingInfo = [
    { label: t("delayed.patientName"), value: "محمد أحمد" },
    { label: t("booking.department"), value: "الزراعة" },
    { label: t("booking.service"), value: "استشارة زراعة" },
    { label: t("hair.title"), value: "اسم الطبيب" },
    { label: t("delayed.date"), value: "5/6/2025" },
    { label: t("delayed.time"), value: "12:00 م" },
    { label: t("delayed.cost"), value: "$200.00" },
  ];

  // personal info array
  const personalInfo = [
    { label: t("delayed.fullName"), value: "محمد أحمد" },
    { label: t("complaints.phone1"), value: "0770012345" },
    { label: t("complaints.phone2"), value: "0770012345" },
    { label: t("delayed.gender"), value: "ذكر" },
    { label: t("delayed.birthday"), value: "5/6/1999" },
    { label: t("users.city"), value: "بغداد" },
    { label: t("delayed.country"), value: "الرصافة" },
    { label: t("delayed.area"), value: "زيونة" },
    { label: t("delayed.reservation-way"), value: "أدمن" },
    { label: t("delayed.reservation-date"), value: "5/6/2025" },
  ];
  return (
    <div>
      <BreadCrumb
        isAdd
        title={TITLE}
        link="/delayed"
        isStatue={true}
        bgColor={"bg-accent"}
        statue={t("hair.details")}
      />
      <Card otherStyle={"mb-8 !py-6"}>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {bookingInfo.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">{item.label}</p>
              <p className="font-main text-[#333333] text-[0.85rem]">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
      <p className="font-main text-[1.25rem] py-6">{t("delayed.file")}</p>
      <p className="text-primary font-main text-[1rem] mb-4">{t("delayed.info")}</p>
      <Card otherStyle={"mb-8 !py-6"}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:w-[80%]">
          {personalInfo.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <p className="font-main text-accent text-[0.75rem]">{item.label}</p>
              <p className="font-main text-[#333333] text-[0.85rem]">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
      <p className="text-primary font-main text-[1rem] mb-4">{t("delayed.medical-info")}</p>
      <Card otherStyle={"mb-8 !py-6"}>
        <div className="flex flex-col gap-4">
          <p className="font-main text-accent text-[0.75rem]">{t("delayed.chronicDiseases")}</p>
          <p className="font-main text-[#3333333] text-[0.85rem]">لا</p>
          <p className="font-main text-accent text-[0.75rem]">{t("delayed.drugAllergy")}</p>
          <p className="font-main text-[#3333333] text-[0.85rem]">نعم، حساسية من البنسلين</p>
        </div>
      </Card>
    </div>
  );
}

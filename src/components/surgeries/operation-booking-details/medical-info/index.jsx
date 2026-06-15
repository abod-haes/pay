/* eslint-disable complexity */
import Card from "@/components/card";
import TitleOfSections from "../../titleOfSections";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const MedicalInfo = ({ MedicalInfo }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <div className="grid gap-[16px] mt-[24px]">
      <TitleOfSections title={t("delayed.medical-info")} />
      <Card otherStyle={"grid gap-[16px] !py-6 !px-6"}>
        {/* Personal Details Section */}
        <div className="grid gap-[10px] text-[0.9rem] justify-between py-2">
          <span className="font-normal text-accent">{t("surgeries.suffer")}</span>
          <span className="font-normal">
            {MedicalInfo?.chronic_diseases ? t("common.yes") : t("common.no")}{" "}
            {MedicalInfo?.chronic_diseases_description &&
              `, ${MedicalInfo?.chronic_diseases_description}`}
          </span>
        </div>
        <div className="grid gap-[10px] text-[0.9rem] justify-between py-2">
          <span className="font-normal text-accent">{t("surgeries.drug")}</span>
          {MedicalInfo?.drug_allergy ? t("common.yes") : t("common.no")}{" "}
          {MedicalInfo?.drug_allergy_description && `, ${MedicalInfo?.drug_allergy_description}`}
        </div>
        {pathname.includes("/hair-transplant-details") && (
          <div className="grid gap-[10px] text-[0.9rem] justify-between py-2">
            <span className="font-normal text-accent">{t("surgeries.have-last-operation")}</span>
            <span className="font-normal">
              {MedicalInfo?.previous_surgery ? t("common.yes") : t("common.no")}
              {MedicalInfo?.previous_surgery_description &&
                `, ${MedicalInfo?.previous_surgery_description}`}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MedicalInfo;

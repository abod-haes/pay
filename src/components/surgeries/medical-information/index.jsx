import { useTranslation } from "react-i18next";
import TitleOfSections from "../titleOfSections";
import Card from "@/components/card";
import GroupRadio from "@/components/shared/checkbox/GroupRadio";
import Input from "@/components/shared/input";
import { useLocation } from "react-router-dom";

const MedicalInformation = ({ control, watch, setValue, errors, showPreviousSurgery }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <div className="grid gap-[16px]">
      <TitleOfSections title={t("surgeries.medical-information")} />
      <Card otherStyle={"grid gap-[16px]"}>
        <p className="font-normal text-[0.8rem] leading-[125%]">{t("surgeries.suffer")}</p>
        <div className="flex gap-6 mt-2">
          <GroupRadio
            name="chronic_diseases"
            value="yes"
            label={t("common.yes")}
            checked={watch("chronic_diseases") === "yes"}
            onChange={() => setValue?.("chronic_diseases", "yes")}
          />
          <GroupRadio
            name="chronic_diseases"
            value="no"
            label={t("common.no")}
            checked={watch("chronic_diseases") === "no"}
            onChange={() => setValue?.("chronic_diseases", "no")}
          />
          <Input
            control={control}
            name={"chronic_diseases_description"}
            placeholder={t("common.description")}
            error={errors?.chronic_diseases_description?.message}
          />
        </div>
        <p className="font-normal text-[0.8rem] leading-[125%]">{t("surgeries.drug")}</p>
        <div className="flex gap-6 mt-2">
          <GroupRadio
            name="drug_allergy"
            value="yes"
            label={t("common.yes")}
            checked={watch("drug_allergy") === "yes"}
            onChange={() => setValue?.("drug_allergy", "yes")}
          />
          <GroupRadio
            name="drug_allergy"
            value="no"
            label={t("common.no")}
            checked={watch("drug_allergy") === "no"}
            onChange={() => setValue?.("drug_allergy", "no")}
          />
          <Input
            control={control}
            name={"drug_allergy_description"}
            placeholder={t("common.description")}
            error={errors?.drug_allergy_description?.message}
          />
        </div>
        {(pathname.includes("/hair-transplant") || showPreviousSurgery) && (
          <>
            <p className="font-normal text-[0.8rem] leading-[125%]">
              {t("surgeries.have-last-operation")}
            </p>
            <div className="flex gap-6 mt-2">
              <GroupRadio
                name="previous_surgery"
                value="yes"
                label={t("common.yes")}
                checked={watch("previous_surgery") === "yes"}
                onChange={() => setValue?.("previous_surgery", "yes")}
              />
              <GroupRadio
                name="previous_surgery"
                value="no"
                label={t("common.no")}
                checked={watch("previous_surgery") === "no"}
                onChange={() => setValue?.("previous_surgery", "no")}
              />
              <Input
                control={control}
                name={"previous_surgery_description"}
                placeholder={t("common.description")}
                error={errors?.previous_surgery_description?.message}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default MedicalInformation;

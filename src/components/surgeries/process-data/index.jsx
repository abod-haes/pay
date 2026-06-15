/* eslint-disable complexity */
import { useTranslation } from "react-i18next";
import TitleOfSections from "../titleOfSections";
import Card from "@/components/card";
import SelectField from "@/components/shared/select";
import Input from "@/components/shared/input";
import GroupRadio from "@/components/shared/checkbox/GroupRadio";
import { useLocation } from "react-router-dom";
import usePlanting from "@/hooks/usePlanting";

const ProcessData = ({ control, watch, setValue, errors }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { isLoadingPlanting, plantingItems } = usePlanting({});

  return (
    <div className="grid gap-[16px]">
      <TitleOfSections title={t("surgeries.process-data")} />
      <Card otherStyle={"grid gap-[16px]"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            name="planting_technique_id"
            control={control}
            options={plantingItems}
            loading={isLoadingPlanting}
            error={errors?.planting_technique_id?.message}
            placeholder={t("surgeries.agriculture-technology")}
          />

          <Input
            control={control}
            name={"total"}
            isNumberWithCommas
            placeholder={t("surgeries.total-transaction-amount")}
            error={errors?.total?.message}
          />
          <Input
            control={control}
            isNumberWithCommas
            placeholder={
              pathname.includes("/eyebrow-transplant")
                ? t("surgeries.number-of-eyebrow")
                : t("surgeries.number-of-mezo")
            }
            name={"meso_count"}
            error={errors?.meso_count?.message}
          />

          {!pathname.includes("/eyebrow-transplant") && (
            <Input
              control={control}
              isNumberWithCommas
              placeholder={t("surgeries.number-of-bazma")}
              name={"plasma_count"}
              error={errors?.plasma_count?.message}
            />
          )}

          <Input
            control={control}
            placeholder={
              pathname.includes("/eyebrow-transplant")
                ? t("surgeries.admin-note")
                : t("common.notes")
            }
            name={"admin_notes"}
            error={errors?.admin_notes?.message}
          />
        </div>

        <p className="font-normal text-[0.8rem] leading-[125%]">
          {t("surgeries.accept-technician")}
        </p>
        <div className="flex gap-6 mt-2">
          <GroupRadio
            name="agree_technology"
            value="yes"
            label={t("common.yes")}
            checked={watch("agree_technology") === "yes"}
            onChange={() => setValue?.("agree_technology", "yes")}
          />
          <GroupRadio
            name="agree_technology"
            value="no"
            label={t("common.no")}
            checked={watch("agree_technology") === "no"}
            onChange={() => setValue?.("agree_technology", "no")}
          />
        </div>

        <p className="font-normal text-[0.8rem] leading-[125%]">{t("surgeries.accept-drawing")}</p>
        <div className="flex gap-6 mt-2">
          <GroupRadio
            name="agree_drawing"
            value="yes"
            label={t("common.yes")}
            checked={watch("agree_drawing") === "yes"}
            onChange={() => setValue?.("agree_drawing", "yes")}
          />
          <GroupRadio
            name="agree_drawing"
            value="no"
            label={t("common.no")}
            checked={watch("agree_drawing") === "no"}
            onChange={() => setValue?.("agree_drawing", "no")}
          />
        </div>

        <p className="font-normal text-[0.8rem] leading-[125%]">
          {pathname.includes("/eyebrow-transplant")
            ? t("surgeries.seen-doctor")
            : t("surgeries.number-of-grafts")}
        </p>
        {pathname.includes("/eyebrow-transplant") ? (
          <div className="flex gap-6 mt-2">
            <GroupRadio
              name="doctor_agree"
              value="yes"
              label={t("common.yes")}
              checked={watch("doctor_agree") === "yes"}
              onChange={() => setValue?.("doctor_agree", "yes")}
            />
            <GroupRadio
              name="doctor_agree"
              value="no"
              label={t("common.no")}
              checked={watch("doctor_agree") === "no"}
              onChange={() => setValue?.("doctor_agree", "no")}
            />
          </div>
        ) : (
          <div className="flex gap-6 mt-2">
            <GroupRadio
              name="agree_plants_count"
              value="yes"
              label={t("common.yes")}
              checked={watch("agree_plants_count") === "yes"}
              onChange={() => setValue?.("agree_plants_count", "yes")}
            />
            <GroupRadio
              name="agree_plants_count"
              value="no"
              label={t("common.no")}
              checked={watch("agree_plants_count") === "no"}
              onChange={() => setValue?.("agree_plants_count", "no")}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
export default ProcessData;

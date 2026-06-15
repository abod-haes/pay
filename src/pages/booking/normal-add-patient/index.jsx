import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import { useNavigate, useLocation } from "react-router-dom";

import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import { useTranslation } from "@hooks/useTranslation";
import SelectField from "@/components/shared/select";
import Calender from "@assets/svgs/common/calendar.svg";
import ControlledTimeField from "@/components/shared/controlledDatePicker";

export default function NormalAddPatient() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const id = query.get("id");
  const isEdit = Boolean(id);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      birthday: "",
      gender: "",
      city: "",
      country: "",
      region: "",
      phone1: "",
      phone2: "",
      reserve: "",
    },
  });

  const onSubmit = data => {
    {
      showSuccess("تم الإضافة");
    }

    navigate(-1);
  };
  const handleCancel = () => {
    navigate(-1);
  };
  const TITLE = isEdit ? t("patient.edit") : t("patient.add");

  const BUTTONSLIST = [
    { component: <PrimaryButton text={t("common.add")} type="submit" /> },
    { component: <SecondaryButton text={t("common.cancel2")} onClick={handleCancel} /> },
  ];
  const genderOptions = [
    { value: "male", label: "ذكر" },
    { value: "female", label: "أنثى" },
  ];

  const cityOptions = [
    { value: "baghdad", label: "بغداد" },
    { value: "mosul", label: "الموصل" },
  ];

  const countryOptions = [
    { value: "rusaifa", label: "الرصافة" },
    { value: "karada", label: "الكرادة" },
  ];

  const reserveOptions = [
    { value: "admin", label: "أدمن" },
    { value: "phone", label: "هاتف" },
  ];
  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/patient" />
      <Card otherStyle={"max-md:!w-full !w-[80%] mb-8"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="name"
              control={control}
              placeholder={t("employee.forth")}
              error={errors.name?.message}
              rules={{ required: t("validation.required") }}
            />

            <ControlledTimeField
              name="birthday"
              control={control}
              placeholder={t("delayed.birthday")}
              errors={errors.birthday}
              icon={Calender}
            />
            <SelectField
              name="gender"
              control={control}
              options={genderOptions}
              placeholder={t("delayed.gender")}
            />
            <SelectField
              name="city"
              control={control}
              options={cityOptions}
              placeholder={t("users.city")}
            />

            <SelectField
              name="country"
              control={control}
              options={countryOptions}
              placeholder={t("delayed.country")}
            />
            <Input
              name="region"
              control={control}
              placeholder={t("delayed.area")}
              error={errors.region?.message}
              rules={{
                required: t("validation.required"),
              }}
            />
            <Input
              name="phone1"
              control={control}
              placeholder={t("complaints.phone1")}
              error={errors.phone1?.message}
              rules={{
                required: t("validation.required"),
              }}
            />
            <Input
              name="phone2"
              control={control}
              placeholder={t("complaints.phone2")}
              error={errors.phone2?.message}
              rules={{
                required: t("validation.required"),
              }}
            />
            <SelectField
              name="reserve"
              control={control}
              options={reserveOptions}
              placeholder={t("booking.booked-by")}
            />
          </div>
          <CustomFlexButtons
            gap="gap-4"
            justify="justify-start"
            reverse={false}
            buttons={BUTTONSLIST}
          />
        </form>
      </Card>
    </div>
  );
}

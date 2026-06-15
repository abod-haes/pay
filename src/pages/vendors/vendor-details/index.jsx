/* eslint-disable complexity */
/* eslint-disable no-trailing-spaces */
/* eslint-disable indent */
/* eslint-disable comma-dangle */
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";

import SelectField from "@/components/shared/select";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import { decryptId } from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import PhoneNumber from "@/components/phoneNumber";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import { yupResolver } from "@hookform/resolvers/yup";
import { handleBackendErrors } from "@/utils/helpers";
import * as yup from "yup";
import { useSearchParams } from "react-router-dom";
import { apis } from "@/apis/vendors/api";
import { useVendorsQueries } from "@/apis/vendors/query";
import useEmployees from "@/hooks/useEmployess";
import TextAreaField from "@/components/shared/textArea";
export const getCountryByCallingCode = code => {
  const countries = getCountries();
  return countries.find(c => getCountryCallingCode(c) === String(code));
};
export default function VendorDetails() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  // حالة إضافة
  const isAdd = location.pathname.endsWith("/add");

  // حالة عرض
  const isShow = query.get("show") === "true";
  const [searchParams] = useSearchParams();
  const { isLoadingEmployees2, items: employees2 } = useEmployees({ type: "employee" });
  // حالة تعديل
  // const id = encryptedId ? decryptId(encryptedId) : null;
  const isEdit = Boolean(id);
  const { data } = useVendorsQueries.GetOne({ id });
  const [phoneNumberReady, setPhoneNumberReady] = useState(false);
  const schema = yup.object().shape({
    full_name: yup.string().required(t("validation.required")),
    phone_number: yup.string().required(t("validation.required")),
    company_name: yup.string().required(t("validation.required")),
    address: yup.string().required(t("validation.required")),
  });

  const {
    control,

    handleSubmit,
    reset,
    setValue,
    setError,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      country_code: "964",
      company_name: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    if ((isEdit || isShow) && data?.data) {
      const emp = data.data?.data;

      reset({
        full_name: emp.full_name || "",
        phone_number: emp?.phone_number,
        country_code: emp?.country_code,
        company_name: emp.company_name || "",
        address: emp.address || "",
        notes: emp.notes,
      });
      setPhoneNumberReady(true);
    } else if (isAdd) {
      setPhoneNumberReady(true);
    }
  }, [isEdit, data, reset, isShow, isAdd]);
  const onSubmit = async formData => {
    try {
      const payload = {
        ...formData,
      };

      let res;
      if (!isAdd) {
        res = await apis.update({ id, payload });
      } else {
        res = await apis.add({ payload });
      }

      showSuccess(res?.data?.message);
      navigate(-1);
    } catch (error) {
      console.error("Error submitting form:", error);
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const TITLE = isAdd ? t("vendors.add") : isShow ? t("vendors.show") : t("vendors.edit");

  const BUTTONSLIST = [
    {
      show: !isShow,
      component: (
        <PrimaryButton
          text={isAdd ? t("common.add") : t("common.save_changes")}
          type="submit"
          isSubmitting={isSubmitting}
        />
      ),
    },
    {
      show: !isShow,
      component: <SecondaryButton text={t("common.cancel2")} onClick={handleCancel} />,
    },
  ];

  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/branches" />
      <Card otherStyle={"!w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="full_name"
              control={control}
              placeholder={t("vendors.name")}
              error={errors.full_name?.message}
              disable={isShow}
            />

            {phoneNumberReady && (
              <PhoneNumber
                control={control}
                defaultCountry={getCountryByCallingCode(data?.data?.data?.country_code) || "IQ"}
                name={"phone_number"}
                phoneName={"country_code"}
                placeholder={t("common.phone-number")}
                register={register}
                errors={errors.phone_number?.message}
                disable={isShow}
              />
            )}

            <Input
              name="company_name"
              control={control}
              placeholder={t("vendors.company")}
              error={errors.company_name?.message}
              disable={isShow}
            />
            <Input
              name="address"
              control={control}
              placeholder={t("common.address")}
              error={errors.address?.message}
              disable={isShow}
            />
          </div>
          <div className="w-[48%]">
            {" "}
            <TextAreaField
              {...register("notes")}
              placeholder={t("department.note")}
              rows={3}
              variant="white"
              disable={isShow}
              error={errors.notes?.message}
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

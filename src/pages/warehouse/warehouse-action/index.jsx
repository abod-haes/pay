/* eslint-disable complexity */
/* eslint-disable indent */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";

import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import { decryptId } from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import { apis } from "@/apis/warehouse/api";
import { handleBackendErrors } from "@/utils/helpers";
import SelectField from "@/components/shared/select";
import { useWarehouseQueries } from "@/apis/warehouse/query";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import useCities from "@/hooks/useCities";
import useStates from "@/hooks/useStates";
import PhoneNumber from "@/components/phoneNumber";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
export const getCountryByCallingCode = code => {
  const countries = getCountries();
  return countries.find(c => getCountryCallingCode(c) === String(code));
};
function resetFormFields(reset, dataToReset) {
  reset({
    city_id: { label: dataToReset?.city?.name, value: dataToReset?.city?.id },
    name: dataToReset?.name,
    country: {
      label: dataToReset?.city?.state?.name,
      value: dataToReset?.city?.state?.id,
    },
    phone_number: dataToReset?.phone_number,

    address: dataToReset?.address,
    country_code: dataToReset?.country_code,
  });
}
export default function WarehouseAction() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const isAdd = location.pathname.endsWith("/add");
  const isEdit = Boolean(id);
  const { data, isLoading } = useWarehouseQueries.GetOne({ id });
  const validationSchema = yup.object().shape({
    name: yup.string().required(t("validation.required")),

    phone_number: yup.string().required(t("validation.required")),
    city_id: yup
      .object()
      .shape({
        label: yup.string().required(t("validation.required")),
        value: yup.string().required(t("validation.required")),
      })
      .required(t("validation.required")),
    country: yup
      .object()
      .typeError(t("validation.required"))
      .shape({
        label: yup.string().required(t("validation.required")),
        value: yup.string().required(t("validation.required")),
      })
      .required(t("validation.required")),
    address: yup.string().required(t("validation.required")),
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      city_id: null,
      phone_number: "",
      country: "",
      address: "",
      country_code: "964",
    },
  });
  const [phoneNumberReady, setPhoneNumberReady] = useState(false);
  const { isLoadingStates, items: states } = useStates();
  const { isLoadingCities, items: cities } = useCities({ state_id: watch("country")?.value });
  const [previousCountry, setPreviousCountry] = useState(null);
  const selectedCountry = watch("country");
  useEffect(() => {
    if (
      previousCountry !== null &&
      selectedCountry?.value !== previousCountry &&
      watch("city_id")
    ) {
      setValue("city_id", null);
    }

    if (selectedCountry?.value) {
      setPreviousCountry(selectedCountry.value);
    }
  }, [selectedCountry, setValue, watch, previousCountry]);
  useEffect(() => {
    if (isEdit && id && !isAdd) {
      const dataToReset = data?.data?.data;
      resetFormFields(reset, dataToReset);

      if (dataToReset?.country_code) {
        setPhoneNumberReady(true);
      }
    } else {
      setPhoneNumberReady(true);
    }
  }, [id, isAdd, isEdit, data?.data, reset]);
  useEffect(() => {
    if (isEdit && id && !isAdd) {
      const dataToReset = data?.data?.data;
      resetFormFields(reset, dataToReset);
    }
  }, [id, isAdd, isEdit, data?.data, reset]);
  const onSubmit = async data => {
    try {
      const dataToSend = {
        name: data.name,

        city_id: data.city_id.value,
        country: data.country.value,
        phone_number: data.phone_number,

        address: data.address,
        country_code: data.country_code || null,
      };
      clearErrors();
      if (!isAdd) {
        const response = await apis.update({ id, payload: dataToSend });
        showSuccess(response?.data.message);
      } else {
        const response = await apis.add({ payload: dataToSend });
        showSuccess(response?.data.message);
      }
      navigate(-1);
    } catch (error) {
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const TITLE = isAdd
    ? t("warehouse.add")
    : // : isShow
      // ? t("staff.view-employee")
      t("warehouse.update");

  const BUTTONSLIST = [
    {
      component: (
        <PrimaryButton
          text={isAdd ? t("common.add") : t("common.save_changes")}
          type="submit"
          isSubmitting={isSubmitting}
        />
      ),
    },
    {
      show: true,
      component: <SecondaryButton text={t("common.cancel")} onClick={handleCancel} />,
    },
  ];

  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/branches" />
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              name="name"
              control={control}
              placeholder={t("warehouse.name")}
              error={errors.name?.message}
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
              />
            )}
            <SelectField
              name="country"
              control={control}
              options={states}
              error={errors.country?.message}
              placeholder={t("users.city")}
              loading={isLoadingStates}
            />

            <SelectField
              name="city_id"
              control={control}
              options={cities}
              error={errors.city_id?.message}
              disabled={!watch("country")}
              placeholder={t("delayed.country")}
              loading={isLoadingCities}
            />

            <Input
              name="address"
              control={control}
              placeholder={t("common.address")}
              error={errors.address?.message}
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

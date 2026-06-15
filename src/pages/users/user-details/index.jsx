/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "@/components/shared/input";
import TextAreaField from "@/components/shared/textArea";
import SelectField from "@/components/shared/select";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import { decryptId, handleBackendErrors } from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import { useUsersQueries } from "@/apis/users/query";
import LoadingSection from "@/components/loadingSection";
import { apis } from "@/apis/users/api";
import useCities from "@/hooks/useCities";
import PhoneNumber from "@/components/phoneNumber";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import useStates from "@/hooks/useStates";

export const getCountryByCallingCode = code => {
  const countries = getCountries();
  return countries.find(c => getCountryCallingCode(c) === String(code));
};
function resetFormFields(reset, dataToReset) {
  reset({
    city_id: { label: dataToReset?.city?.name, value: dataToReset?.city?.id },
    country: {
      label: dataToReset?.city?.state?.name,
      value: dataToReset?.city?.state?.id,
    },
    username: dataToReset?.username,
    notes: dataToReset?.notes,
    // salary: dataToReset?.salary?.current,
    phone_number: dataToReset?.phone_number,
    full_name: dataToReset?.full_name,
    email: dataToReset?.email,
    country_code: dataToReset?.country_code,
  });
}

const AddUsers = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id: encryptedId } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  // حالة إضافة
  const isAdd = location.pathname.endsWith("/add");

  // حالة عرض
  const isShow = query.get("show") === "true";

  // حالة تعديل
  const id = encryptedId ? decryptId(encryptedId) : null;
  const isEdit = Boolean(id) && !isShow;

  const { data, isLoading } = useUsersQueries.GetOne({ id });

  const validationSchema = yup.object().shape({
    username: yup.string().required(t("validation.required")),
    full_name: yup.string().required(t("validation.required")),
    phone_number: yup.string().required(t("validation.required")),
    notes: yup.string().nullable(),
    city_id: yup
      .object()
      .typeError(t("validation.required"))
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
    // salary: yup.string().required(t("validation.required")),
    email: yup.string().required(t("validation.required")).email(t("validation.email-invalid")),
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
      username: "",
      full_name: "",
      phone_number: "",
      notes: "",
      city_id: "",
      country: "",
      // salary: "",
      email: "",
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
    if ((isEdit || isShow) && id && !isAdd) {
      const dataToReset = data?.data?.data;
      resetFormFields(reset, dataToReset);

      if (dataToReset?.country_code) {
        setPhoneNumberReady(true);
      }
    } else {
      setPhoneNumberReady(true);
    }
  }, [id, isAdd, isEdit, isShow, data?.data, reset]);

  useEffect(() => {
    if ((isEdit || isShow) && id && !isAdd) {
      const dataToReset = data?.data?.data;
      resetFormFields(reset, dataToReset);
    }
  }, [id, isAdd, isEdit, isShow, data?.data, reset]);

  const onSubmit = async data => {
    try {
      const dataToSend = {
        username: data.username,
        full_name: data.full_name,
        city_id: data.city_id.value,
        notes: data.notes,
        // salary: Number(data.salary),
        phone_number: data.phone_number,
        country_code: data.country_code || null,
        country: data.country.value,
        scope: "mobile",
        email: data.email,
        password: "12345678",
      };
      clearErrors();
      if (!isAdd) {
        const response = await apis.update({ id, payload: dataToSend });
        showSuccess(response?.data?.message);
      } else {
        const response = await apis.add({ id, payload: dataToSend });
        showSuccess(response?.data?.message);
      }
      navigate(-1);
    } catch (error) {
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const TITLE = isAdd ? t("users.add-user") : isShow ? t("users.view-user") : t("users.edit-user");

  const BUTTONSLIST = [
    {
      show: !isShow,
      component: (
        <PrimaryButton
          isSubmitting={isSubmitting}
          text={!isAdd ? t("common.save") : t("common.add")}
          type="submit"
        />
      ),
    },
    {
      show: true,
      component: <SecondaryButton text={t("common.cancel2")} onClick={handleCancel} />,
    },
  ];

  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/branches" />
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <LoadingSection isLoading={isLoading} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              name="full_name"
              control={control}
              placeholder={t("users.name")}
              error={errors.full_name?.message}
              disabled={isShow}
            />
            <Input
              name="username"
              control={control}
              placeholder={t("common.user")}
              error={errors.username?.message}
              disabled={isShow}
            />
            <Input
              name="email"
              control={control}
              placeholder={t("common.email")}
              error={errors.email?.message}
              disabled={isShow}
            />
            {/* <Input
              name="salary"
              control={control}
              placeholder={t("users.target")}
              disabled={isShow}
              isNumberWithCommas
              error={errors.salary?.message}
            /> */}

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
          </div>

          <TextAreaField
            placeholder={t("common.notes")}
            rows={3}
            error={errors.notes?.message}
            disabled={isShow}
            {...register("notes")}
          />

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
};

export default AddUsers;

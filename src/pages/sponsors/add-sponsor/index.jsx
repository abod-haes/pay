/* eslint-disable curly */
/* eslint-disable comma-dangle */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import { apis } from "@/apis/sponsors/api";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { handleBackendErrors } from "@/utils/helpers";
import { useSponsorsQueries } from "@/apis/sponsors/query";
import PhoneNumber from "@/components/phoneNumber";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";

export const getCountryByCallingCode = code => {
  const countries = getCountries();
  return countries.find(c => getCountryCallingCode(c) === String(code));
};

const AddSponsor = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const [phoneNumberReady, setPhoneNumberReady] = useState(false);

  const location = useLocation();
  const isAdd = location.pathname.endsWith("/add");
  const isEdit = Boolean(id);

  const {
    data: sponsorData,
    isLoading: isLoadingSponsor,
    refetch,
  } = useSponsorsQueries.GetOne({
    id: isEdit ? id : null,
  });
  const sponsor = sponsorData?.data;

  const schema = yup.object().shape({
    full_name: yup.string().required(t("validation.required")),
    phone_number: yup.string().required(t("validation.required")),
    address: yup.string().nullable(),
    notes: yup.string().nullable(),
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      address: "",
      notes: "",
      country_code: "964",
    },
  });

  useEffect(() => {
    if (isEdit && id && !isAdd) {
      if (sponsorData?.data?.country_code) {
        setPhoneNumberReady(true);
      }
    } else {
      setPhoneNumberReady(true);
    }
  }, [id, isAdd, isEdit, sponsorData?.data, reset]);

  useEffect(() => {
    if (isEdit && sponsorData?.data) {
      const item = sponsorData.data;
      reset({
        full_name: item.full_name || "",
        phone_number: item.phone_number || "",
        address: item.address || "",
        notes: item.notes || "",
        country_code: item.country_code || null,
      });
    }
  }, [isEdit, sponsorData, reset]);

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
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const TITLE = isAdd ? t("sponsors.add-sponsors") : t("sponsors.edit-sponsors");

  const BUTTONSLIST = [
    {
      component: (
        <PrimaryButton
          text={!isAdd ? t("complaints.save2") : t("common.add")}
          type="submit"
          isSubmitting={isSubmitting}
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
      <BreadCrumb isAdd title={TITLE} link="/sponsors" />
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              name="full_name"
              control={control}
              placeholder={t("delayed.fullName")}
              error={errors.full_name?.message}
            />

            {phoneNumberReady && (
              <PhoneNumber
                control={control}
                defaultCountry={getCountryByCallingCode(sponsorData?.data?.country_code) || "IQ"}
                name={"phone_number"}
                phoneName={"country_code"}
                placeholder={t("common.phone-number")}
                register={register}
                errors={errors.phone_number?.message}
              />
            )}

            <Input
              name="address"
              control={control}
              placeholder={t("common.address")}
              error={errors.address?.message}
            />

            <Input
              name="notes"
              control={control}
              placeholder={t("common.notes")}
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
};

export default AddSponsor;

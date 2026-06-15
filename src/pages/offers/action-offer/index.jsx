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

import { yupResolver } from "@hookform/resolvers/yup";
import { handleBackendErrors } from "@/utils/helpers";
import * as yup from "yup";
import { useSearchParams } from "react-router-dom";
import { apis } from "@/apis/offers/api";
import { useOfferQueries } from "@/apis/offers/query";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import useServices from "@/hooks/useServises";
import { formatDateOrTime } from "@/utils/helpers";
export default function ActionOffer() {
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

  // حالة تعديل
  // const id = encryptedId ? decryptId(encryptedId) : null;
  const isEdit = Boolean(id);
  const { data } = useOfferQueries.GetOne({ id });
  const schema = yup.object().shape({
    from_date: yup.string().required(t("validation.required")),

    to_date: yup
      .string()
      .required(t("validation.required"))
      .test("is-after-or-equal", t("validation.start_date_after_appointment"), function (value) {
        const { from_date } = this.parent;
        if (!from_date || !value) return true;

        return new Date(value) >= new Date(from_date);
      }),

    discount_type: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .required(t("validation.required")),
    discount_value: yup
      .string()
      .required(t("validation.required"))
      .test("salary-validation", function (value) {
        const { discount_type } = this.parent;

        if (!value) return true;

        const numericValue = parseFloat(value.replace(/,/g, ""));

        if (isNaN(numericValue)) {
          return this.createError({ message: t("validation.invalid_number") });
        }

        if (discount_type?.value === "percentage") {
          if (numericValue > 100) {
            return this.createError({ message: t("validation.discount_percentage_max") });
          }
        }

        if (discount_type?.value === "fixed" && numericValue <= 0) {
          return this.createError({ message: t("validation.salary_positive") });
        }

        return true;
      }),
    service_id: yup
      .object()
      .typeError(t("validation.required"))
      .shape({
        label: yup.string().required(t("validation.required")),
        value: yup.string().required(t("validation.required")),
      })
      .required(t("validation.required")),
  });

  const {
    control,

    handleSubmit,
    reset,
    setValue,
    setError,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      from_date: "",

      to_date: "",

      discount_type: null,
      discount_value: "",
      service_id: null,
    },
  });
  const salaryType = [
    {
      label: t("offers.fixed"),
      value: "fixed",
    },
    {
      label: t("employee.percentage"),
      value: "percentage",
    },
  ];
  const { services, isLoadingServices } = useServices({
    section: watch("section")?.value,
  });

  useEffect(() => {
    if ((isEdit || isShow) && data?.data) {
      const emp = data.data?.data;
      const discount_type = salaryType.find(
        option => option.value.toLowerCase() === emp.discount_type?.toLowerCase()
      );

      reset({
        from_date: formatDateOrTime({ input: emp.from_date || "", type: "date" }),
        to_date: formatDateOrTime({ input: emp?.to_date, type: "date" }),

        discount_value: emp.discount_value,
        discount_type: discount_type,
        service_id: { label: emp?.service?.name, value: emp?.service?.id },
      });
    }
  }, [isEdit, data, reset, isShow, isAdd]);
  const onSubmit = async formData => {
    try {
      const payload = {
        ...formData,

        service_id: formData.service_id?.value,
        discount_type: formData.discount_type?.value,
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

  const TITLE = isAdd ? t("offers.add") : isShow ? t("offers.show") : t("offers.edit");

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
            <ControlledTimeField
              name="from_date"
              control={control}
              placeholder={t("offers.from")}
              errors={errors.from_date}
              disable={isShow}
            />
            <ControlledTimeField
              name="to_date"
              control={control}
              placeholder={t("offers.to")}
              errors={errors.to_date}
              disable={isShow}
            />
            <SelectField
              name="discount_type"
              control={control}
              options={salaryType}
              placeholder={t("voucher.discount_type")}
              error={errors.discount_type?.message}
              disabled={isShow}
            />
            <Input
              name="discount_value"
              control={control}
              placeholder={t("voucher.discount_value")}
              disable={isShow}
              error={errors.discount_value?.message}
              isNumberWithCommas
            />

            <SelectField
              name="service_id"
              control={control}
              options={services}
              loading={isLoadingServices}
              disabled={isShow}
              placeholder={t("booking.service")}
              error={errors.service_id?.message}
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

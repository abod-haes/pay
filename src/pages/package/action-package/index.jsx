/* eslint-disable indent */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import { handleBackendErrors } from "@/utils/helpers";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import { decryptId } from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import { apis } from "@/apis/unit/api";
import { useUnitQueries } from "@/apis/unit/query";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
function resetFormFields(reset, dataToReset) {
  reset({
    name: dataToReset?.name,
  });
}
export default function ActionPackage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  // حالة إضافة
  const isAdd = location.pathname.endsWith("/add");

  // حالة عرض
  // const isShow = query.get("show") === "true";
  const { data } = useUnitQueries.GetOne({ id });

  // حالة تعديل
  // const id = encryptedId ? decryptId(encryptedId) : null;
  const isEdit = Boolean(id);
  const validationSchema = yup.object().shape({
    name: yup.string().required(t("validation.required")),
  });
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
    },
  });

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
      };
      clearErrors();
      if (!isAdd) {
        const response = await apis.update({ id, payload: dataToSend });
        showSuccess(response?.data?.message);
      } else {
        const response = await apis.add({ payload: dataToSend });
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

  const TITLE = isAdd
    ? t("package.add")
    : // : isShow
      // ? t("staff.view-employee")
      t("package.edit");

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
      component: <SecondaryButton text={t("common.cancel2")} onClick={handleCancel} />,
    },
  ];

  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/branches" />
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <Input
              name="name"
              control={control}
              placeholder={t("package.name")}
              error={errors.name?.message}
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

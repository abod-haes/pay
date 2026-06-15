/* eslint-disable no-nested-ternary */
import React, { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import TextAreaField from "@/components/shared/textArea";
import { apis } from "@/apis/department/api";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import { decryptId, handleBackendErrors } from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import * as yup from "yup";
import { DepartmentsQueries } from "@/apis/department/query";
import { yupResolver } from "@hookform/resolvers/yup";
import LoadingSection from "@/components/loadingSection";

const getDefaultValues = (data, isAdd) => {
  if (isAdd) {
    return {
      name: "",
      notes: "",
    };
  }

  return {
    name: data?.name || "",
    notes: data?.notes || "",
  };
};

export default function ActionDepartment() {
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
  const { data, isLoading } = DepartmentsQueries.GetOne({ id });

  const validationSchema = yup.object().shape({
    name: yup.string().required(t("validation.required")),
  });

  const departmentData = data?.data?.data;

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: getDefaultValues(departmentData, isAdd),
  });

  // Reset form when data changes
  useEffect(() => {
    if ((isEdit || isShow) && departmentData) {
      reset({
        name: departmentData.name || "",
        notes: departmentData.notes || "",
      });
    }
  }, [departmentData, isEdit, isShow, reset]);

  const onSubmit = async data => {
    try {
      const dataToSend = {
        name: data.name,
        notes: data.notes,
      };
      clearErrors();
      if (!isAdd) {
        const response = await apis.update({ id, payload: dataToSend });
        showSuccess(response.data?.message);
      } else {
        const response = await apis.add({ id, payload: dataToSend });
        showSuccess(response.data?.message);
      }
      navigate(-1);
    } catch (error) {
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const TITLE = isAdd ? t("department.add") : isShow ? t("department.show") : t("department.edit");

  const BUTTONSLIST = [
    {
      show: !isShow,
      component: (
        <PrimaryButton
          text={!isAdd ? t("complaints.save2") : t("common.add")}
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
      <BreadCrumb isAdd title={TITLE} link="/department" />
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <LoadingSection isLoading={isLoading} />
          <div className="grid grid-cols-1  gap-6 md:w-[50%]">
            <Input
              name="name"
              control={control}
              placeholder={t("department.name")}
              disable={isShow}
              error={errors.name?.message}
            />
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

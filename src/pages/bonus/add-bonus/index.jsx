/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable comma-dangle */
import React, { useMemo, useEffect } from "react";
import BreadCrumb from "@/components/breadcrumb";
import Card from "@/components/card";
import SelectField from "@/components/shared/select";
import Input from "@/components/shared/input";
import TextAreaField from "@/components/shared/textArea";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import { useForm } from "react-hook-form";
import { showSuccess } from "@/libs/react.toastify";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useEmployeeQueries } from "@/apis/employee/query";
import { apis } from "@/apis/rewards/api";
import { handleBackendErrors } from "@/utils/helpers";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Calender from "@assets/svgs/common/calendar.svg";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import { useSearchParams } from "react-router-dom";
import { useRewardsQueries } from "@/apis/rewards/query";

export default function AddBonus() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  // حالة إضافة
  const isAdd = location.pathname.endsWith("/add");

  // حالة عرض
  const isShow = query.get("show") === "true";

  // حالة تعديل
  const isEdit = Boolean(id);
  const { data: rewardData } = useRewardsQueries.GetOne({ id });
  const employeeId = searchParams.get("employee_id");
  const employeeName = searchParams.get("employee_name");
  const { data, isLoading } = useEmployeeQueries.GetAll({ per_page: null, page: null });
  const validationSchema = yup.object().shape({
    user_id: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.number().required(),
      })
      .required(t("validation.required")),
    value: yup.string().required(t("validation.required")),
    date: yup.string().required(t("validation.required")),
  });
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      user_id: null,
      value: "",
      notes: "",
      date: "",
    },
  });
  useEffect(() => {
    if (employeeId && employeeName) {
      setValue("user_id", {
        value: parseInt(employeeId),
        label: decodeURIComponent(employeeName),
      });
    }
  }, [employeeId, employeeName, setValue]);

  const employeeNameOptions = useMemo(
    () =>
      data?.data?.map(employee => ({
        label: employee.full_name,
        value: employee.id,
      })) || [],
    [data?.data]
  );
  useEffect(() => {
    if ((isEdit || isShow) && rewardData?.data) {
      const emp = rewardData.data?.data;

      const employeeOption = emp.user
        ? {
            label: emp.user.full_name,
            value: emp.user.id,
          }
        : null;

      reset({
        user_id: employeeOption,
        value: emp.value || "",
        notes: emp.notes || "",
        date: emp.date || "",
      });
    }
  }, [isEdit, isShow, rewardData, reset]);
  const onSubmit = async formData => {
    try {
      const dataToSend = {
        user_id: formData.user_id?.value,
        value: formData.value,
        notes: formData.notes,
        date: formData.date,
      };
      let res;
      if (!isAdd) {
        res = await apis.update({ id, payload: dataToSend });
      } else {
        res = await apis.add({ payload: dataToSend });
      }

      showSuccess(res.data?.message);

      navigate(-1);
    } catch (error) {
      handleBackendErrors({ error, setError });
    }
  };
  const handleCancel = () => {
    navigate(-1);
  };
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
  const TITLE = isAdd ? t("bonus.add") : isShow ? t("bonus.show") : t("bonus.edit");
  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link={"/bonus"} />
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:w-[50%]">
          <div className="flex flex-col gap-6">
            <SelectField
              name="user_id"
              control={control}
              options={employeeNameOptions}
              placeholder={t("staff.employee")}
              loading={isLoading}
              error={errors.user_id?.message}
              disabled={isShow || employeeId}
            />
            <Input
              name="value"
              control={control}
              placeholder={t("bonus.value")}
              error={errors.value?.message}
              disable={isShow}
            />
            <ControlledTimeField
              name="date"
              placeholder={t("delayed.date")}
              control={control}
              errors={errors.date}
              max={new Date(Date.now())}
              icon={Calender}
              disable={isShow}
            />
            <TextAreaField
              name="notes"
              {...register("notes")}
              control={control}
              placeholder={t("common.reason")}
              rows={3}
              error={errors.notes?.message}
              disable={isShow}
            />
            <CustomFlexButtons
              gap="gap-4"
              justify="justify-start"
              reverse={false}
              buttons={BUTTONSLIST}
            />
          </div>
        </form>
      </Card>
    </div>
  );
}

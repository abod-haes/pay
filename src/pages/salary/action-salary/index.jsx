/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import TextAreaField from "@/components/shared/textArea";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import { useSalariesQueries } from "@/apis/salary/query";
import { apis } from "@/apis/salary/api";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { handleBackendErrors } from "@/utils/helpers";
import { formatDateOrTime } from "@/utils/helpers";

export default function SalaryForm() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const isEdit = Boolean(id);
  const isShow = Boolean(query.get("show") === "true");
  const { data: responseData } = useSalariesQueries.GetOne({ id });

  const [userId, setUserId] = useState(null);

  const schema = yup.object().shape({
    value: yup.string().required(t("validation.required")),
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    register,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      user_id: "",
      full_name: "",
      value: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isEdit && responseData?.data) {
      const salaryData = responseData.data?.data;
      const user_id = salaryData.user?.id;

      setUserId(user_id);

      reset({
        user_id: user_id,
        full_name: salaryData.user?.full_name || "",
        value: salaryData.current || "",
        notes: salaryData.notes || "",
      });
    }
  }, [isEdit, responseData, reset, id]);

  const onSubmit = async formData => {
    try {
      const payload = {
        user_id: userId,
        value: formData.value,
        notes: formData.notes,
      };

      if (isEdit && userId) {
        const res = await apis.add({ payload });
        showSuccess(res?.data?.message);
        navigate(-1);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const TITLE = isShow ? t("salary.details") : isEdit ? t("salary.edit") : "";
  const BUTTONSLIST = [
    {
      show: !isShow,
      component: (
        <PrimaryButton
          text={t("common.save")}
          type="submit"
          isSubmitting={isSubmitting}
          disabled={!userId}
        />
      ),
    },
    { show: true, component: <SecondaryButton text={t("common.cancel")} onClick={handleCancel} /> },
  ];

  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/salary" />
      <Card otherStyle={"!w-[80%] mb-8"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="full_name"
              control={control}
              placeholder={t("employee.name")}
              error={errors.full_name?.message}
              disabled={true}
              readOnly={true}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="value"
              control={control}
              placeholder={t("salary.salary")}
              error={errors.value?.message}
              disable={isShow}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextAreaField
              {...register("notes")}
              placeholder={t("salary.reason")}
              rows={3}
              variant="white"
              disabled={isShow}
            />
          </div>
          <CustomFlexButtons
            gap="gap-4"
            justify="justify-start"
            reverse={false}
            buttons={BUTTONSLIST}
            disabled={isShow}
          />
        </form>
      </Card>

      {responseData?.data?.data.salary_logs && responseData.data.data.salary_logs.length > 0 && (
        <Card otherStyle={"max-md:!w-full !w-[80%]"}>
          <div className="flex flex-col gap-4">
            <p className="font-main text-[#333333] text-[0.875rem]">{t("salary.record")}</p>

            {responseData.data.data.salary_logs.map((log, index) => (
              <div key={log.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <p className="font-main text-primary text-[0.875rem]">
                  {formatDateOrTime({ input: log.created_at, type: "date" })}
                </p>
                <p className="font-main text-accent text-[0.875rem]">
                  {log.old
                    ? `${t("salary.initial_salary")} ${log.old} ${t("common.to")} ${log.current}`
                    : `${t("salary.initial_salary")}: ${log.current}`}
                  {log.notes && ` - ${log.notes}`}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

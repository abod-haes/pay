/* eslint-disable curly */
/* eslint-disable comma-dangle */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm, useWatch } from "react-hook-form";
import Input from "@/components/shared/input";
import TextAreaField from "@/components/shared/textArea";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import { decryptId } from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import Calender from "@assets/svgs/common/calendar.svg";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import { apis } from "@/apis/holiday/api";
import { handleBackendErrors } from "@/utils/helpers";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useHolidayQueries } from "@/apis/holiday/query";
import SelectField from "@/components/shared/select";
import { useEmployeeQueries } from "@/apis/employee/query";
export default function ActionHoliday() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  // حالة إضافة
  const isAdd = location.pathname.endsWith("/add");

  // حالة عرض
  const isShow = Boolean(query.get("show") === "true");

  // حالة تعديل
  //const id = encryptedId ? decryptId(encryptedId) : null;
  const isEdit = Boolean(id) && !isShow;
  const { data: userData, isLoading: isLoadingUser } = useEmployeeQueries.GetAll({
    per_page: null,
    page: null,
    search: null,
    target: null,
    city_id: null,
  });
  const { data: holidayData } = useHolidayQueries.GetOne({ id });
  const schema = yup.object().shape({
    user_id: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.number().required(),
      })
      .required(t("validation.required")),
    start_date: yup.string().required(t("validation.required")),
    end_date: yup
      .string()
      .required(t("validation.required"))
      .test("is-after-or-equal", t("validation.start_date_after_appointment"), function (value) {
        const { appointment_date } = this.parent;
        if (!appointment_date || !value) return true;

        return new Date(value) >= new Date(appointment_date);
      }),
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
      user_id: null,
      start_date: "",
      end_date: "",

      description: "",
    },
  });
  const employeeOptions = useMemo(
    () =>
      userData?.data?.map(role => ({
        label: role.full_name,
        value: role.id,
      })) || [],
    [userData?.data]
  );
  useEffect(() => {
    if ((isEdit || isShow) && holidayData?.data) {
      const emp = holidayData.data;

      const patientOption = emp.user ? { label: emp.user.full_name, value: emp.user.id } : null;

      reset({
        user_id: patientOption,
        start_date: emp.start_date || "",
        end_date: emp.end_date || "",

        description: emp.description || "",
      });
    }
  }, [isEdit, holidayData, reset]);
  const onSubmit = async formData => {
    try {
      const payload = {
        ...formData,
        user_id: formData.user_id?.value,
      };

      let res;
      if (!isAdd) {
        res = await apis.update({ id, payload });
      } else {
        res = await apis.add({ payload });
      }

      showSuccess(res.data?.message);
      navigate(-1);
    } catch (error) {
      console.error("Error submitting form:", error);
      handleBackendErrors({ error, setError });
    }
  };
  const handleCancel = () => {
    navigate(-1);
  };

  const TITLE = isAdd ? t("holiday.add") : isShow ? t("holiday.show") : t("holiday.edit");

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
      <div className="w-[80%]">
        <BreadCrumb isAdd title={TITLE} link="/holiday" />
      </div>
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SelectField
              name="user_id"
              control={control}
              placeholder={t("common.name")}
              error={errors.user_id?.message}
              disabled={isShow}
              options={employeeOptions}
              loading={isLoadingUser}
            />
            <ControlledTimeField
              name="start_date"
              control={control}
              placeholder={t("holiday.startDate")}
              errors={errors.start_date}
              icon={Calender}
              disable={isShow}
            />
            <ControlledTimeField
              name="end_date"
              control={control}
              placeholder={t("holiday.endDate")}
              errors={errors.end_date}
              icon={Calender}
              disable={isShow}
            />
          </div>

          <TextAreaField
            {...register("description")}
            placeholder={t("common.reason")}
            rows={3}
            variant="white"
            disabled={isShow}
            error={errors.description?.name}
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
}

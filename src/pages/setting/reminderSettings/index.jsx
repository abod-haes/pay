import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLocation } from "react-router-dom";

import Input from "@/components/shared/input";
import PrimaryButton from "@/components/shared/primaryButton";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { showSuccess } from "@/libs/react.toastify";
import { useSettingsQueries } from "@/apis/setting/query";
import { apis } from "@/apis/setting/api";
import { handleBackendErrors } from "@/utils/helpers";

const reminderFields = [
  {
    name: "examination_booking_reminder_days",
    title: "عدد الأيام قبل التنبيه لوجود معاينة بدون حجز",
    description: "يُستخدم لتنبيه الفريق عند وجود معاينة لم تتحول إلى حجز خلال عدد الأيام المحدد.",
  },
  {
    name: "booking_attendance_reminder_days",
    title: "عدد الأيام قبل التنبيه لعدم حضور المريض بعد الحجز",
    description: "يُستخدم لتنبيه الفريق عند عدم حضور المريض بعد الحجز حسب عدد الأيام المحدد.",
  },
  {
    name: "surgery_attendance_reminder_days",
    title: "عدد الأيام قبل التنبيه لعدم حضور المريض للعملية",
    description: "يُستخدم لتنبيه الفريق عند عدم حضور المريض للعملية خلال عدد الأيام المحدد.",
  },
];

const validationSchema = yup.object().shape(
  reminderFields.reduce((schema, field) => {
    schema[field.name] = yup
      .number()
      .typeError("يرجى إدخال رقم صحيح")
      .min(0, "يجب أن يكون الرقم 0 أو أكبر")
      .integer("يرجى إدخال عدد أيام صحيح")
      .required("هذا الحقل مطلوب");

    return schema;
  }, {})
);

export default function ReminderSettings() {
  const location = useLocation();
  const domain = location.state?.domain || window.location.hostname;
  const { data, refetch } = useSettingsQueries.GetAll({ domain_name: domain });

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      examination_booking_reminder_days: "",
      booking_attendance_reminder_days: "",
      surgery_attendance_reminder_days: "",
    },
  });

  useEffect(() => {
    const settings = data?.data;

    if (!settings) return;

    reset({
      examination_booking_reminder_days: settings.examination_booking_reminder_days ?? "",
      booking_attendance_reminder_days: settings.booking_attendance_reminder_days ?? "",
      surgery_attendance_reminder_days: settings.surgery_attendance_reminder_days ?? "",
    });
  }, [data, reset]);

  const onSubmit = async formData => {
    try {
      const payload = {
        ...formData,
        domain_name: domain,
      };

      const res = await apis.update({ payload });
      showSuccess(res.data?.message || "تم حفظ إعدادات التنبيهات بنجاح");
      refetch?.();
    } catch (error) {
      handleBackendErrors({ error, setError });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-5 lg:w-[80%]">
      <div className="flex justify-end">
        <Can group={PERMISSION_GROUP.Setting} type={PERMISSION_ACTION.update}>
          <PrimaryButton text="حفظ إعدادات التنبيهات" type="submit" isSubmitting={isSubmitting} />
        </Can>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 border-b border-[#E5EDF2] pb-4">
          <h2 className="font-main text-[1.05rem] text-[#1F2937]">إعدادات تنبيهات الحجوزات والمعاينات</h2>
          <p className="mt-2 text-[0.82rem] leading-6 text-accent">
            حدّد عدد الأيام التي يعتمد عليها النظام لإظهار التنبيهات الخاصة بالمعاينات والحجوزات والعمليات.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {reminderFields.map(field => (
            <div
              key={field.name}
              className="grid grid-cols-1 gap-4 rounded-2xl border border-[#E6EFF4] bg-[#FBFEFF] p-5 lg:grid-cols-[1fr_260px] lg:items-center"
            >
              <div>
                <h3 className="font-main text-[0.92rem] text-[#233047]">{field.title}</h3>
                <p className="mt-2 text-[0.78rem] leading-6 text-accent">{field.description}</p>
                <p className="mt-1 text-[0.72rem] text-primary">{field.name}</p>
              </div>

              <Input
                name={field.name}
                control={control}
                type="number"
                min="0"
                placeholder="عدد الأيام"
                label="عدد الأيام"
                error={errors[field.name]?.message}
                otherInputStyle="text-center font-main"
              />
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

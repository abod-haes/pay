import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Input from "@/components/shared/input";
import PrimaryButton from "@/components/shared/primaryButton";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { showSuccess } from "@/libs/react.toastify";
import { useSettingsQueries } from "@/apis/setting/query";
import { apis } from "@/apis/setting/api";
import { handleBackendErrors } from "@/utils/helpers";

const reminderFields = [
  "examination_booking_reminder_days",
  "booking_attendance_reminder_days",
  "surgery_attendance_reminder_days",
];

const reminderTexts = {
  ar: {
    save: "حفظ إعدادات التنبيهات",
    saved: "تم حفظ إعدادات التنبيهات بنجاح",
    title: "إعدادات تنبيهات الحجوزات والمعاينات",
    description:
      "حدّد عدد الأيام التي يعتمد عليها النظام لإظهار التنبيهات الخاصة بالمعاينات والحجوزات والعمليات.",
    daysLabel: "عدد الأيام",
    daysPlaceholder: "عدد الأيام",
    validation: {
      number: "يرجى إدخال رقم صحيح",
      min: "يجب أن يكون الرقم 0 أو أكبر",
      integer: "يرجى إدخال عدد أيام صحيح",
      required: "هذا الحقل مطلوب",
    },
    fields: {
      examination_booking_reminder_days: {
        title: "عدد الأيام قبل التنبيه لوجود معاينة بدون حجز",
        description:
          "يُستخدم لتنبيه الفريق عند وجود معاينة لم تتحول إلى حجز خلال عدد الأيام المحدد.",
      },
      booking_attendance_reminder_days: {
        title: "عدد الأيام قبل التنبيه لعدم حضور المريض بعد الحجز",
        description: "يُستخدم لتنبيه الفريق عند عدم حضور المريض بعد الحجز حسب عدد الأيام المحدد.",
      },
      surgery_attendance_reminder_days: {
        title: "عدد الأيام قبل التنبيه لعدم حضور المريض للعملية",
        description: "يُستخدم لتنبيه الفريق عند عدم حضور المريض للعملية خلال عدد الأيام المحدد.",
      },
    },
  },
  en: {
    save: "Save reminder settings",
    saved: "Reminder settings saved successfully",
    title: "Booking and examination reminder settings",
    description:
      "Set how many days the system uses to show reminders for examinations, bookings, and surgeries.",
    daysLabel: "Number of days",
    daysPlaceholder: "Number of days",
    validation: {
      number: "Please enter a valid number",
      min: "The number must be 0 or greater",
      integer: "Please enter a valid number of days",
      required: "This field is required",
    },
    fields: {
      examination_booking_reminder_days: {
        title: "Days before reminding about an examination without booking",
        description:
          "Used to alert the team when an examination has not turned into a booking within the selected number of days.",
      },
      booking_attendance_reminder_days: {
        title: "Days before reminding about patient no-show after booking",
        description:
          "Used to alert the team when a patient does not attend after a booking within the selected number of days.",
      },
      surgery_attendance_reminder_days: {
        title: "Days before reminding about surgery no-show",
        description:
          "Used to alert the team when a patient does not attend the surgery within the selected number of days.",
      },
    },
  },
  fa: {
    save: "ذخیره تنظیمات یادآوری‌ها",
    saved: "تنظیمات یادآوری‌ها با موفقیت ذخیره شد",
    title: "تنظیمات یادآوری رزروها و معاینات",
    description:
      "تعداد روزهایی را تعیین کنید که سیستم برای نمایش یادآوری‌های مربوط به معاینات، رزروها و عمل‌ها استفاده می‌کند.",
    daysLabel: "تعداد روزها",
    daysPlaceholder: "تعداد روزها",
    validation: {
      number: "لطفاً یک عدد معتبر وارد کنید",
      min: "عدد باید ۰ یا بیشتر باشد",
      integer: "لطفاً تعداد روز معتبر وارد کنید",
      required: "این فیلد الزامی است",
    },
    fields: {
      examination_booking_reminder_days: {
        title: "تعداد روزها قبل از یادآوری معاینه بدون رزرو",
        description:
          "برای هشدار به تیم زمانی استفاده می‌شود که یک معاینه در تعداد روز مشخص‌شده به رزرو تبدیل نشده باشد.",
      },
      booking_attendance_reminder_days: {
        title: "تعداد روزها قبل از یادآوری عدم حضور بیمار پس از رزرو",
        description:
          "برای هشدار به تیم زمانی استفاده می‌شود که بیمار پس از رزرو در تعداد روز مشخص‌شده حضور پیدا نکند.",
      },
      surgery_attendance_reminder_days: {
        title: "تعداد روزها قبل از یادآوری عدم حضور بیمار برای عمل",
        description:
          "برای هشدار به تیم زمانی استفاده می‌شود که بیمار در تعداد روز مشخص‌شده برای عمل حضور پیدا نکند.",
      },
    },
  },
};

const getReminderTexts = language => reminderTexts[language] || reminderTexts.ar;

export default function ReminderSettings() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const texts = getReminderTexts(i18n.language);
  const domain = location.state?.domain || window.location.hostname;
  const { data, refetch } = useSettingsQueries.GetAll({ domain_name: domain });

  const validationSchema = useMemo(
    () =>
      yup.object().shape(
        reminderFields.reduce((schema, fieldName) => {
          schema[fieldName] = yup
            .number()
            .typeError(texts.validation.number)
            .min(0, texts.validation.min)
            .integer(texts.validation.integer)
            .required(texts.validation.required);

          return schema;
        }, {})
      ),
    [texts]
  );

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
      showSuccess(res.data?.message || texts.saved);
      refetch?.();
    } catch (error) {
      handleBackendErrors({ error, setError });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-5 lg:w-[80%]">
      <div className="flex justify-end">
        <Can group={PERMISSION_GROUP.Setting} type={PERMISSION_ACTION.update}>
          <PrimaryButton text={texts.save} type="submit" isSubmitting={isSubmitting} />
        </Can>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 border-b border-[#E5EDF2] pb-4">
          <h2 className="font-main text-[1.05rem] text-[#1F2937]">{texts.title}</h2>
          <p className="mt-2 text-[0.82rem] leading-6 text-accent">{texts.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {reminderFields.map(fieldName => {
            const field = texts.fields[fieldName];

            return (
              <div
                key={fieldName}
                className="grid grid-cols-1 gap-4 rounded-2xl border border-[#E6EFF4] bg-[#FBFEFF] p-5 lg:grid-cols-[1fr_260px] lg:items-center"
              >
                <div>
                  <h3 className="font-main text-[0.92rem] text-[#233047]">{field.title}</h3>
                  <p className="mt-2 text-[0.78rem] leading-6 text-accent">{field.description}</p>
                  <p className="mt-1 text-[0.72rem] text-primary">{fieldName}</p>
                </div>

                <Input
                  name={fieldName}
                  control={control}
                  type="number"
                  min="0"
                  placeholder={texts.daysPlaceholder}
                  label={texts.daysLabel}
                  error={errors[fieldName]?.message}
                  otherInputStyle="text-center font-main"
                />
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
}

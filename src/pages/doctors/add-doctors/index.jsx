/* eslint-disable curly */
/* eslint-disable comma-dangle */
/* eslint-disable indent */
/* eslint-disable complexity */
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm, useWatch } from "react-hook-form";
import Input from "@/components/shared/input";
import SelectField from "@/components/shared/select";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import FileUploader from "@/components/shared/fileUploader";
import Calender from "@assets/svgs/common/calendar.svg";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import { apis } from "@/apis/employee/api";
import * as yup from "yup";
import { DepartmentsQueries } from "@/apis/department/query";
import { jobTitleQueries } from "@/apis/jobTitle/query";
import { useRolesQueries } from "@/apis/roles/query";
import { yupResolver } from "@hookform/resolvers/yup";
import { handleBackendErrors } from "@/utils/helpers";
import { useEmployeeQueries } from "@/apis/employee/query";
import PhoneNumber from "@/components/phoneNumber";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import { formatDateOrTime } from "@/utils/helpers";
export const getCountryByCallingCode = code => {
  const countries = getCountries();
  return countries.find(c => getCountryCallingCode(c) === String(code));
};
const AddDoctor = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [previousSalaryType, setPreviousSalaryType] = useState(null);
  const [phoneNumberReady, setPhoneNumberReady] = useState(false);

  const location = useLocation();
  // حالة إضافة
  const isAdd = location.pathname.endsWith("/add");
  // حالة تعديل

  const isEdit = Boolean(id);
  const {
    data: employeeData,
    isLoading: isLoadingEmployee,
    refetch,
  } = useEmployeeQueries.GetOne({
    id: isEdit ? id : null,
  });
  const employee = employeeData?.data;

  const schema = yup.object().shape({
    full_name: yup.string().required(t("validation.required")),
    phone_number: yup.string().required(t("validation.required")),
    appointment_date: yup.string().required(t("validation.required")),
    start_date: yup
      .string()
      .required(t("validation.required"))
      .test("is-after-or-equal", t("validation.start_date_after_appointment"), function (value) {
        const { appointment_date } = this.parent;
        if (!appointment_date || !value) return true;

        return new Date(value) >= new Date(appointment_date);
      }),
    // address: yup.string().required(t("validation.required")),
    username: yup.string().required(t("validation.required")),
    password: isAdd ? yup.string().required(t("validation.required")) : yup.string(),
    role_id: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.number().required(),
      })
      .required(t("validation.required")),
    salary_type: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .required(t("validation.required")),
    salary: yup
      .string()
      .test("salary-required", t("validation.required"), function (value) {
        const { salary_type } = this.parent;

        // If salary type is wageless, salary is not required
        if (salary_type?.value === "wageless") {
          return true;
        }

        // For other salary types, salary is required
        return !!value;
      })
      .test("salary-validation", function (value) {
        const { salary_type } = this.parent;

        // If no value and wageless, it's valid
        if (!value && salary_type?.value === "wageless") return true;

        // If no value for other types, skip this validation (will be caught by required test)
        if (!value) return true;

        const numericValue = parseFloat(value.replace(/,/g, ""));

        if (isNaN(numericValue)) {
          return this.createError({ message: t("validation.invalid_number") });
        }

        if (salary_type?.value === "percentage") {
          if (numericValue > 100) {
            return this.createError({ message: t("validation.salary_percentage_max") });
          }
        }

        if (salary_type?.value === "monthly" && numericValue <= 0) {
          return this.createError({ message: t("validation.salary_positive") });
        }

        return true;
      }),
    type: yup.string().required(t("validation.required")),
    start_time: yup.string().required(t("validation.required")),
    end_time: yup
      .string()
      .required(t("validation.required"))
      .test("is-after-start", t("validation.end_time_after_start"), function (value) {
        const { start_time } = this.parent;
        if (!start_time || !value) return true;

        const [startHours, startMinutes] = start_time.split(":").map(Number);
        const [endHours, endMinutes] = value.split(":").map(Number);

        if (endHours > startHours) {
          return true;
        } else if (endHours === startHours) {
          return endMinutes > startMinutes;
        }
        return false;
      }),
    shift_type: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .required(t("validation.required")),
  });

  const { data: departmentData, isLoading: isLoadingDepartment } = DepartmentsQueries.GetAll({
    per_page: null,
  });
  const { data: jobTitleData, isLoading: isLoadingjobTitle } = jobTitleQueries.GetAll({
    per_page: null,
  });
  const { data: rolesData, isLoading: isLoadingRole } = useRolesQueries.GetAll({
    per_page: null,
    page: null,
  });

  const departmentOptions = departmentData?.data?.map(item => ({
    label: item.name,
    value: item.id,
  }));
  const jobTitleOptions = jobTitleData?.data?.map(item => ({
    label: item.name,
    value: item.id,
  }));

  const roleOptions = useMemo(
    () =>
      rolesData?.data?.map(role => ({
        label: role.name,
        value: role.id,
      })) || [],
    [rolesData?.data]
  );

  const {
    control,
    register,

    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      full_name: "",
      phone_number: "",
      department_id: null,
      job_title_id: null,
      appointment_date: "",
      start_date: "",
      address: "",
      username: "",
      password: "",
      role_id: null,
      salary_type: null,
      salary: "",
      start_time: "",
      end_time: "",
      type: t("staff.Tunisian"),
      shift_type: null,
      notes: "",
      country_code: "964",
    },
  });

  useEffect(() => {
    if (isEdit && id && !isAdd) {
      if (employeeData?.data?.country_code) {
        setPhoneNumberReady(true);
      }
    } else {
      setPhoneNumberReady(true);
    }
  }, [id, isAdd, isEdit, employeeData?.data, reset]);
  const watchedSalaryType = useWatch({ control, name: "salary_type" });
  useEffect(() => {
    if (
      watchedSalaryType &&
      previousSalaryType &&
      watchedSalaryType.value !== previousSalaryType.value
    ) {
      setValue("salary", "");
      setPreviousSalaryType(watchedSalaryType);
    } else if (watchedSalaryType && !previousSalaryType) {
      setPreviousSalaryType(watchedSalaryType);
    }
  }, [watchedSalaryType, previousSalaryType, setValue]);

  // Dynamic salary field label based on salary type
  const salaryFieldLabel = useMemo(() => {
    if (!watchedSalaryType?.value) return t("staff.salary_value");

    switch (watchedSalaryType.value) {
      case "percentage":
        return t("staff.percentage_value");
      case "wageless":
        return t("staff.wage_value");
      default:
        return t("staff.salary_value");
    }
  }, [watchedSalaryType, t]);
  useEffect(() => {
    if (isEdit && employeeData?.data) {
      const emp = employeeData.data;
      const formatTimeForInput = timeString => {
        if (!timeString) return "";

        if (timeString.match(/^\d{2}:\d{2}$/)) {
          return timeString;
        }

        if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
          return timeString.substring(0, 5);
        }

        try {
          const date = new Date(`2000-01-01T${timeString}`);
          if (!isNaN(date.getTime())) {
            return date.toTimeString().substring(0, 5);
          }
        } catch (e) {
          console.warn("Failed to parse time:", timeString);
        }

        return "";
      };
      const departmentOption = emp.department
        ? { label: emp.department.name, value: emp.department.id }
        : null;

      const jobTitleOption = emp.job_title
        ? { label: emp.job_title.name, value: emp.job_title.id }
        : null;

      const roleOption = emp.role ? { label: emp.role.name, value: emp.role.id } : null;

      const salaryTypeOption = salaryType.find(
        option => option.value.toLowerCase() === emp.salary_type?.toLowerCase()
      );

      const shiftTypeOption = shiftType.find(option => option.value === emp.shift_type);

      reset({
        full_name: emp.full_name || "",
        phone_number: emp.phone_number || "",
        department_id: departmentOption,
        job_title_id: jobTitleOption,
        appointment_date: formatDateOrTime({ input: emp.appointment_date, type: "date" }),
        start_date: formatDateOrTime({ input: emp.start_date, type: "date" }),
        start_time: formatTimeForInput(emp.start_time),
        end_time: formatTimeForInput(emp.end_time),
        address: emp.address || "",
        username: emp.username || "",
        password: "",
        role_id: roleOption,
        salary_type: salaryTypeOption,
        salary: emp.salary?.value || "",
        type: t("doctors.doctor"),
        notes: emp.notes,
        country_code: emp.country_code || null,

        shift_type: shiftTypeOption,
      });

      setPreviousSalaryType(salaryTypeOption);
      if (emp.attachments?.length) {
        const formattedFiles = emp.attachments.map(file => ({
          id: file.id, // id من السيرفر
          name: file.name, // اسم الملف
          type: file.mime_type, // نوع الملف
          url: file.url, // رابط مباشر
          uploading: false,
          media_id: file.id, // نخزن media_id للإرسال لاحقاً
        }));

        setFiles(formattedFiles);
      }
    }
  }, [isEdit, employeeData, reset]);

  const salaryType = [
    {
      label: t("employee.monthly"),
      value: "monthly",
    },
    {
      label: t("employee.percentage"),
      value: "percentage",
    },
    {
      label: t("employee.wageless"),
      value: "wageless",
    },
  ];

  const shiftType = [
    { label: t("shift.morning"), value: "morning" },
    { label: t("shift.afternoon"), value: "afternoon" },
    { label: t("shift.night"), value: "night" },
    { label: t("shift.flexible"), value: "flexible" },
  ];
  // eslint-disable-next-line complexity
  const onSubmit = async formData => {
    try {
      const payload = {
        ...formData,
        type: "doctor",
        salary_type: formData.salary_type?.value,
        role_id: formData.role_id?.value,
        department_id: formData.department_id?.value,
        job_title_id: formData.job_title_id?.value,
        shift_type: formData.shift_type?.value,
        attachments_ids: files.map(f => f.media_id),
      };

      if (isEdit && formData.username === employee?.username) {
        delete payload.username;
      }

      if (isEdit && !formData.password) {
        delete payload.password;
      }

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
  const handleRemoveFile = file => {
    setFiles(prev => prev.filter(f => f.id !== file.id));
  };
  const handleCancel = () => {
    navigate(-1);
  };

  const TITLE = isAdd
    ? t("doctors.add-doctor")
    : // : isShow
      // ? t("staff.view-employee")
      t("doctors.edit-doctor");

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
      <BreadCrumb isAdd title={TITLE} />
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              name="full_name"
              control={control}
              placeholder={t("common.name")}
              error={errors.full_name?.message}
            />

            {phoneNumberReady && (
              <PhoneNumber
                control={control}
                defaultCountry={getCountryByCallingCode(employeeData?.data?.country_code) || "IQ"}
                name={"phone_number"}
                phoneName={"country_code"}
                placeholder={t("common.phone-number")}
                register={register}
                errors={errors.phone_number?.message}
              />
            )}
            <SelectField
              name="department_id"
              control={control}
              options={departmentOptions}
              placeholder={t("staff.department")}
              loading={isLoadingDepartment}
              error={errors.department_id?.message}
            />
            <SelectField
              name="job_title_id"
              control={control}
              placeholder={t("staff.job-title")}
              options={jobTitleOptions}
              error={errors.job_title_id?.message}
              loading={isLoadingjobTitle}
            />
            <SelectField
              name="salary_type"
              control={control}
              options={salaryType}
              placeholder={t("staff.salary_type")}
              error={errors.salary_type?.message}
            />
            <Input
              name="salary"
              control={control}
              placeholder={salaryFieldLabel}
              error={errors.salary?.message}
              isNumberWithCommas
            />
            <ControlledTimeField
              name="appointment_date"
              placeholder={t("staff.hire-date")}
              control={control}
              errors={errors.appointment_date}
              icon={Calender}
            />
            <ControlledTimeField
              name="start_date"
              control={control}
              placeholder={t("staff.start-date")}
              errors={errors.start_date}
              icon={Calender}
            />
            <ControlledTimeField
              name="start_time"
              placeholder={t("holiday.startTime")}
              control={control}
              errors={errors?.start_time}
              type="time"
            />
            <ControlledTimeField
              name="end_time"
              placeholder={t("holiday.endTime")}
              control={control}
              errors={errors?.end_time}
              type="time"
            />
            <Input
              name="address"
              control={control}
              placeholder={t("common.address")}
              error={errors.address?.message}
            />
            <Input
              name="username"
              control={control}
              placeholder={t("common.user")}
              error={errors.username?.message}
            />
            <Input
              name="password"
              control={control}
              placeholder={t("login.password")}
              error={errors.password?.message}
            />

            <SelectField
              name="role_id"
              control={control}
              options={roleOptions}
              placeholder={t("permissions.permission")}
              loading={isLoadingRole}
              error={errors.role_id?.message}
            />
            <SelectField
              name="shift_type"
              control={control}
              options={shiftType}
              placeholder={t("salary.shift")}
              error={errors.shift_type?.message}
            />
          </div>
          <div className="col-span-2">
            <Input
              name="notes"
              control={control}
              placeholder={t("common.notes")}
              error={errors.notes?.message}
            />
          </div>
          <div className="w-full lg:w-[49%]">
            <FileUploader
              files={files}
              setFiles={setFiles}
              removeFile={handleRemoveFile}
              name="files"
              control={control}
              placeholder="Upload Files"
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

export default AddDoctor;

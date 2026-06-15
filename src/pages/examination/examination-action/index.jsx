import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { Controller, useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import SelectField from "@/components/shared/select";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import { decryptId, formatDate, formatDateOrTime, handleBackendErrors } from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import usePatients from "@/hooks/usePaitients";
import { useExaminationQueries } from "@/apis/examination/query";
import useEmployees from "@/hooks/useEmployess";
import { apis } from "@/apis/examination/api";
import LoadingSection from "@/components/loadingSection";

import CalenderWIthSlot from "@/components/calenderWithSlot";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import useBookingVia from "@/hooks/useBookingia";
import { getUserData, isEmployee } from "@/utils/helpers";
import GroupRadio from "@/components/shared/checkbox/GroupRadio";
import PhoneNumber from "@/components/phoneNumber";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import RenderStatus from "@/components/statusButton";
import TextAreaField from "@/components/shared/textArea";
import i18n from "@/i18n";

export const getCountryByCallingCode = code => {
  const countries = getCountries();
  return countries.find(c => getCountryCallingCode(c) === String(code));
};

export default function ExaminationActions() {
  const navigate = useNavigate();
  const [isSelected, setIsSelected] = useState(null);
  const [selectDate, setSelectedDate] = useState(formatDate(new Date(Date.now())));
  const { t } = useTranslation();
  const { id: encryptedId } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const isAdd = location.pathname.endsWith("/add");

  const isShow = query.get("show") === "true";

  const id = encryptedId ? decryptId(encryptedId) : null;
  const isEdit = Boolean(id) && !isShow;
  const { isLoadingPatients, items } = usePatients({ available: true });
  const { isLoadingEmployees2, items: employees2 } = useEmployees({ type: "employee" });
  const [currentUser, setCurrentUser] = useState(null);
  const [isEmployeeUser, setIsEmployeeUser] = useState(false);
  const [firstPhoneNumberReady, setFirstPhoneNumberReady] = useState(false);
  const [secondPhoneNumberReady, setSecondPhoneNumberReady] = useState(false);

  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
    setIsEmployeeUser(isEmployee());
  }, []);
  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
  }, []);

  const currentUserEmployeeOption = currentUser
    ? {
        label: currentUser.full_name,
        value: currentUser.id.toString(),
      }
    : null;

  const employeeOptions = isEmployeeUser
    ? currentUserEmployeeOption
      ? [currentUserEmployeeOption]
      : []
    : employees2;
  const validationSchema = yup.object().shape({
    patient_id: yup
      .object()
      .typeError(t("validation.required"))
      .shape({
        label: yup.string().required(t("validation.required")),
        value: yup.string().required(t("validation.required")),
      })
      .required(t("validation.required")),

    booking_via: yup
      .object()
      .typeError(t("validation.required"))
      .shape({
        label: yup.string().required(t("validation.required")),
        value: yup.string().required(t("validation.required")),
      })
      .required(t("validation.required")),

    employee_id: yup
      .object()

      .shape({
        label: yup.string().required(t("validation.required")),
        value: yup.string().required(t("validation.required")),
      })
      .required(t("validation.required")),
  });

  const { isLoading, data, refetch, isRefetching } = useExaminationQueries.GetOne({ id });

  const {
    control,
    handleSubmit,
    watch,
    clearErrors,
    setError,
    reset,
    setValue,
    register,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      patient_id: null,
      booking_via: null,
      employee_id: null,
    },
  });

  const { bookingVia: bookin_via } = useBookingVia();

  useEffect(() => {
    if (items && items.length > 0 && dirtyFields?.patient_id) {
      const p = items.find(_valu => _valu.id === watch("patient_id")?.value);
      const booking_via = bookin_via.find(_valu => _valu.value === p.booking_via);

      setValue("first_phone_number", p.first_phone_number || "");
      setValue("second_phone_number", p.second_phone_number || "");
      setValue("notes", p.notes || "");
      setValue("employee_id", { label: p.employee?.full_name, value: p.employee?.id });
      setValue(
        "birth_date",
        p.birth_date
          ? (() => {
            const [y, m, d] = p.birth_date.split("T")[0].split("-").map(Number);
            return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}T12:00:00`;
          })()
          : "",
      );
      setValue("booking_via", booking_via);

      if (isAdd && p.medical_information) {
        setValue("chronic_diseases", p.medical_information.chronic_diseases ? "yes" : "no");
        setValue(
          "chronic_diseases_description",
          p.medical_information.chronic_diseases_description || ""
        );
        setValue("previous_surgery", p.medical_information.previous_surgery ? "yes" : "no");
        setValue(
          "previous_surgery_description",
          p.medical_information.previous_surgery_description || ""
        );
        setValue("drug_allergy", p.medical_information.drug_allergy ? "yes" : "no");
        setValue("drug_allergy_description", p.medical_information.drug_allergy_description || "");
      }
    }
  }, [dirtyFields?.patient_id, watch("patient_id")?.value, i18n.language]);

  useEffect(() => {
    const dataToReset = data?.data?.data;
    if ((isEdit || isShow) && id && !isAdd && dataToReset && !dirtyFields?.patient_id) {
      const dateObj = new Date(dataToReset?.date);

      const formattedDate = dateObj.toISOString().split("T")[0];

      const hours = String(dateObj.getHours()).padStart(2, "0");
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      const timeString = `${hours}:${minutes}`;
      reset({
        patient_id: {
          label: dataToReset?.patient?.full_name,
          value: dataToReset?.patient?.id,
        },
        employee_id: {
          label: dataToReset?.employee?.full_name,
          value: dataToReset?.employee?.id,
        },
        chronic_diseases: dataToReset?.medical_information?.chronic_diseases ? "yes" : "no",
        chronic_diseases_description:
          dataToReset?.medical_information?.chronic_diseases_description,
        previous_surgery: dataToReset?.medical_information?.previous_surgery ? "yes" : "no",
        previous_surgery_description:
          dataToReset?.medical_information?.previous_surgery_description,
        drug_allergy: dataToReset?.medical_information?.drug_allergy ? "yes" : "no",
        drug_allergy_description: dataToReset?.medical_information?.drug_allergy_description,
        booking_via: bookin_via?.find(item => item?.value.includes(dataToReset?.booking_via)),
        notes: dataToReset.notes,
      });

      setIsSelected(timeString);
      setSelectedDate(formattedDate);
    }
  }, [data?.data, isEdit, isAdd, isLoading, isRefetching, dirtyFields?.patient_id]);

  useEffect(() => {
    if (isEmployeeUser && currentUserEmployeeOption) {
      const currentValue = watch("employee_id");

      if (!currentValue || currentValue.value !== currentUserEmployeeOption.value) {
        setValue("employee_id", currentUserEmployeeOption, {
          shouldValidate: true,
          shouldTouch: true,
        });
      }
    }
  }, [isEmployeeUser, currentUserEmployeeOption, setValue, watch]);

  const onSubmit = async data => {
    try {
      const dataToSend = {
        patient_id: data.patient_id?.value,

        booking_via: data?.booking_via?.value,
        employee_id: data?.employee_id?.value,
        chronic_diseases: data.chronic_diseases === "yes" ? 1 : 0,
        chronic_diseases_description: data.chronic_diseases_description,
        drug_allergy: data.drug_allergy === "yes" ? 1 : 0,
        drug_allergy_description: data.drug_allergy_description,
        previous_surgery: data.previous_surgery === "yes" ? 1 : 0,
        previous_surgery_description: data.previous_surgery_description,
        first_phone_number: data.first_phone_number,
        second_phone_number: data.second_phone_number,
        notes: data.notes,
        birth_date: data.birth_date,
        date: `${formatDateOrTime({
          input: selectDate,
          type: "date",
        })} ${isSelected}`,
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

  const TITLE = isAdd
    ? t("examination.add")
    : isShow
    ? t("examination.show")
    : t("examination.edit");

  useEffect(() => {
    setFirstPhoneNumberReady(true);
    setSecondPhoneNumberReady(true);
    if (isEdit && id && !isAdd) {
      if (data?.data?.data) {
        setFirstPhoneNumberReady(true);
        setSecondPhoneNumberReady(true);
      }
    } else {
      setFirstPhoneNumberReady(true);
      setSecondPhoneNumberReady(true);
    }
  }, [id, isAdd, isEdit, data?.data?.data]);

  const BUTTONSLIST = [
    {
      show: !isShow,
      component: (
        <PrimaryButton
          text={!isAdd ? t("common.save_changes") : t("common.confirm_preview")}
          type="submit"
          disabled={!isSelected}
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
    <div className="w-full lg:w-[80%]">
      <BreadCrumb
        isAdd
        customStatus={!isAdd && RenderStatus(data?.data?.data?.status)}
        isStatue={!isLoading}
        title={TITLE}
      />
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <LoadingSection otherStyle={"h-[100%] !w-[98%]"} isLoading={isLoading} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SelectField
              name="patient_id"
              control={control}
              options={items}
              placeholder={t("booking.patient")}
              loading={isLoadingPatients}
              error={errors.patient_id?.message}
              disabled={isShow}
            />

            <SelectField
              name="booking_via"
              control={control}
              options={bookin_via}
              placeholder={t("booking.booked-by")}
              error={errors?.booking_via?.message || errors.booking_via?.value?.message}
              disabled
            />
            <Input
              control={control}
              name={"first_phone_number"}
              placeholder={t("complaints.phone1")}
              register={register}
              error={errors.first_phone_number?.message}
              type="number"
              disable={true}
            />
            <Input
              control={control}
              name={"second_phone_number"}
              placeholder={t("complaints.phone2")}
              register={register}
              error={errors.second_phone_number?.message}
              type="number"
              disable={true}
            />
            <ControlledTimeField
              name="birth_date"
              control={control}
              placeholder={t("delayed.birthday")}
              errors={errors.birth_date}
              max={new Date(new Date().setHours(0, 0, 0, 0) - 1)}
              disable={true}
            />
            <SelectField
              name="employee_id"
              control={control}
              options={employeeOptions}
              placeholder={t("employee.name")}
              loading={isLoadingEmployees2}
              error={errors.employee_id?.message || errors.employee_id?.value?.message}
              isDisabled={true}
              disabled={true}
            />
          </div>
          <p className="font-normal text-[0.8rem] leading-[125%]">{t("surgeries.suffer")}</p>
          <div className="flex gap-6 mt-2">
            <GroupRadio
              name="chronic_diseases"
              value="yes"
              label={t("common.yes")}
              checked={watch("chronic_diseases") === "yes"}
              onChange={() => setValue?.("chronic_diseases", "yes")}
            />
            <GroupRadio
              name="chronic_diseases"
              value="no"
              label={t("common.no")}
              checked={watch("chronic_diseases") === "no"}
              onChange={() => setValue?.("chronic_diseases", "no")}
            />
            <Input
              control={control}
              name={"chronic_diseases_description"}
              placeholder={t("common.description")}
              error={errors?.chronic_diseases_description?.message}
              disable={isShow}
            />
          </div>
          <p className="font-normal text-[0.8rem] leading-[125%]">{t("surgeries.drug")}</p>
          <div className="flex gap-6 mt-2">
            <GroupRadio
              name="drug_allergy"
              value="yes"
              label={t("common.yes")}
              checked={watch("drug_allergy") === "yes"}
              onChange={() => setValue?.("drug_allergy", "yes")}
            />
            <GroupRadio
              name="drug_allergy"
              value="no"
              label={t("common.no")}
              checked={watch("drug_allergy") === "no"}
              onChange={() => setValue?.("drug_allergy", "no")}
            />
            <Input
              control={control}
              name={"drug_allergy_description"}
              placeholder={t("common.description")}
              error={errors?.drug_allergy_description?.message}
              disable={isShow}
            />
          </div>

          <p className="font-normal text-[0.8rem] leading-[125%]">
            {t("surgeries.have-last-operation")}
          </p>
          <div className="flex gap-6 mt-2">
            <GroupRadio
              name="previous_surgery"
              value="yes"
              label={t("common.yes")}
              checked={watch("previous_surgery") === "yes"}
              onChange={() => setValue?.("previous_surgery", "yes")}
            />
            <GroupRadio
              name="previous_surgery"
              value="no"
              label={t("common.no")}
              checked={watch("previous_surgery") === "no"}
              onChange={() => setValue?.("previous_surgery", "no")}
            />
            <Input
              control={control}
              name={"previous_surgery_description"}
              placeholder={t("common.description")}
              error={errors?.previous_surgery_description?.message}
            />
          </div>
          <div className="w-full">
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextAreaField
                  {...field}
                  placeholder={t("common.notes")}
                  error={errors.notes?.message}
                  label={t("common.notes")}
                />
              )}
            />
          </div>
          <p className="text-[0.9rem] leading-[125%] font-normal">{t("common.date-and-time")}</p>
          <CalenderWIthSlot
            isSelected={isSelected}
            setIsSelected={setIsSelected}
            booing_id={data?.data?.data?.id}
            selectDate={selectDate}
            setSelectedDate={setSelectedDate}
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

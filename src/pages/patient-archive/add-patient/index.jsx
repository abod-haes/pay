/* eslint-disable no-nested-ternary */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import MedicalInformation from "@/components/surgeries/medical-information";
import TextAreaField from "@/components/shared/textArea";
import Input from "@/components/shared/input";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess } from "@/libs/react.toastify";
import { useNavigate, useLocation } from "react-router-dom";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import { useTranslation } from "@hooks/useTranslation";
import SelectField from "@/components/shared/select";
import FileUploader from "@/components/shared/fileUploader";
import Calender from "@assets/svgs/common/calendar.svg";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import useStates from "@/hooks/useStates";
import useCities from "@/hooks/useCities";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { usePatientsQueries } from "@/apis/patients/query";
import LoadingSection from "@/components/loadingSection";
import { apis } from "@/apis/patients/api";
import {
  decryptId,
  formatDateOrTime,
  getUserData,
  handleBackendErrors,
  hasPermissionFunction,
  isEmployee,
  isSuperAdmin,
} from "@/utils/helpers";
import useBookingVia from "@/hooks/useBookingia";
import PhoneNumber from "@/components/phoneNumber";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import useEmployees from "@/hooks/useEmployess";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";

export const getCountryByCallingCode = code => {
  const countries = getCountries();
  return countries.find(c => getCountryCallingCode(c) === String(code));
};

// eslint-disable-next-line complexity
export default function AddPatient() {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const encryptedId = location.pathname.split("/")[2];
  const id = useMemo(() => decryptId(encryptedId), [encryptedId]);
  const isEdit = Boolean(id);
  const isAdd = location.pathname.endsWith("/add");
  const { data, isLoading, isRefetching, refetch } = usePatientsQueries.GetOne({ id });

  // Add loading states for phone numbers
  const [firstPhoneNumberReady, setFirstPhoneNumberReady] = useState(false);
  const [secondPhoneNumberReady, setSecondPhoneNumberReady] = useState(false);
  const { isLoadingEmployees2, items: employees2 } = useEmployees({ type: "employee" });
  const [currentUser, setCurrentUser] = useState(null);
  const [isEmployeeUser, setIsEmployeeUser] = useState(false);
  const [isUserSuperAdmin, setUserSuperAdmin] = useState(isSuperAdmin());

  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
    setIsEmployeeUser(isEmployee());
  }, []);
  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
    setUserSuperAdmin(isSuperAdmin());
  }, []);

  const canAssignAdminToPatient =
    isUserSuperAdmin ||
    hasPermissionFunction({
      group: PERMISSION_GROUP.Patient,
      type: PERMISSION_ACTION.assign_admin,
    });

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
    full_name: yup.string().required(t("validation.required")),
    birth_date: yup.string().required(t("validation.required")),
    register_date: yup.string().required(t("validation.required")),
    first_phone_number: yup
      .string()
      .required(t("validation.required"))
      .matches(/^\d{11}$/, t("validation.phone_must_be_11_digits")),
    second_phone_number: yup
      .string()
      .nullable()
      .notRequired()
      .matches(/^\d{11}$/, t("validation.phone_must_be_11_digits")),
    notes: yup.string().nullable(),
    city_id: yup
      .object()
      .typeError(t("validation.required"))
      .shape({
        label: yup.string().required(t("validation.required")),
        value: yup.number().required(t("validation.required")),
      })
      .required(t("validation.required")),
    country: yup
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
    gender: yup
      .object()
      .typeError(t("validation.required"))
      .shape({
        label: yup.string().required(t("validation.required")),
        value: yup.string().required(t("validation.required")),
      })
      .required(t("validation.required")),
    employee_id: yup.mixed().nullable().notRequired(),
  });
  const { bookingVia } = useBookingVia();
  const genderOptions = [
    { value: "male", label: "ذكر" },
    { value: "female", label: "أنثى" },
  ];
  const {
    control,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    setValue,
    watch,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      full_name: "",
      register_date: isAdd ? new Date().toISOString() : null,
      birth_date: null,
      gender: null,
      city_id: "",
      country: "",
      first_phone_number: "",
      second_phone_number: "",
      address: "",
      booking_via: null,
      // first_phone_number_country_code: "964",
      // second_phone_number_country_code: "964",
      employee_id: null,
      chronic_diseases: "no",
      chronic_diseases_description: "",
      drug_allergy: "no",
      drug_allergy_description: "",
      previous_surgery: "no",
      previous_surgery_description: "",
      notes: "",
    },
  });

  const { isLoadingStates, items: states } = useStates();
  const { isLoadingCities, items: cities } = useCities({ state_id: watch("country")?.value });
  const [previousCountry, setPreviousCountry] = useState(null);
  const selectedCountry = watch("country");

  // Phone number loading state effects
  useEffect(() => {
    if (isEdit && id && !isAdd) {
      // For edit mode, set phone numbers as ready after data is loaded and form is reset
      if (data?.data?.data) {
        setFirstPhoneNumberReady(true);
        setSecondPhoneNumberReady(true);
      }
    } else {
      // For add mode, phone numbers are immediately ready
      setFirstPhoneNumberReady(true);
      setSecondPhoneNumberReady(true);
    }
  }, [id, isAdd, isEdit, data?.data?.data]);

  // Clear city only when country actually changes
  useEffect(() => {
    if (
      previousCountry !== null &&
      selectedCountry?.value !== previousCountry &&
      watch("city_id")
    ) {
      setValue("city_id", null);
    }

    if (selectedCountry?.value) {
      setPreviousCountry(selectedCountry.value);
    }
  }, [selectedCountry, setValue, watch, previousCountry]);

  useEffect(() => {
    if (isAdd) {
      const currentDate = new Date().toISOString();

      setValue("register_date", currentDate, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [isAdd, setValue]);
  // eslint-disable-next-line complexity
  useEffect(() => {
    const dataToReset = data?.data?.data;
    if (isEdit && id && dataToReset) {
      // Set the form values in the correct order
      reset({
        full_name: dataToReset.full_name,
        birth_date: formatDateOrTime({ input: dataToReset.birth_date, type: "date" }),
        register_date: dataToReset.register_date,
        gender: genderOptions?.find(item => item?.value.includes(dataToReset?.gender)),
        // Use state data for country
        country: dataToReset.state
          ? {
            label: dataToReset.state.name,
            value: dataToReset.state.id,
          }
          : null,
        // City data
        city_id: dataToReset.city
          ? {
            label: dataToReset.city.name,
            value: dataToReset.city.id,
          }
          : null,
        employee_id: dataToReset?.employee
          ? {
            label: dataToReset.employee.full_name,
            value: dataToReset.employee.id,
          }
          : null,
        address: dataToReset.address,
        first_phone_number: dataToReset.first_phone_number,
        second_phone_number: dataToReset.second_phone_number || "",
        // first_phone_number_country_code: dataToReset.first_phone_number_country_code,
        // second_phone_number_country_code: dataToReset.second_phone_number_country_code || "",
        booking_via: bookingVia?.find(item => item?.value.includes(dataToReset?.booking_via)),
        chronic_diseases: dataToReset.medical_information?.chronic_diseases ? "yes" : "no",
        chronic_diseases_description:
          dataToReset.medical_information?.chronic_diseases_description || "",
        drug_allergy: dataToReset.medical_information?.drug_allergy ? "yes" : "no",
        drug_allergy_description: dataToReset.medical_information?.drug_allergy_description || "",
        previous_surgery: dataToReset.medical_information?.previous_surgery ? "yes" : "no",
        previous_surgery_description:
          dataToReset.medical_information?.previous_surgery_description || "",
        notes: dataToReset.notes || "",
      });

      if (dataToReset.attachments?.length) {
        const formattedFiles = dataToReset.attachments.map(file => ({
          id: file.id,
          name: file.name,
          type: file.mime_type,
          url: file.url,
          uploading: false,
          media_id: file.id,
        }));
        setFiles(formattedFiles);
      } else {
        setFiles([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id, data?.data?.data, isRefetching, isLoading]);

  useEffect(() => {
    if (!canAssignAdminToPatient && watch("employee_id")) {
      setValue("employee_id", null, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [canAssignAdminToPatient, setValue, watch]);

  const onSubmit = async data => {
    try {
      const dataToSend = {
        full_name: data.full_name,
        birth_date: formatDateOrTime({ input: data.birth_date, type: "date" }),
        register_date: new Date(data.register_date).toISOString(),
        gender: data.gender.value,
        city_id: data.city_id.value,
        country: data.country.value,
        address: data.address,
        ...(canAssignAdminToPatient && data?.employee_id?.value
          ? { employee_id: data.employee_id.value }
          : {}),
        first_phone_number: data.first_phone_number,
        // first_phone_number_country_code: data.first_phone_number_country_code,
        booking_via: data.booking_via.value,
        attachments_ids: files.map(f => f.media_id),
        chronic_diseases: data.chronic_diseases === "yes" ? 1 : 0,
        chronic_diseases_description: data.chronic_diseases_description,
        drug_allergy: data.drug_allergy === "yes" ? 1 : 0,
        drug_allergy_description: data.drug_allergy_description,
        previous_surgery: data.previous_surgery === "yes" ? 1 : 0,
        previous_surgery_description: data.previous_surgery_description,
        notes: data.notes,
      };

      if (data.second_phone_number) {
        dataToSend.second_phone_number = data.second_phone_number;
        // dataToSend.second_phone_number_country_code = data.second_phone_number_country_code;
      }
      clearErrors();
      if (!isAdd) {
        const response = await apis.update({ id, payload: dataToSend });
        showSuccess(response?.data?.message);
      } else {
        const response = await apis.add({ id, payload: dataToSend });
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
  const TITLE = !isAdd ? t("patient.edit") : t("patient.add");

  const handleRemoveFile = file => {
    setFiles(prev => prev.filter(f => f.id !== file.id));
  };

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
    { component: <SecondaryButton text={t("common.cancel2")} onClick={handleCancel} /> },
  ];
  useEffect(() => {
    if (canAssignAdminToPatient && isEmployeeUser && currentUserEmployeeOption) {
      const currentValue = watch("employee_id");

      if (!currentValue || currentValue.value !== currentUserEmployeeOption.value) {
        setValue("employee_id", currentUserEmployeeOption, {
          shouldValidate: true,
          shouldTouch: true,
        });
      }
    }
  }, [canAssignAdminToPatient, isEmployeeUser, currentUserEmployeeOption, setValue, watch]);

  return (
    <div>
      <BreadCrumb isAdd title={TITLE} link="/patient" />
      <Card otherStyle={"!w-[80%] mb-8"}>
        <LoadingSection isLoading={isLoading || isRefetching} otherStyle={"!w-[98%]"} />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="full_name"
              control={control}
              placeholder={t("employee.forth")}
              error={errors.full_name?.message}
            />

            <ControlledTimeField
              name="birth_date"
              control={control}
              placeholder={t("delayed.birthday")}
              errors={errors.birth_date}
              icon={Calender}
              max={new Date(new Date().setHours(0, 0, 0, 0) - 1)}
            />
            <ControlledTimeField
              name="register_date"
              control={control}
              placeholder={t("patient.register_date")}
              errors={errors.register_date}
              icon={Calender}
              disable={isEdit}
              type=""
            />
            <SelectField
              name="gender"
              control={control}
              options={genderOptions}
              placeholder={t("delayed.gender")}
              error={errors.gender?.message}
            />
            <SelectField
              name="country"
              control={control}
              options={states}
              error={errors.country?.message}
              placeholder={t("users.city")}
              loading={isLoadingStates}
            />

            <SelectField
              name="city_id"
              control={control}
              options={cities}
              error={errors.city_id?.message}
              disabled={!watch("country")}
              placeholder={t("delayed.country")}
              loading={isLoadingCities}
            />
            <Input
              name="address"
              control={control}
              placeholder={t("delayed.area")}
              error={errors.address?.message}
            />
            {/* 
            {firstPhoneNumberReady && (
              <PhoneNumber
                control={control}
                defaultCountry={
                  // getCountryByCallingCode(data?.data?.data?.first_phone_number_country_code) || "IQ"
                  getCountryByCallingCode(watch("first_phone_number_country_code")) || "IQ"
                }
                name={"first_phone_number"}
                phoneName={"first_phone_number_country_code"}
                placeholder={t("complaints.phone1")}
                register={register}
                errors={errors.first_phone_number?.message}
              />
            )} */}
            <Input
              control={control}
              name={"first_phone_number"}
              placeholder={t("complaints.phone1")}
              register={register}
              error={errors.first_phone_number?.message}
              type="number"
            />
            {/* {secondPhoneNumberReady && (
              <PhoneNumber
                control={control}
                defaultCountry={
                  // getCountryByCallingCode(data?.data?.data?.second_phone_number_country_code) ||
                  // "IQ"
                  getCountryByCallingCode(watch("second_phone_number_country_code")) || "IQ"
                }
                name={"second_phone_number"}
                phoneName={"second_phone_number_country_code"}
                placeholder={t("complaints.phone2")}
                register={register}
                errors={errors.second_phone_number?.message}
              />
            )} */}
            <Input
              control={control}
              name={"second_phone_number"}
              placeholder={t("complaints.phone2")}
              register={register}
              error={errors.second_phone_number?.message}
              type="number"
            />
            <SelectField
              name="booking_via"
              control={control}
              options={bookingVia}
              placeholder={t("booking.booked-by")}
              error={errors.booking_via?.message}
            />
            {canAssignAdminToPatient && (
              <SelectField
                name="employee_id"
                control={control}
                options={employeeOptions}
                placeholder={t("surgeries.admin-name")}
                loading={isLoadingEmployees2}
                error={errors.employee_id?.message || errors.employee_id?.value?.message}
                isDisabled={isEmployeeUser}
              />
            )}
          </div>
          <div className="w-full">
            <MedicalInformation
              control={control}
              watch={watch}
              setValue={setValue}
              errors={errors}
              showPreviousSurgery={true}
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
          <div className="w-[49%]">
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
}

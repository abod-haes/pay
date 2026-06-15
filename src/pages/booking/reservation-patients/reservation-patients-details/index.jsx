/* eslint-disable max-lines */
/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm, useWatch } from "react-hook-form";
import Input from "@/components/shared/input";
import SelectField from "@/components/shared/select";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showError, showSuccess } from "@/libs/react.toastify";
import {
  decryptId,
  formatDate,
  formatDateOrTime,
  getTimeSuffix,
  handleBackendErrors,
  hasPermissionFunction,
} from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import usePatients from "@/hooks/usePaitients";
import useBookingSections from "@/hooks/useBookingSection";
import useEmployees from "@/hooks/useEmployess";
import { apis } from "@/apis/booking/general-booking/api";
import { useGeneralBookingQueries } from "@/apis/booking/general-booking/query";
import LoadingSection from "@/components/loadingSection";
import CancelButton from "@/components/shared/cancelButton";
import CancelModal from "@/components/shared/modals/cancelModal";
import useServices from "@/hooks/useServises";
import CalenderWIthSlot from "@/components/calenderWithSlot";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import useBookingVia from "@/hooks/useBookingia";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { getUserData, isEmployee, isSuperAdmin } from "@/utils/helpers";
import GroupRadio from "@/components/shared/checkbox/GroupRadio";
import useBookingStatus from "@/hooks/useReservationStatus";
import StatusButtonWithMenu from "@/components/reservationButtonWithMenu";
import PhoneNumber from "@/components/phoneNumber";
import { getCountries, getCountryCallingCode } from "react-phone-number-input";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import { usePatientsQueries } from "@/apis/patients/query";
export const getCountryByCallingCode = code => {
  const countries = getCountries();
  return countries.find(c => getCountryCallingCode(c) === String(code));
};

const AddEmployees = () => {
  const navigate = useNavigate();
  const [isSelected, setIsSelected] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [selectDate, setSelectedDate] = useState(formatDate(new Date(Date.now())));
  const [isChangeStatus, setIsChangeStatus] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { id: encryptedId } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const isAdd = location.pathname.endsWith("/add");
  const isShow = query.get("show") === "true";

  const id = encryptedId ? decryptId(encryptedId) : null;
  const isEdit = Boolean(id) && !isShow;

  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const { isLoadingPatients, items: patientOptions } = usePatients({ available: true });
  const { isLoadingEmployees2, items: employees2 } = useEmployees({ type: "employee" });
  const [currentUser, setCurrentUser] = useState(null);
  const [isEmployeeUser, setIsEmployeeUser] = useState(false);
  const [isUserSuperAdmin, setUserSuperAdmin] = useState(false);
  const [firstPhoneNumberReady, setFirstPhoneNumberReady] = useState(false);
  const [secondPhoneNumberReady, setSecondPhoneNumberReady] = useState(false);

  const { data: patientDetailsData } = usePatientsQueries.GetOne(
    { id: selectedPatientId },
    { enabled: !!selectedPatientId },
  );

  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
    setIsEmployeeUser(isEmployee());
    setUserSuperAdmin(isSuperAdmin());
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
    service_id: yup
      .object()
      .typeError(t("validation.required"))
      .shape({
        label: yup.string().required(t("validation.required")),
        value: yup.string().required(t("validation.required")),
      })
      .required(t("validation.required")),
    section: yup
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

  const { isLoading, data, refetch, isRefetching } = useGeneralBookingQueries.GetOne(
    { id },
    { enabled: !!id && !isAdd },
  );

  const {
    control,
    handleSubmit,
    watch,
    clearErrors,
    setError,
    reset,
    setValue,
    register,
    formState: { errors, isSubmitting, touchedFields, dirtyFields },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      patient_id: null,
      service_id: null,
      section: null,
      salary: 0,
      booking_via: null,
      employee_id: null,
      chronic_diseases: "no",
      drug_allergy: "no",
      chronic_diseases_description: "",
      drug_allergy_description: "",
      deposit: null,
    },
  });

  const { services, isLoadingServices } = useServices({
    section: watch("section")?.value,
    type: "",
  });
  const filteredServices = services || [];
  const { bookingVia } = useBookingSections();
  const { bookingVia: bookin_via } = useBookingVia();

  const p = patientOptions?.find(p => p.value === watch("patient_id")?.value);
  const booking_via = bookin_via.find(_valu => _valu.value === p?.booking_via);

  useEffect(() => {
    if (p && dirtyFields?.patient_id) {
      setValue("first_phone_number", p.first_phone_number || "");
      setValue("second_phone_number", p.second_phone_number || "");
      setValue("birth_date", formatDateOrTime({ input: p.birth_date, type: "date" }));
      setValue("employee_id", { label: p.employee?.full_name, value: p.employee?.id });
      setValue("booking_via", booking_via);

      if (isAdd && p.medical_information) {
        setValue("chronic_diseases", p.medical_information.chronic_diseases ? "yes" : "no");
        setValue(
          "chronic_diseases_description",
          p.medical_information.chronic_diseases_description || "",
        );
        setValue("drug_allergy", p.medical_information.drug_allergy ? "yes" : "no");
        setValue("drug_allergy_description", p.medical_information.drug_allergy_description || "");
      }
    }
  }, [dirtyFields?.patient_id, watch("patient_id")?.value, i18n.language]);

  useEffect(() => {
    const dataToReset = data?.data?.data;
    if ((isEdit || isShow) && id && !isAdd && dataToReset) {
      const sectionObj = bookingVia.find(
        s => s.value === (dataToReset.section?.value || dataToReset.section),
      );

      reset({
        patient_id: { label: dataToReset?.patient?.full_name, value: dataToReset?.patient?.id },
        second_phone_number: dataToReset?.patient?.second_phone_number,
        first_phone_number: dataToReset?.patient?.first_phone_number,
        employee_id: {
          label: dataToReset?.employee?.full_name,
          value: dataToReset?.employee?.id,
        },
        chronic_diseases: dataToReset.chronic_diseases ? "yes" : "no",
        chronic_diseases_description: dataToReset.chronic_diseases_description || "",
        drug_allergy: dataToReset.drug_allergy ? "yes" : "no",
        drug_allergy_description: dataToReset.drug_allergy_description || "",
        booking_via: bookin_via?.find(item => item?.value.includes(dataToReset?.booking_via)),
        salary: Number(dataToReset?.service?.total),
        deposit: Number(dataToReset?.deposit),
        section: sectionObj || null,
        birth_date: dataToReset?.patient?.birth_date?.split("T")[0] || null,
        service_id: { label: dataToReset?.service?.name, value: dataToReset?.service?.id },
      });

      setIsSelected(dataToReset?.date?.split(" ")[1]);
      setSelectedDate(dataToReset?.date?.split(" ")[0]);

      if (dataToReset?.patient?.id) {
        setSelectedPatientId(dataToReset.patient.id);
      }
    }
  }, [data?.data, isEdit, isAdd, isLoading, isRefetching]);

  const dataToReset = data?.data?.data;

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

  const serviceId = watch("service_id");
  const selectedService = services?.find(item => item.value === serviceId?.value);

  useEffect(() => {
    if (serviceId?.value > 0 && (touchedFields?.service_id || dirtyFields?.service_id)) {
      setValue("salary", selectedService?.total || 0);
    }
  }, [serviceId?.value, selectedService, touchedFields?.service_id, dirtyFields?.service_id]);

  const selectedSections = useWatch({
    control,
    name: "section",
  });

  useEffect(() => {
    if (selectedSections && !isSubmitting && (touchedFields?.section || dirtyFields?.section)) {
      if (selectedSections.value !== prevSectionRef.current) {
        setValue("service_id", null);
        setValue("salary", "0");
        prevSectionRef.current = selectedSections.value;
      }
    }
  }, [selectedSections, isSubmitting, touchedFields?.section, dirtyFields?.section]);

  const prevSectionRef = useRef(null);

  const onSubmit = async data => {
    try {
      const dataToSend = {
        patient_id: data.patient_id?.value,
        service_id: data.service_id?.value,
        section: data.section?.value,
        booking_via: data?.booking_via?.value,
        employee_id: data?.employee_id?.value,
        chronic_diseases: data.chronic_diseases === "yes" ? 1 : 0,
        chronic_diseases_description: data.chronic_diseases_description,
        drug_allergy: data.drug_allergy === "yes" ? 1 : 0,
        drug_allergy_description: data.drug_allergy_description,
        deposit: data.deposit || 0,
        date: `${formatDateOrTime({
          input: selectDate,
          type: "date",
        })} ${isSelected}`,
        first_phone_number: data.first_phone_number,
        second_phone_number: data.second_phone_number,
        birth_date: data.birth_date,
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

  const TITLE = isAdd ? t("booking.add-booking") : isShow ? t("booking.show") : t("booking.edit");

  const handelCHangeStatus = async booking_status_id => {
    try {
      setIsChangeStatus(true);
      const response = await apis.changeStatus({ id, booking_status_id });
      showSuccess(response?.data?.message);
      setIsChangeStatus(false);
      refetch();
    } catch (error) {
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      }
      handleBackendErrors({ error, setError });
      setIsChangeStatus(false);
    }
  };

  const clickHandlers = {
    onChangeId: id => handelCHangeStatus(id),
  };
  const { bookingStatus } = useBookingStatus(clickHandlers);

  const BUTTONSLIST = [
    {
      show: !isShow,
      component: (
        <PrimaryButton
          text={!isAdd ? t("common.save_changes") : t("booking.confirm-your-reservation")}
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

  const handleConfirmDCancel = async data => {
    if (!data) {
      showError(t("validation.add-note"));
      return;
    }
    try {
      setIsSending(true);
      const response = await apis.changeStatus({
        id,
        cancel_reason: data,
        booking_type: "cancel",
      });
      showSuccess(response?.data?.message);
      setIsDeleteModalOpen(false);
      setIsSending(false);
      navigate(-1);
    } catch (error) {
      handleBackendErrors({ error });
      setIsSending(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handelCloseModal = () => {
    setIsDeleteModalOpen(false);
  };

  const message = t("booking.cancelMessage", {
    name: data?.data?.data?.patient?.full_name,
    date: data?.data?.data?.date?.split(" ")[0],
    time: data?.data?.data?.date?.split(" ")[1] + getTimeSuffix(i18n.language),
  });

  const userPermissionsFromRole = currentUser?.role?.permissions || [];

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

  return (
    <div className="w-full lg:w-[80%]">
      <BreadCrumb
        isAdd
        customStatus={
          !isAdd && (
            <StatusButtonWithMenu
              status={data?.data?.data?.booking_status}
              items={bookingStatus}
              isSending={isChangeStatus}
              userPermissions={userPermissionsFromRole}
              isSuperAdmin={isUserSuperAdmin}
              disabled={
                !hasPermissionFunction({
                  group: PERMISSION_GROUP.Booking,
                  type: PERMISSION_ACTION.change_status,
                })
              }
            />
          )
        }
        isStatue={!isLoading}
        title={TITLE}
        customSection={
          dataToReset?.booking_status?.type !== "done" &&
          dataToReset?.booking_status?.type !== "delayed" &&
          dataToReset?.booking_status?.type !== "cancel" &&
          currentUser?.is_cancel &&
          !isAdd && (
            <CancelButton text={t("hair.cancel")} onClick={() => setIsDeleteModalOpen(true)} />
          )
        }
      />
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <LoadingSection otherStyle={"h-[100%] !w-[98%]"} isLoading={isLoading} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SelectField
              name="patient_id"
              control={control}
              options={patientOptions}
              placeholder={t("booking.patient")}
              loading={isLoadingPatients}
              error={errors.patient_id?.message}
            />
            <SelectField
              name="section"
              control={control}
              options={bookingVia}
              error={errors.section?.message}
              placeholder={t("staff.department")}
            />
            <SelectField
              name="service_id"
              control={control}
              options={filteredServices}
              loading={isLoadingServices}
              disabled={!watch("section")?.value}
              placeholder={t("booking.service")}
              error={errors.service_id?.message}
            />

            <Input
              disable={!watch("service")?.value}
              name="salary"
              isNumberWithCommas
              control={control}
              placeholder={t("booking.mony-servise")}
            />

            <Input
              name="deposit"
              isNumberWithCommas
              control={control}
              placeholder={t("booking.deposit")}
              disable={data?.data?.data?.can_edit_deposit === false}
              error={errors.deposit?.message}
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
              name="booking_via"
              control={control}
              options={bookin_via}
              placeholder={t("booking.booked-by")}
              disabled
              error={errors?.booking_via?.message || errors.booking_via?.value?.message}
            />

            <SelectField
              name="employee_id"
              control={control}
              options={employeeOptions}
              placeholder={t("surgeries.admin-name")}
              loading={isLoadingEmployees2}
              error={errors.employee_id?.message || errors.employee_id?.value?.message}
              isDisabled={true}
              disabled
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
      {isDeleteModalOpen && (
        <CancelModal
          isOpen={isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handleConfirmDCancel}
          title={t("hair.cancel")}
          warning={message}
          deleteText={t("hair.cancel")}
          cancelText={t("common.cancel2")}
          isSubmitting={isSending}
        />
      )}
    </div>
  );
};

export default AddEmployees;

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
import StatusButtonWithMenu from "@/components/statusButtonWithMenu";
import useBookingStatus from "@/hooks/useBookingStatus";
import CancelButton from "@/components/shared/cancelButton";
import CancelModal from "@/components/shared/modals/cancelModal";
import useServices from "@/hooks/useServises";
import CalenderWIthSlot from "@/components/calenderWithSlot";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import useBookingVia from "@/hooks/useBookingia";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";

const AddEmployees = () => {
  const navigate = useNavigate();
  const [isSelected, setIsSelected] = useState(null);
  const [selectDate, setSelectedDate] = useState(formatDate(new Date(Date.now())));
  const [isSending, setIsSending] = useState(false);
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

  const { isLoadingPatients, items } = usePatients({
    available: false,
  });
  const { isLoadingEmployees, items: employees } = useEmployees({ type: "technician" });

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
    technician_id: yup
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
  });

  const { isLoading, data, refetch, isRefetching } = useGeneralBookingQueries.GetOne({ id });

  const { bookingVia } = useBookingSections();
  const { bookingVia: bookin_via } = useBookingVia();

  const {
    control,
    handleSubmit,
    watch,
    clearErrors,
    setError,
    reset,
    setValue,
    formState: { errors, isSubmitting, touchedFields, dirtyFields },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      patient_id: null,
      service_id: null,
      section: null,
      technician_id: null,
      salary: 0,
      booking_via: bookin_via[2],
      employee_id: null,
    },
  });

  const { services, isLoadingServices } = useServices({
    type: "other",
    section: watch("section")?.value,
  });

  useEffect(() => {
    const dataToReset = data?.data?.data;
    if ((isEdit || isShow) && id && !isAdd && dataToReset) {
      const sectionObj = bookingVia.find(
        s => s.value === (dataToReset.section?.value || dataToReset.section)
      );

      reset({
        patient_id: { label: dataToReset?.patient?.full_name, value: dataToReset?.patient?.id },
        technician_id: {
          label: dataToReset?.technician?.full_name,
          value: dataToReset?.technician?.id,
        },
        employee_id: {
          label: dataToReset?.employee?.full_name,
          value: dataToReset?.employee?.id,
        },
        booking_via: bookin_via?.find(item => item?.value.includes(dataToReset?.booking_via)),
        salary: Number(dataToReset?.service?.total),
        section: sectionObj || null,
        service_id: { label: dataToReset?.service?.name, value: dataToReset?.service?.id },
      });
      setIsSelected(dataToReset?.date?.split(" ")[1]);
      setSelectedDate(dataToReset?.date?.split(" ")[0]);
    }
  }, [data?.data, isEdit, isAdd, isLoading, isRefetching]);

  const serviceId = watch("service_id");
  const selectedService = services?.find(item => item.value === serviceId?.value);

  useEffect(() => {
    if ((serviceId?.value > 0 && touchedFields?.service_id, dirtyFields?.service_id)) {
      setValue("salary", selectedService?.total);
    }
  }, [serviceId?.value, watch("service_id"), selectedService]);

  const selectedSections = useWatch({
    control,
    name: "section",
  });

  useEffect(() => {
    if (
      (selectedSections && !isLoadingEmployees && !isSubmitting && touchedFields?.section,
      dirtyFields?.section)
    ) {
      setValue("service_id", null);
      setValue("salary", "0");
    }
  }, [selectedSections, isLoadingEmployees, isSubmitting]);

  const onSubmit = async data => {
    try {
      const dataToSend = {
        patient_id: data.patient_id?.value,
        service_id: data.service_id?.value,
        section: data.section?.value,
        technician_id: data?.technician_id?.value,
        booking_via: "direct",
        employee_id: data?.booking_via?.value > 0 ? data?.employee_id?.value : null,
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

  const TITLE = isAdd ? t("booking.add-booking") : isShow ? t("booking.show") : t("booking.edit");

  const handelCHangeStatus = async status => {
    try {
      setIsChangeStatus(true);
      const response = await apis.changeStatus({ id, status: status });
      showSuccess(response?.data?.message);
      setIsChangeStatus(false);
      refetch();
    } catch (error) {
      handleBackendErrors({ error: error });
      setIsChangeStatus(false);
    }
  };

  const clickHandlers = {
    wait: () => {
      handelCHangeStatus("wait");
    },
    approve: () => handelCHangeStatus("approve"),
    cancel: () => handelCHangeStatus("cancel"),
    done: () => handelCHangeStatus("done"),
    delayed: () => handelCHangeStatus("delayed"),
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
      const response = await apis.cancel({ id, cancel_reason: data });
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

  return (
    <div className="w-full lg:w-[80%]">
      <BreadCrumb
        isAdd
        customStatus={
          !isAdd && (
            <StatusButtonWithMenu
              status={data?.data?.data?.status}
              items={bookingStatus}
              isSending={isChangeStatus}
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
          data?.data?.data?.status === "wait" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Booking,
            type: PERMISSION_ACTION.change_status,
          }) && <CancelButton text={t("hair.cancel")} onClick={() => setIsDeleteModalOpen(true)} />
        }
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
              options={services}
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
            <SelectField
              name="technician_id"
              control={control}
              options={employees}
              placeholder={t("booking.doctor")}
              loading={isLoadingEmployees}
              error={errors.technician_id?.message || errors.technician_id?.value?.message}
            />
            <SelectField
              name="booking_via"
              control={control}
              options={bookin_via}
              placeholder={t("booking.booked-by")}
              loading={isLoadingEmployees}
              error={errors?.booking_via?.message || errors.booking_via?.value?.message}
              disabled
            />
          </div>
          <p className="text-[0.9rem] leading-[125%] font-normal">{t("common.date-and-time")}</p>
          <CalenderWIthSlot
            isSelected={isSelected}
            setIsSelected={setIsSelected}
            technician_id={watch("technician_id")?.value}
            value={data?.data?.data?.date?.split(" ")[0].replaceAll("/", "-")}
            booing_id={data?.data?.data?.id}
            setSelectedDate={setSelectedDate}
            selectDate={selectDate}
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

/* eslint-disable complexity */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import SelectField from "@/components/shared/select";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showError, showSuccess } from "@/libs/react.toastify";
import {
  decryptId,
  formatDateOrTime,
  getTimeSuffix,
  handleBackendErrors,
  hasPermissionFunction,
} from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import Calender from "@/components/shared/calender";
import usePatients from "@/hooks/usePaitients";
import useBookingSections from "@/hooks/useBookingSection";
import useEmployees from "@/hooks/useEmployess";
import { apis } from "@/apis/booking/general-booking/api";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useGeneralBookingQueries } from "@/apis/booking/general-booking/query";
import LoadingSection from "@/components/loadingSection";
import StatusButtonWithMenu from "@/components/statusButtonWithMenu";
import useBookingStatus from "@/hooks/useBookingStatus";
import CancelButton from "@/components/shared/cancelButton";
import CancelModal from "@/components/shared/modals/cancelModal";
import useServices from "@/hooks/useServises";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";

const AddEmployees = () => {
  const navigate = useNavigate();
  const [isSelected, setIsSelected] = useState("10:00 ص");
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
  const { bookingVia } = useBookingSections();

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
      .object({
        label: yup.string(),
        value: yup.string(),
      })
      .nullable() // يسمح تكون null
      .when("section", {
        is: val => val?.value?.includes("hair_care"),
        then: schema => schema.notRequired().nullable(),
        otherwise: schema =>
          schema.required(t("validation.required")).shape({
            label: yup.string().required(t("validation.required")),
            value: yup.string().required(t("validation.required")),
          }),
      }),
  });

  const { isLoading, data, refetch } = useGeneralBookingQueries.GetOne({ id });

  const {
    control,
    handleSubmit,
    watch,
    clearErrors,
    setError,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      patient_id: null,
      service_id: null,
      section: null,
      technician_id: null,
      salary: 0,
    },
  });

  const { services, isLoadingServices } = useServices({
    type: "other",
    section: watch("section")?.value,
  });

  useEffect(() => {
    const dataToReset = data?.data?.data;
    if ((isEdit || isShow) && id && !isAdd && dataToReset) {
      // Only reset if section value is different
      // Find the matching section object from bookingVia
      const sectionObj = bookingVia.find(
        s => s.value === (dataToReset.section?.value || dataToReset.section)
      );
      reset({
        patient_id: { label: dataToReset?.patient?.full_name, value: dataToReset?.patient?.id },
        technician_id: {
          label: dataToReset?.technician?.full_name,
          value: dataToReset?.technician?.id,
        },
        section: sectionObj || null,
        service_id: { label: dataToReset?.service?.name, value: dataToReset?.service?.id },
      });
    }
  }, [data?.data, isEdit, isAdd]);

  const onSubmit = async data => {
    try {
      const dataToSend = {
        patient_id: data.patient_id?.value,
        service_id: data.service_id?.value,
        section: data.section?.value,
        technician_id: data.technician_id?.value,
        salary: 4,
        booking_via: "direct",
        date: `${formatDateOrTime({
          input: new Date(Date.now()),
          type: "date",
        })} ${formatDateOrTime({ input: new Date(Date.now()), type: "time" })}`,
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

  const serviceId = watch("service_id");
  const selectedService = services?.find(item => item.value === serviceId?.value);

  useEffect(() => {
    if (serviceId?.value > 0) {
      setValue("salary", selectedService?.total);
    }
  }, [serviceId, services, setValue]);

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
          isSubmitting={isSubmitting}
        />
      ),
    },
    {
      show: true,
      component: <SecondaryButton text={t("common.cancel2")} onClick={handleCancel} />,
    },
  ];

  const times = [
    { id: 0, value: "10:00 ص" },
    { id: 1, value: "9:00 ص" },
    { id: 2, value: "12:00 م" },
    { id: 3, value: "14:00 م" },
    { id: 4, value: "16:00 م" },
    { id: 5, value: "17:00 م" },
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
      refetch();
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
            {watch("section")?.value !== "hair_care" && (
              <SelectField
                name="technician_id"
                control={control}
                options={employees}
                placeholder={t("booking.doctor")}
                loading={isLoadingEmployees}
                error={errors.technician_id?.message || errors.technician_id?.value?.message}
              />
            )}
          </div>
          <p className="text-[0.9rem] leading-[125%] font-normal">{t("common.date-and-time")}</p>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-[320px]">
              <Calender value="2025-09-08" onChange={date => console.log("Selected:", date)} />
            </div>
            <ul className="w-full md:w-[25%] grid gap-2">
              {times.map(item => (
                <li
                  key={item.id}
                  onClick={() => setIsSelected(item.value)}
                  className={`border px-[29px] py-[6px] rounded-[100px] flex hover:bg-primary transition-all duration-500 cursor-pointer items-center justify-center font-semibold text-[0.75rem] border-accent ${
                    isSelected === item.value
                      ? "bg-primary text-white"
                      : "border-accent text-accent"
                  }`}
                >
                  {item.value}
                </li>
              ))}
            </ul>
          </div>
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

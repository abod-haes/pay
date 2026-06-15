/* eslint-disable complexity */
/* eslint-disable no-undef */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "@hooks/useTranslation";
import { useForm } from "react-hook-form";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import SecondaryButton from "@/components/shared/secondaryButton";
import { showSuccess, showError } from "@/libs/react.toastify";
import {
  decryptId,
  formatDateOrTime,
  handleBackendErrors,
  hasPermissionFunction,
} from "@/utils/helpers";
import CustomFlexButtons from "@/components/shared/CustomFlexButtons";
import PatientInformation from "@/components/surgeries/patient-information";
import MedicalInformation from "@/components/surgeries/medical-information";
import ProcessData from "@/components/surgeries/process-data";
import DateAndTime from "../../../../components/surgeries/date-and-time";
import { apis } from "@/apis/booking/hair-transplant/api";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import useServices from "@/hooks/useServises";
import { useHairTransplantQueries } from "@/apis/booking/hair-transplant/query";
import LoadingSection from "@/components/loadingSection";
import useBookingStatus from "@/hooks/useReservationStatus";
import StatusButtonWithMenu from "@/components/reservationButtonWithMenu";
import { formatDate } from "@/utils/helpers";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { getUserData, isSuperAdmin } from "@/utils/helpers";
import SurgeriesArchaive from "@/components/surgeries/surgeries-archaive";

const ActionHairTransplant = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id: encryptedId } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const didInit = useRef(false);
  const [isSelected, setIsSelected] = useState(null);
  const [selectDate, setSelectedDate] = useState(formatDate(new Date(Date.now())));
  const [attachmentsFiles, setAttachmentsFiles] = useState([]);
  const [deleteAttachments, setDeleteAttachments] = useState([]);
  const isAdd = location.pathname.endsWith("/add");

  const isShow = query.get("show") === "true";

  const id = encryptedId ? decryptId(encryptedId) : null;

  const { data, isLoading, refetch, isRefetching } = useHairTransplantQueries.GetOne({ id });

  const prevDataRef = useRef(null);
  const [isUserSuperAdmin, setUserSuperAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
    setUserSuperAdmin(isSuperAdmin());
  }, []);
  const resetFiles = item => {
    const formatFiles = arr =>
      arr?.map(file => ({
        id: file.id,
        name: file.name,
        date: file.date || file.created_at,
        type: file.mime_type,
        url: file.url,
        uploading: false,
        media_id: file.id,
      })) || [];

    const allAttachments = item?.attachments || [
      ...(item?.before_eyebrow_transplant || []),
      ...(item?.after_eyebrow_transplant || []),
      ...(item?.after_first_session || []),
      ...(item?.after_second_session || []),
      ...(item?.after_thread_open || []),
    ];

    setAttachmentsFiles(formatFiles(allAttachments));
    setDeleteAttachments([]);
  };

  const validationSchema = yup.object().shape({
    patient_id: yup
      .object()
      .typeError(t("validation.required"))
      .shape({
        label: yup.string().required(t("validation.required")),
        value: yup.string().required(t("validation.required")),
      })
      .required(t("validation.required")),

    planting_technique_id: yup
      .object()
      .typeError(t("validation.required"))
      .shape({
        label: yup.string().required(t("validation.required")),
        value: yup.string().required(t("validation.required")),
      })
      .required(t("validation.required")),
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    register,
    formState: { errors, isSubmitting, dirtyFields, touchedFields },
  } = useForm({
    defaultValues: {},
    resolver: yupResolver(validationSchema),
  });
  // const d = data?.data?.data;
  const d = useMemo(() => data?.data?.data, [data?.data?.data, isRefetching, isLoading]);
  const Tech = d?.technician && d?.technician;

  useEffect(() => {
    if (!d) return;

    if (JSON.stringify(prevDataRef.current) !== JSON.stringify(d)) {
      const dataToReset = {
        admin_notes: d.admin_notes || "",
        agree_drawing: d.agree_drawing ? "yes" : "no",
        agree_technology: d.agree_technology ? "yes" : "no",
        chronic_diseases: d.chronic_diseases ? "yes" : "no",
        chronic_diseases_description: d.chronic_diseases_description || "",
        doctor_agree: d.doctor_agree ? "yes" : "no",
        drug_allergy: d.drug_allergy ? "yes" : "no",
        drug_allergy_description: d.drug_allergy_description || "",
        previous_surgery: d.previous_surgery ? "yes" : "no",
        previous_surgery_description: d.previous_surgery_description || "",
        employee_id: {
          label: d.employee?.full_name,
          value: d.employee?.id,
        },

        planting_technique_id: {
          label: d.planting_technique?.name,
          value: d.planting_technique?.id,
        },
        agree_plants_count: d.agree_plants_count ? "yes" : "no",
        meso_count: d.meso_count || 0,
        patient_id: { label: d.patient.full_name, value: d.patient.id },
        plasma_count: d.plasma_count || 0,
        total: d.total || 0,
        city: { label: d.patient.city.name, value: d.patient.city.id },
        phone_number1: d.patient.first_phone_number,
        phone_number2: d.patient.second_phone_number,
      };

      reset({ ...dataToReset });

      setIsSelected(d?.date?.split(" ")[1]);
      setSelectedDate(d?.date?.split(" ")[0]);
      if (data?.data.data.images) {
        resetFiles(data?.data.data.images);
      }
      prevDataRef.current = d;
      didInit.current = true;
    }
  }, [data, reset]);

  const { services } = useServices({
    section: "hair_transplant",
  });

  const onSubmit = async data => {
    try {
      const dataToSend = {
        admin_notes: data.admin_notes,
        agree_drawing: data.agree_drawing === "yes" ? 1 : 0,
        agree_technology: data.agree_technology === "yes" ? 1 : 0,
        chronic_diseases: data.chronic_diseases === "yes" ? 1 : 0,
        chronic_diseases_description: data.chronic_diseases_description,
        city: data?.value,
        date: `${formatDateOrTime({
          input: selectDate,
          type: "date",
        })} ${isSelected}`,
        doctor_agree: data.doctor_agree === "yes" ? 1 : 0,
        drug_allergy: data.drug_allergy === "yes" ? 1 : 0,
        previous_surgery: data.previous_surgery === "yes" ? 1 : 0,
        drug_allergy_description: data.drug_allergy_description,
        previous_surgery_description: data.previous_surgery_description,
        employee_id: Number(data.employee_id?.value),

        agree_plants_count: data.agree_plants_count === "yes" ? 1 : 0,
        meso_count: Number(data.meso_count) || 0,
        patient_id: Number(data.patient_id?.value),
        planting_technique_id: Number(data?.planting_technique_id?.value),
        plasma_count: Number(data.plasma_count) || 0,
        total: Number(data.total) || 0,
        section: "hair_transplant",
        service_id: services?.find(item => item.type === "hair_transplant")?.value,
        attachments_ids: attachmentsFiles.map(f => f.media_id).filter(Boolean),
        delete_attachments: deleteAttachments,
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
      // eslint-disable-next-line no-console
      console.error("err", error);
      handleBackendErrors({ error, setError });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const TITLE = isAdd ? t("surgeries.add-booking") + " - " + t("admin.hair") : t("booking.edit");

  const BUTTONSLIST = [
    {
      show: !isShow,
      component: (
        <PrimaryButton
          text={isAdd ? t("booking.confirm-your-reservation") : t("common.save")}
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

  const [isChangeStatus, setIsChangeStatus] = useState(false);

  const handelCHangeStatus = async booking_status_id => {
    try {
      setIsChangeStatus(true);
      const response = await apis.changeStatus({ id, booking_status_id });
      showSuccess(response?.data?.message);
      setIsChangeStatus(false);
      refetch();
    } catch (error) {
      console.log("Status change error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
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
  const userPermissionsFromRole = currentUser?.role?.permissions || [];

  return (
    <div className="py-2">
      <BreadCrumb
        isAdd
        title={TITLE}
        link="/surgeries/operation-bookings"
        customStatus={
          !isAdd && (
            <StatusButtonWithMenu
              status={data?.data?.data?.booking_status}
              userPermissions={userPermissionsFromRole}
              items={bookingStatus}
              isSending={isChangeStatus}
              isSuperAdmin={isUserSuperAdmin}
              disabled={
                !hasPermissionFunction({
                  group: PERMISSION_GROUP.HairTransplant,
                  type: PERMISSION_ACTION.change_status,
                })
              }
            />
          )
        }
        isStatue={!isLoading}
      />
      <div className="">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative space-y-6">
            <LoadingSection isLoading={isLoading || isRefetching} otherStyle={"h-full"} />
            <PatientInformation
              control={control}
              watch={watch}
              errors={errors}
              setValue={setValue}
              didInit={didInit}
              dirtyFields={dirtyFields}
              register={register}
            />
            <MedicalInformation
              control={control}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />
            <ProcessData control={control} setValue={setValue} watch={watch} errors={errors} />
            <DateAndTime
              control={control}
              setValue={setValue}
              watch={watch}
              dataToReset={data?.data?.data}
              isSelected={isSelected}
              setIsSelected={setIsSelected}
              selectDate={selectDate}
              setSelectedDate={setSelectedDate}
            />
            <SurgeriesArchaive
              control={control}
              files={attachmentsFiles}
              setFiles={setAttachmentsFiles}
              setDeleteAttachments={setDeleteAttachments}
            />
          </div>
          <CustomFlexButtons
            gap="gap-4"
            justify="justify-start"
            reverse={false}
            buttons={BUTTONSLIST}
          />
        </form>
      </div>
    </div>
  );
};

export default ActionHairTransplant;

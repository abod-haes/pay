/* eslint-disable comma-dangle */
/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
import React, { useEffect, useMemo, useState } from "react";
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
import SelectField from "@/components/shared/select";
import Calender from "@assets/svgs/common/calendar.svg";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import { apis } from "@/apis/complaints/api";
import { handleBackendErrors } from "@/utils/helpers";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { usePatientsQueries } from "@/apis/patients/query";
import { useEmployeeQueries } from "@/apis/employee/query";
import { useComplaintsQueries } from "@/apis/complaints/query";
import useServices from "@/hooks/useServises";
import useComplaintStatus from "@/hooks/useComplaintStatus";
import StatusComplainButtonWithMenu from "@/components/statusComplainWithMenu";
import { getUserData, isSuperAdmin } from "@/utils/helpers";
import { formatDateOrTime } from "@/utils/helpers";
export default function ComplaintActions() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const [isChangeStatus, setIsChangeStatus] = useState(false);

  const query = new URLSearchParams(location.search);

  // حالة إضافة
  const isAdd = location.pathname.endsWith("/add");

  // حالة عرض
  const isShow = Boolean(query.get("show") === "true");

  // حالة تعديل
  const isEdit = Boolean(id) && !isShow;
  const { data: ComplaintsData, refetch } = useComplaintsQueries.GetOne({ id });
  const { data: patientData, isLoading: isLoadingPatient } = usePatientsQueries.GetAllPatients();

  const { data: employeeData, isLoading: isLoadingEmployee } = useEmployeeQueries.GetAll({
    page: null,
    per_page: null,
    full_name: null,
    city_id: null,
    type: "technician",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserSuperAdmin, setUserSuperAdmin] = useState(false);

  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
    setUserSuperAdmin(isSuperAdmin());
  }, []);
  const schema = yup.object().shape({
    patient_id: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.number().required(),
      })
      .required(t("validation.required")),
    date: yup.string().required(t("validation.required")),
    technician_id: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.number().required(),
      })
      .required(t("validation.required")),
    service_id: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.string().required(),
      })
      .required(t("validation.required")),
    description: yup.string().required(t("validation.required")),
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
      patient_id: null,
      date: "",
      guard_type: "dashboard",
      technician_id: null,
      service_id: null,
      description: "",
      phone1: "",
      phone2: "",
    },
  });

  useEffect(() => {
    setValue("guard_type", t("common.dashboard"));
  }, [t, setValue]);

  const selectedPatientId = useWatch({
    control,
    name: "patient_id",
  });

  const formatPhoneWithCountryCode = (phone, countryCode) => {
    if (!phone) return "";

    const cleanPhone = phone.replace(/^\+\d+/, "").trim();

    let formattedCountryCode = countryCode || "";

    if (formattedCountryCode && !formattedCountryCode.startsWith("+")) {
      if (/^\d+$/.test(formattedCountryCode)) {
        formattedCountryCode = `${formattedCountryCode}+`;
      }
    }

    if (formattedCountryCode && cleanPhone) {
      return ` ${cleanPhone} ${formattedCountryCode}`;
    }

    return cleanPhone;
  };

  useEffect(() => {
    if (selectedPatientId && patientData) {
      const selectedPatient = patientData.find(patient => patient.id === selectedPatientId.value);

      if (selectedPatient) {
        const formattedPhone1 = formatPhoneWithCountryCode(
          selectedPatient.first_phone_number,
          selectedPatient.first_phone_number_country_code
        );

        const formattedPhone2 = formatPhoneWithCountryCode(
          selectedPatient.second_phone_number,
          selectedPatient.second_phone_number_country_code
        );

        setValue("phone1", formattedPhone1);
        setValue("phone2", formattedPhone2);
      }
    } else {
      setValue("phone1", "");
      setValue("phone2", "");
    }
  }, [selectedPatientId, patientData, setValue]);

  const { services, isLoadingServices } = useServices({
    section: watch("section")?.value,
  });
  const items = services?.filter(item => item.type !== "other");

  useEffect(() => {
    if ((isEdit || isShow) && ComplaintsData?.data) {
      const emp = ComplaintsData.data?.data;

      const patientOption = emp.patient
        ? { label: emp.patient.full_name, value: emp.patient.id }
        : null;

      const technicianOption = emp.technician
        ? { label: emp.technician.full_name, value: emp.technician.id }
        : null;

      const formattedPhone1 = formatPhoneWithCountryCode(
        emp.patient?.first_phone_number,
        emp.patient?.first_phone_number_country_code
      );

      const formattedPhone2 = formatPhoneWithCountryCode(
        emp.patient?.second_phone_number,
        emp.patient?.second_phone_number_country_code
      );

      reset({
        patient_id: patientOption,
        date: formatDateOrTime({ input: emp.date, type: "date" }),
        guard_type: t("common.dashboard"),
        technician_id: technicianOption,
        service_id: { label: emp?.service?.name, value: emp?.service?.id },
        description: emp.description || "",
        phone1: formattedPhone1 || "",
        phone2: formattedPhone2 || "",
      });
    }
  }, [isEdit, ComplaintsData, reset, isShow, t]);

  const patientOptions = useMemo(
    () =>
      patientData?.map(patient => ({
        label: patient.full_name,
        value: patient.id,
        phone1: formatPhoneWithCountryCode(
          patient.first_phone_number,
          patient.first_phone_number_country_code
        ),
        phone2: formatPhoneWithCountryCode(
          patient.second_phone_number,
          patient.second_phone_number_country_code
        ),
      })) || [],
    [patientData]
  );

  const employeeOptions = useMemo(
    () =>
      employeeData?.data?.map(role => ({
        label: role.full_name,
        value: role.id,
      })) || [],
    [employeeData?.data]
  );

  const onSubmit = async formData => {
    try {
      const payload = {
        ...formData,
        patient_id: formData.patient_id?.value,
        technician_id: formData.technician_id?.value,
        service_id: formData.service_id?.value,
        guard_type: "dashboard",
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
    cancel: () => handelCHangeStatus("cancel"),
    ...(isUserSuperAdmin && { done: () => handelCHangeStatus("done") }),
  };

  const { complaintStatus } = useComplaintStatus(clickHandlers);

  const TITLE = isAdd ? t("complaints.add") : isShow ? t("complaints.show") : t("complaints.edit");

  const BUTTONSLIST = [
    {
      show: !isShow,
      component: (
        <PrimaryButton
          text={!isAdd ? t("complaints.save2") : t("complaints.save")}
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

  const breadCrumbProps = isAdd
    ? {
        isAdd: true,
        title: TITLE,
        link: "/complains",
      }
    : isShow
    ? {
        isAdd: true,
        title: TITLE,
        link: "/complains",
        isStatue: true,
        customStatus: !isAdd && (
          <StatusComplainButtonWithMenu
            status={ComplaintsData?.data.data.status}
            items={complaintStatus}
            isSending={isChangeStatus}
            isSuperAdmin={isUserSuperAdmin}
          />
        ),
      }
    : isEdit
    ? {
        isAdd: true,
        title: TITLE,
        link: "/complains",
        isStatue: true,
        customStatus: !isAdd && (
          <StatusComplainButtonWithMenu
            status={ComplaintsData?.data.data.status}
            items={complaintStatus}
            isSending={isChangeStatus}
            isSuperAdmin={isUserSuperAdmin}
          />
        ),
      }
    : {
        title: TITLE,
        link: "/complains",
      };

  return (
    <div>
      <div className="w-[80%]">
        <BreadCrumb {...breadCrumbProps} />
      </div>
      <Card otherStyle={"max-md:!w-full !w-[80%]"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SelectField
              name="patient_id"
              control={control}
              placeholder={t("complaints.patient-name")}
              error={errors.patient_id?.message}
              disabled={isShow}
              options={patientOptions}
              loading={isLoadingPatient}
            />
            <ControlledTimeField
              name="date"
              control={control}
              placeholder={t("complaints.date")}
              errors={errors.date}
              icon={Calender}
              rules={{ required: t("validation.required") }}
              disable={isShow}
            />
            <Input
              control={control}
              name={"phone1"}
              placeholder={t("complaints.phone1")}
              register={register}
              error={errors.phone1?.message}
              disable={true}
            />
            <Input
              control={control}
              name={"phone2"}
              placeholder={t("complaints.phone2")}
              register={register}
              error={errors.phone2?.message}
              disable={true}
            />

            <SelectField
              name="technician_id"
              control={control}
              options={employeeOptions}
              placeholder={t("complaints.t-name")}
              error={errors.technician_id?.message}
              disabled={isShow}
              loading={isLoadingEmployee}
            />
            <SelectField
              name="service_id"
              control={control}
              options={items}
              loading={isLoadingServices}
              placeholder={t("complaints.service")}
              error={errors.service_id?.message}
              disabled={isShow}
            />
          </div>

          <TextAreaField
            {...register("description")}
            placeholder={t("complaints.details")}
            rows={3}
            variant="white"
            disable={isShow}
            error={errors.description?.message}
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

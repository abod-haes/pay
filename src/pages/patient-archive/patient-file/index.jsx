/* eslint-disable complexity */
/* eslint-disable comma-dangle */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useReducer } from "react";
import Card from "@/components/card";
import { Table } from "@/components/table";
import { decryptId, encryptId, handleBackendErrors } from "@/utils/helpers";
import { patientActions, initialValues, patientReducer } from "@/reducers/patient-archive";
import { useTranslation } from "react-i18next";
import BorderedButton from "@/components/shared/borderedButton";
import PrimaryButton from "@/components/shared/primaryButton";
import { useParams, useNavigate } from "react-router-dom";
import { usePatientsQueries } from "@/apis/patients/query";
import add from "@assets/svgs/common/arrow-down.svg";
import useBookingVia from "@/hooks/useBookingia";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/patients/api";
import LoadingSection from "@/components/loadingSection";
import Booking from "@/pages/booking/reservation-patients";
import FileUploaderDetail from "@/components/fileDetailsUploader";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { Can } from "@/components/shared/can/can";
import { formatDate } from "@/utils/helpers";
import { printPatientWithBookings } from "@/utils/printPatientInfo";

export default function PatientFile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id: encruptedId } = useParams();
  const id = decryptId(encruptedId);
  const [state, dispatch] = useReducer(patientReducer, initialValues);

  const { data, isLoading, refetch } = usePatientsQueries.GetOne({ id });

  const dataToReset = data?.data?.data;

  const handlePageSizeChange = newPageSize => {
    dispatch({ type: patientActions.pageSize, payload: newPageSize });
  };

  const handlePreviousPage = () => {
    dispatch({ type: patientActions.pageIndex, payload: Math.max(0, state.pageIndex - 1) });
  };

  const handleNextPage2 = () => {};
  const handleGotoPage = page => {
    dispatch({ type: patientActions.pageIndex, payload: page });
  };

  const columns2 = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "#",
        enableColumnFilter: true,
      },

      {
        accessorKey: "name",
        header: t("employee.file"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "date",
        header: t("booking.date-time"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          const rawDate = row.original?.date || "";
          const [datePart, timeWithMs] = String(rawDate).split("T");
          const timeOnly = timeWithMs?.split(".")?.[0];

          return (
            <div className="flex flex-col">
              <span>{datePart || "-"}</span>
              {timeOnly && <span className="text-accent">{timeOnly}</span>}
            </div>
          );
        },
      },
    ],
    [t]
  );

  const genderOptions = [
    { value: "male", label: "ذكر" },
    { value: "female", label: "أنثى" },
  ];
  const { bookingVia } = useBookingVia();
  const handleShow = row => window.open(row.url, "_blank");
  const handleFile = row => console.log("delet:", row);
  const getTranslatedStatus = status => {
    switch (status) {
      case "pending":
        return t("patient_status.pending");
      case "active":
        return t("patient_status.active");
      case "booked":
        return t("patient_status.booked");
      default:
        return status;
    }
  };
  const personalInfoData = [
    {
      label: t("employee.forth"),
      value: dataToReset?.full_name,
    },
    {
      label: t("complaints.phone1"),
      value: dataToReset?.first_phone_number,
    },
    {
      label: t("complaints.phone2"),
      value: dataToReset?.second_phone_number,
    },
    {
      label: t("delayed.gender"),
      value: genderOptions?.find(item => item?.value.includes(dataToReset?.gender))?.label,
    },
    {
      label: t("delayed.birthday"),

      value: formatDate(dataToReset?.birth_date, "DD/MM/YYYY"),
    },

    {
      label: t("users.city"),
      value: dataToReset?.state?.name,
    },
    {
      label: t("delayed.country"),
      value: dataToReset?.city?.name,
    },
    {
      label: t("delayed.area"),
      value: dataToReset?.address,
    },
    {
      label: t("delayed.reservation-way"),
      value: bookingVia?.find(item => item?.value.includes(dataToReset?.booking_via))?.label,
    },
    {
      label: t("delayed.reservation-date"),
      value: dataToReset?.register_date?.split("T")[0],
    },
    {
      label: t("common.patient_status"),
      value: getTranslatedStatus(dataToReset?.status),
    },
    {
      label: t("surgeries.admin-name"),
      value: dataToReset?.employee?.full_name,
    },
    {
      label: t("common.notes"),
      value: dataToReset?.notes,
      isFullWidth: true,
    },
  ];

  const handelCloseModal = () => {
    dispatch({ type: patientActions.closeDeleteModal });
    dispatch({ type: patientActions.isSending, payload: false });
  };

  const rowData = useMemo(
    () =>
      data?.data?.data?.attachments?.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        date: item.date || item.created_at,
      })) || [],
    [data?.data]
  );

  const handelDelete = async () => {
    try {
      dispatch({ type: patientActions.isSending, payload: true });
      const response = await apis.deleteApi({ id: dataToReset.id });
      dispatch({ type: patientActions.closeDeleteModal });
      showSuccess(response?.data?.message);
      dispatch({ type: patientActions.isSending, payload: false });
      navigate(-1);
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: patientActions.isSending, payload: false });
    }
  };
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between relative">
        <p
          className="font-main cursor-pointer flex gap-2 text-[1.25rem]"
          onClick={() => navigate(-1)}
        >
          <img
            src={add}
            width={15}
            alt="add"
            className={`${i18n.language === "en" ? "rotate-90" : " -rotate-90"} cursor-pointer`}
          />
          {t("delayed.file")}
        </p>

        <div className="flex items-center gap-2">
          <BorderedButton
            text="طباعة المريض"
            border={"border border-primary"}
            textColor={"text-primary"}
            onClick={() =>
              printPatientWithBookings({ patient: dataToReset, bookings: dataToReset?.bookings || [] })
            }
          />
          <Can group={PERMISSION_GROUP.Patient} type={PERMISSION_ACTION.delete}>
            <BorderedButton
              text={t("patient.delete")}
              border={"border border-error"}
              textColor={"text-error"}
              onClick={() => dispatch({ type: patientActions.openDeleteModal, payload: true })}
            />
          </Can>
          <Can group={PERMISSION_GROUP.Patient} type={PERMISSION_ACTION.update}>
            <PrimaryButton
              text={t("employee.update")}
              onClick={() => navigate(`/patient/${encryptId(id)}`)}
            />
          </Can>
        </div>
      </div>

      <p className="text-primary font-main text-[1rem] mb-4">{t("delayed.info")}</p>
      <Card otherStyle={"mb-8 !py-6 relative"}>
        <LoadingSection isLoading={isLoading} otherStyle={"h-[100vh]"} />
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            {personalInfoData.map((item, index) => (
              <div
                key={index}
                className={`flex flex-col gap-2 ${item.isFullWidth ? "md:col-span-4" : ""}`}
              >
                <p className="font-main text-accent text-[0.75rem]">{item.label}</p>
                <p className="font-main text-[#3333333] text-[0.85rem] min-h-6">
                  {item.value || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <p className="text-primary font-main text-[1rem] mb-4">{t("delayed.medical-info")}</p>
      <Card otherStyle={"mb-8 !py-6"}>
        <div className="flex flex-col gap-4">
          <p className="font-main text-accent text-[0.75rem]">{t("surgeries.suffer")}</p>
          <p className="font-main text-[#3333333] text-[0.85rem]">
            {dataToReset?.medical_information?.chronic_diseases ? t("common.yes") : t("common.no")}
            {dataToReset?.medical_information?.chronic_diseases_description
              ? `, ${dataToReset?.medical_information?.chronic_diseases_description}`
              : ""}
          </p>
          <p className="font-main text-accent text-[0.75rem]">{t("delayed.drugAllergy")}</p>
          <p className="font-main text-[#3333333] text-[0.85rem]">
            {dataToReset?.medical_information?.drug_allergy ? t("common.yes") : t("common.no")}
            {dataToReset?.medical_information?.drug_allergy_description
              ? `, ${dataToReset?.medical_information?.drug_allergy_description}`
              : ""}
          </p>
          <p className="font-main text-accent text-[0.75rem]">
            {t("surgeries.have-last-operation")}
          </p>
          <p className="font-main text-[#3333333] text-[0.85rem]">
            {dataToReset?.medical_information?.previous_surgery ? t("common.yes") : t("common.no")}
            {dataToReset?.medical_information?.previous_surgery_description
              ? `, ${dataToReset?.medical_information?.previous_surgery_description}`
              : ""}
          </p>
        </div>
      </Card>
      <p className="text-primary font-main text-[1rem] mb-4">{t("patient.reservation")}</p>
      <Booking patient_id={Number(id)} hideTitle customHeight={400} />
      <div className="flex items-center justify-between">
        <p className="text-primary font-main text-[1rem] mb-4">{t("patient.file")}</p>

        <FileUploaderDetail id={id} refetch={refetch} />
      </div>
      <Table
        data={rowData || []}
        columns={columns2}
        pageSize={state.pageSize}
        pageIndex={state.pageIndex}
        onPageSizeChange={handlePageSizeChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage2}
        onGotoPage={handleGotoPage}
        permissionGroup={PERMISSION_GROUP.Patient}
        hasSearch={true}
        onShow={handleShow}
        onFile={handleFile}
        searchValue={state.searchValue}
        onSearchChange={val => dispatch({ type: patientActions.searchValue, payload: val })}
        searchPlaceholder={t("common.searchPlaceholder")}
        hasColumnFilters={false}
        isLoading={false}
        hideFilter
        hasPagination={false}
        hasStickyBreadcrumb={true}
      />

      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("patient.delete")}
          warning={t("package.warning")}
          deleteText={t("patient.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </div>
  );
}

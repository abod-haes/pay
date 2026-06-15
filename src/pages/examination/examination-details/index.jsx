import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import {
  decryptId,
  getTimeSuffix,
  handleBackendErrors,
  Permissions,
  truncateText,
} from "@/utils/helpers";
import RenderStatus from "@/components/statusButton";
import LoadingSection from "@/components/loadingSection";

import { showError, showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/examination/api";
import CancelModal from "@/components/shared/modals/cancelModal";
import { Table } from "@/components/table";
import { useExaminationQueries } from "@/apis/examination/query";

import ActionItem from "@/components/bookingMaterial";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { BookingVia, ExaminationStatus } from "@/constants/constants";
import { formatDateOrTime } from "@/utils/helpers";
import { getUserData } from "@/utils/helpers";

export default function ExaminationDetails() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState(0);
  const [openAddMaterial, setOpenAddMaterial] = useState(false);
  const [selectedData, setSelectedData] = useState(false);

  const { id: encryptedId } = useParams();
  const { t, i18n } = useTranslation();
  const id = encryptedId ? decryptId(encryptedId) : null;

  const { isLoading, data, refetch } = useExaminationQueries.GetOne({ id });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
  }, []);
  const genderOptions = [
    { value: "male", label: "ذكر" },
    { value: "female", label: "أنثى" },
  ];

  const dataToReset = data?.data?.data;

  const TITLE = t("examination.show");

  const handleConfirmDCancel = async data => {
    if (!data) {
      showError(t("validation.add-note"));
      return;
    }
    try {
      setIsSending(true);
      const response = await apis.changeStatus({
        id: dataToReset.id,
        booking_type: "cancel",
        cancel_reason: data,
      });
      showSuccess(response?.data?.message);
      setIsDeleteModalOpen(false);
      setIsSending(false);
      refetch();
    } catch (error) {
      handleBackendErrors({ error });
      setIsSending(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handelCloseModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteOpen(false);
    setSelectedData(null);
    setOpenAddMaterial(false);
    refetch();
  };

  const message = t("booking.cancelMessage", {
    name: dataToReset?.patient?.full_name,
    date: dataToReset?.date?.split(" ")[0],
    time: dataToReset?.date?.split(" ")[1] + getTimeSuffix(i18n.language),
  });

  const handelApprove = async () => {
    try {
      setIsSending(true);
      const response = await apis.changeStatus({ id: dataToReset.id, booking_type: "approve" });
      showSuccess(response?.data?.message);
      refetch();
      setIsSending(false);
    } catch (error) {
      handleBackendErrors({ error: error });
      setIsSending(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id_show",
        header: "#",
        enableColumnFilter: true,
      },
      {
        accessorKey: "name",
        header: t("hair.item-name"),
        enableColumnFilter: true,
      },
      { accessorKey: "fill", header: t("hair.fill"), enableColumnFilter: true },
      {
        accessorKey: "store",
        header: t("hair.store"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "quantity",
        header: t("hair.quantity"),
        enableColumnFilter: true,
      },
      { accessorKey: "price", header: t("single"), enableColumnFilter: true },

      {
        accessorKey: "total",
        header: t("print.total"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          const price = parseFloat(row.original.price) || 0;
          const quantity = parseFloat(row.original.quantity) || 0;
          return (price * quantity).toFixed(2);
        },
      },
    ],
    []
  );
  const rowData = useMemo(
    () =>
      dataToReset?.materials?.map((item, index) => ({
        id: item.id,
        id_show: index + 1,
        patient: truncateText({ text: item.patient?.full_name, maxLength: 20 }),
        name: truncateText({ text: item?.material?.name, maxLength: 20 }),
        price: item.selling_price,
        quantity: item.quantity,
        store: item.warehouse?.name,
        fill: item.unit?.name,
        is_completed: item.is_completed,
        warehouse: item.warehouse,
      })) || [],
    [data?.data]
  );

  const handleDelete = row => {
    setSelectedToDelete(row.id);
    setDeleteOpen(true);
  };

  const discountLabel = useMemo(() => {
    if (dataToReset?.offer?.discount_type === "fixed") {
      return t("offers.fixed");
    }
    if (dataToReset?.offer?.discount_type === "percentage") {
      return t("employee.percentage");
    }
    return "-";
  }, [dataToReset?.offer?.discount_type, t]);

  return (
    <div className="relative">
      <BreadCrumb
        isAdd
        customStatus={RenderStatus(data?.data?.data?.status)}
        isStatue={!isLoading}
        title={TITLE}
      />
      <LoadingSection isLoading={isLoading} otherStyle={"h-[80vh]"} />

      {dataToReset && (
        <>
          <Card otherStyle={"mb-8 !py-6"}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-4">
                <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">
                  {t("staff.admin")}
                </p>
                <p className="font-main text-[#333333] text-[0.85rem]">
                  {dataToReset?.employee?.full_name || "-"}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">
                  {t("delayed.date")}
                </p>
                <p className="font-main text-[#333333] text-[0.85rem]">
                  {dataToReset?.date ? (
                    <>
                      {formatDateOrTime({ input: dataToReset?.date, type: "date" })} <br />
                    </>
                  ) : (
                    "-"
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">
                  {t("surgeries.doctor")}
                </p>
                <p className="font-main text-[#333333] text-[0.85rem]">
                  {dataToReset?.doctor?.full_name || "-"}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">
                  {t("surgeries.booking-by")}
                </p>
                <p className="font-main text-[#333333] text-[0.85rem]">
                  {t(BookingVia[dataToReset?.booking_via]?.label) || "-"}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">
                  {t("booking.status")}
                </p>
                <p className="font-main text-[#333333] text-[0.85rem]">
                  {t(ExaminationStatus[dataToReset?.status]?.label) || "-"}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">
                  {t("common.notes")}
                </p>
                <p className="font-main text-[#333333] text-[0.85rem]">
                  {dataToReset?.notes || "-"}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">
                  {t("surgeries.reason")}
                </p>
                <p className="font-main text-[#333333] text-[0.85rem]">
                  {dataToReset?.cancel_reason || "-"}
                </p>
              </div>
            </div>
          </Card>

          {dataToReset?.offer && (
            <>
              <p className="font-main text-[1.25rem] py-6">{t("sidebar.offers")}</p>
              <Card otherStyle={"mb-8 !py-6"}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-4">
                    <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">
                      {t("offers.from")}
                    </p>
                    <p className="font-main text-[#333333] text-[0.85rem]">
                      {formatDateOrTime({ input: dataToReset?.offer?.from_date, type: "date" }) ||
                        "-"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">
                      {t("offers.to")}
                    </p>
                    <p className="font-main text-[#333333] text-[0.85rem]">
                      {formatDateOrTime({ input: dataToReset?.offer?.to_date, type: "date" }) ||
                        "-"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">
                      {t("voucher.discount_type")}
                    </p>
                    <p className="font-main text-[#333333] text-[0.85rem]">{discountLabel}</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">
                      {t("voucher.discount_value")}
                    </p>
                    <p className="font-main text-[#333333] text-[0.85rem]">
                      {dataToReset?.offer?.discount_value || "-"}
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {dataToReset?.materials?.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <p className="font-main text-[1.25rem] py-6 ">{t("sidebar.items")}</p>
          </div>
          <Table
            data={rowData || []}
            columns={columns}
            permissionGroup={Permissions.INJECTIONS}
            hasSearch={false}
            hasColumnFilters={false}
            isLoading={false}
            hasStickyBreadcrumb={false}
            hasPagination={false}
          />
        </>
      )}

      <p className="font-main text-[1.25rem] py-6">{t("delayed.file")}</p>
      <p className="text-primary font-main text-[1rem] mb-4">{t("delayed.info")}</p>
      <Card otherStyle={"mb-8 !py-6"}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full md:w-[80%]">
          <div className="flex flex-col gap-4">
            <p className="font-main text-accent text-[0.75rem]">{t("delayed.fullName")}</p>
            <p className="font-main text-[#333333] text-[0.85rem]">
              {dataToReset?.patient?.full_name || "-"}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-main text-accent text-[0.75rem]">{t("complaints.phone1")}</p>
            <div className="flex flex-row gap-1 items-center">
              <p className="font-main text-[#333333] text-[0.85rem]" dir="ltr">
                {dataToReset?.patient?.first_phone_number || "-"}
              </p>
              <p className="font-main text-[#333333] text-[0.85rem]">
                {dataToReset?.patient?.first_phone_number_country_code
                  ? `+${dataToReset?.patient?.first_phone_number_country_code}`
                  : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-main text-accent text-[0.75rem]">{t("complaints.phone2")}</p>
            <div className="flex flex-row gap-1 items-center">
              <p className="font-main text-[#333333] text-[0.85rem]" dir="ltr">
                {dataToReset?.patient?.second_phone_number || "-"}
              </p>
              <p className="font-main text-[#333333] text-[0.85rem]">
                {dataToReset?.patient?.second_phone_number_country_code
                  ? `+${dataToReset?.patient?.second_phone_number_country_code}`
                  : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-main text-accent text-[0.75rem]">{t("delayed.gender")}</p>
            <p className="font-main text-[#333333] text-[0.85rem]">
              {genderOptions?.find(item => item?.value === dataToReset?.patient?.gender)?.label ||
                "-"}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-main text-accent text-[0.75rem]">{t("delayed.birthday")}</p>
            <p className="font-main text-[#333333] text-[0.85rem]">
              {formatDateOrTime({ input: dataToReset?.patient?.birth_date, type: "date" }) || "-"}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-main text-accent text-[0.75rem]">{t("users.city")}</p>
            <p className="font-main text-[#333333] text-[0.85rem]">
              {dataToReset?.patient?.state?.name || "-"}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-main text-accent text-[0.75rem]">{t("delayed.country")}</p>
            <p className="font-main text-[#333333] text-[0.85rem]">
              {dataToReset?.patient?.city?.name || "-"}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-main text-accent text-[0.75rem]">{t("delayed.area")}</p>
            <p className="font-main text-[#333333] text-[0.85rem]">
              {dataToReset?.patient?.address || "-"}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-main text-accent text-[0.75rem]">{t("staff.employee")}</p>
            <p className="font-main text-[#333333] text-[0.85rem]">
              {dataToReset?.patient?.employee?.full_name || "-"}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-main text-accent text-[0.75rem]">{t("delayed.reservation-way")}</p>
            <p className="font-main text-[#333333] text-[0.85rem]">
              {/* {dataToReset?.patient?.booking_via || "-"} */}
              {t(BookingVia[dataToReset?.patient?.booking_via]?.label) || "-"}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="font-main text-accent text-[0.75rem]">{t("delayed.reservation-date")}</p>
            <p className="font-main text-[#333333] text-[0.85rem]">
              {formatDateOrTime({ input: dataToReset?.patient?.register_date, type: "date" }) ||
                "-"}
            </p>
          </div>
        </div>
      </Card>

      <p className="text-primary font-main text-[1rem] mb-4">{t("delayed.medical-info")}</p>
      {dataToReset?.medical_information && (
        <Card otherStyle={"mb-8 !py-6"}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="font-main text-accent text-[0.75rem]">{t("surgeries.suffer")}</p>
              <p className="font-main text-[#333333] text-[0.85rem]">
                {dataToReset?.medical_information?.chronic_diseases
                  ? t("common.yes")
                  : t("common.no")}
                {dataToReset?.medical_information?.chronic_diseases_description
                  ? ` - ${dataToReset?.medical_information.chronic_diseases_description}`
                  : ""}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-main text-accent text-[0.75rem]">{t("delayed.drugAllergy")}</p>
              <p className="font-main text-[#333333] text-[0.85rem]">
                {dataToReset?.medical_information?.drug_allergy ? t("common.yes") : t("common.no")}
                {dataToReset?.medical_information?.drug_allergy_description
                  ? ` - ${dataToReset?.medical_information.drug_allergy_description}`
                  : ""}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-main text-accent text-[0.75rem]">
                {t("surgeries.have-last-operation")}
              </p>
              <p className="font-main text-[#333333] text-[0.85rem]">
                {dataToReset?.medical_information?.previous_surgery
                  ? t("common.yes")
                  : t("common.no")}
                {dataToReset?.medical_information?.previous_surgery_description
                  ? ` - ${dataToReset?.medical_information.previous_surgery_description}`
                  : ""}
              </p>
            </div>
          </div>
        </Card>
      )}

      {isDeleteModalOpen && (
        <CancelModal
          isOpen={isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handleConfirmDCancel}
          title={t("examination.cancel")}
          warning={message}
          deleteText={t("examination.cancel")}
          cancelText={t("common.cancel2")}
          isSubmitting={isSending}
        />
      )}

      {openAddMaterial && (
        <ActionItem
          isOpen={openAddMaterial}
          onClose={handelCloseModal}
          onDelete={handleConfirmDCancel}
          title={t("hair.cancel")}
          warning={message}
          deleteText={t("hair.cancel")}
          cancelText={t("common.cancel2")}
          isSubmitting={isSending}
          selectedId={dataToReset.id}
          selectedToDelete={selectedToDelete}
          editData={selectedData}
        />
      )}

      {deleteOpen && (
        <DeleteModal
          isOpen={deleteOpen}
          onClose={handelCloseModal}
          onDelete={handleDelete}
          title={t("item.delete")}
          warning={t("delayed.warning")}
          deleteText={t("item.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={isSending}
        />
      )}
    </div>
  );
}

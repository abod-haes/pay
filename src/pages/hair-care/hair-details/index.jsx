/* eslint-disable prefer-template */
/* eslint-disable no-nested-ternary */
/* eslint-disable complexity */
/* eslint-disable no-unused-vars */
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import BreadCrumb from "@/components/breadcrumb";
import {
  decryptId,
  encryptId,
  getTimeSuffix,
  handleBackendErrors,
  hasPermissionFunction,
  Permissions,
  truncateText,
} from "@/utils/helpers";
import LoadingSection from "@/components/loadingSection";
import useBookingSections from "@/hooks/useBookingSection";
import useBookingVia from "@/hooks/useBookingia";
import useBookingStatus from "@hooks/useReservationStatus";
import StatusButtonWithMenu from "@/components/reservationButtonWithMenu";
import { showError, showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/booking/hai-care/api";
import { apis as materilApis } from "@/apis/booking/material/api";
import PrimaryButton from "@/components/shared/primaryButton";
import DropdownMenu from "@/components/shared/dropdownMenu";
import deleteIcon from "@assets/svgs/table/trash.svg";
import edit from "@assets/svgs/common/edit-menu.svg";
import CancelModal from "@/components/shared/modals/cancelModal";
import LoadingElement from "@/components/shared/loading";
import { Table } from "@/components/table";
import BorderedButton from "@/components/shared/borderedButton";
import ActionItem from "@/components/bookingMaterial";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { Can } from "@/components/shared/can/can";
import {
  BondPermissionsMap,
  BondTypes,
  PERMISSION_ACTION,
  PERMISSION_GROUP,
} from "@/constants/constants";
import { formatDateOrTime } from "@/utils/helpers";
import { getUserData, isSuperAdmin } from "@/utils/helpers";
import printer from "@assets/svgs/common/printer.svg";
import { useHarCareQueries } from "@/apis/booking/hai-care/query";

export default function BookingDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isChangeStatus, setIsChangeStatus] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState(0);
  const [openAddMaterial, setOpenAddMaterial] = useState(false);
  const [selectedData, setSelectedData] = useState(false);
  const { id: encryptedId } = useParams();
  const { t, i18n } = useTranslation();
  const id = encryptedId ? decryptId(encryptedId) : null;
  const { bookingVia } = useBookingSections();
  const { bookingVia: bookingBy } = useBookingVia();
  const { isLoading, data, refetch } = useHarCareQueries.GetOne({ id });
  const [isUserSuperAdmin, setUserSuperAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
    setUserSuperAdmin(isSuperAdmin());
  }, []);

  const genderOptions = [
    { value: "male", label: "ذكر" },
    { value: "female", label: "أنثى" },
  ];

  const handelCHangeStatus = async booking_status_id => {
    try {
      setIsChangeStatus(true);
      const response = await apis.changeStatus({ id, booking_type: "approve" });
      showSuccess(response?.data?.message);
      setIsChangeStatus(false);
      refetch();
    } catch (error) {
      if (error.response?.data?.message) {
        showError(error.response.data.message);
      }
      handleBackendErrors({ error });
      setIsChangeStatus(false);
    }
  };
  const clickHandlers = {
    onChangeId: id => handelCHangeStatus(id),
  };
  const { bookingStatus } = useBookingStatus(clickHandlers);

  const dataToReset = data?.data?.data;
  const sectionObj = bookingVia?.find(s => s.value === dataToReset?.section);

  const TITLE = t("hair.details");

  const bookingInfo = [
    { label: t("delayed.patientName"), value: dataToReset?.patient?.full_name },
    { label: t("booking.department"), value: sectionObj?.label },
    { label: t("booking.service"), value: dataToReset?.service?.name },
    { label: t("surgeries.doctor-technician"), value: dataToReset?.technician?.full_name || "---" },
    { label: t("surgeries.doctor"), value: dataToReset?.doctor?.full_name || "---" },
    {
      label: t("physician-assistant.physician-assistant"),
      value: dataToReset?.assistant?.full_name || "---",
    },
    {
      label: t("delayed.date"),
      value: dataToReset?.date?.split(" ")[0],
    },
    {
      label: t("delayed.time"),
      value:
        dataToReset?.date?.split(" ")[1]?.slice(0, 5) +
        " " +
        getTimeSuffix(dataToReset?.date?.split(" ")[1], i18n.language),
    },
    { label: t("delayed.cost"), value: dataToReset?.total },
  ];

  // personal info array
  const personalInfo = [
    { label: t("delayed.fullName"), value: dataToReset?.patient?.full_name },
    { label: t("complaints.phone1"), value: dataToReset?.patient?.first_phone_number },
    { label: t("complaints.phone2"), value: dataToReset?.patient?.second_phone_number || "-" },
    {
      label: t("delayed.gender"),
      value: genderOptions?.find(item => item?.value.includes(dataToReset?.patient?.gender))?.label,
    },
    {
      label: t("delayed.birthday"),
      value: formatDateOrTime({ input: dataToReset?.patient?.birth_date, type: "date" }),
    },
    { label: t("users.city"), value: dataToReset?.patient?.state?.name },
    { label: t("delayed.country"), value: dataToReset?.patient?.city?.name },
    { label: t("delayed.area"), value: dataToReset?.patient?.address || "-" },
    {
      label: t("delayed.reservation-way"),
      value: bookingBy?.find(item => item?.value.includes(dataToReset?.patient?.booking_via))
        ?.label,
    },
    { label: t("delayed.reservation-date"), value: dataToReset?.patient?.register_date },
  ];

  const handleEdit = row => {
    setSelectedToDelete(row.id);
    setSelectedData(row);
    setOpenAddMaterial(true);
  };

  const handelccespt = async id => {
    try {
      setIsSending(true);
      const response = await materilApis.complete({ id, bookId: dataToReset.id });
      showSuccess(response?.data?.message);
      refetch();
      setIsSending(false);
      setSelectedToDelete(0);
    } catch (error) {
      handleBackendErrors({ error: error });
      setSelectedToDelete(0);
      setIsSending(false);
    }
  };

  const extraActions2 = status => {
    const menuItems = [
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => navigate(`/hair/add-hair-care/${encryptId(dataToReset.id)}`),
        show:
          status !== "done" &&
          status !== "delayed" &&
          status !== "cancel" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.HairCare,
            type: PERMISSION_ACTION.update,
          }),
      },
      {
        label: t("hair.cancel"),
        icon: <img src={deleteIcon} alt="cancel" />,
        onClick: () => {
          setIsDeleteModalOpen(true);
        },
        show:
          status !== "done" &&
          status !== "delayed" &&
          status !== "cancel" &&
          currentUser?.is_cancel,
      },
      {
        label: t("permission.print2"),
        icon: <img src={printer} alt="printer" />,
        onClick: () => navigate(`/booking/reservation-invoice/${dataToReset?.id}`),
        show: dataToReset?.materials?.length > 0 && dataToReset?.is_approve,
      },
    ];
    return (
      <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />
    );
  };

  const handleConfirmDCancel = async data => {
    if (!data) {
      showError(t("validation.add-note"));
      return;
    }
    try {
      setIsSending(true);
      // const response = await apis.cancel({ id, cancel_reason: data });
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
      // const response = await apis.approve({ id: dataToReset.id });
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

  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
      },
    ];

    return (
      <div className="flex items-center gap-4">
        <BorderedButton
          text={
            isSending && selectedToDelete === row.id ? (
              <LoadingElement color="#000" size={15} />
            ) : (
              t("hair.confirm")
            )
          }
          border="border border-primary"
          textColor="text-primary"
          otherStyle={`!px-6 !py-1  whitespace-nowrap ${
            row.is_completed === 1
              ? "!bg-[#D3D3D3] border !text-accent !cursor-not-allowed font-semibold !border-[#D3D3D3]"
              : ""
          }`}
          disabled={row.is_completed === 1}
          onClick={() => {
            if (row.is_completed !== 1) {
              handelccespt(row.id);
              setSelectedToDelete(row.id);
            }
          }}
        />
        <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />
      </div>
    );
  };

  const handelDelete = async () => {
    try {
      setIsSending(true);
      const response = await materilApis.deleteApi({
        id: selectedToDelete,
        bookId: dataToReset.id,
      });
      refetch();
      showSuccess(response.data?.message);
      setIsSending(false);
      setSelectedToDelete(0);
      setDeleteOpen(false);
    } catch (error) {
      handleBackendErrors({ error });
      setIsSending(false);
    }
  };
  const userPermissionsFromRole = currentUser?.role?.permissions || [];

  return (
    <div className="relative">
      <BreadCrumb
        isAdd
        customStatus={
          <StatusButtonWithMenu
            status={dataToReset?.booking_status}
            userPermissions={userPermissionsFromRole}
            items={bookingStatus}
            isSending={isChangeStatus}
            isSuperAdmin={isUserSuperAdmin}
            disabled={
              !hasPermissionFunction({
                group: PERMISSION_GROUP.HairCare,
                type: PERMISSION_ACTION.change_status,
              })
            }
          />
        }
        isStatue={!isLoading}
        title={TITLE}
        customSection={
          <>
            {dataToReset?.booking_status?.type !== "done" &&
              dataToReset?.booking_status?.type !== "cancel" &&
              dataToReset?.booking_status?.type !== "delayed" &&
              currentUser?.is_approve &&
              !dataToReset?.is_approve && (
                <PrimaryButton
                  text={
                    isSending ? <LoadingElement size={15} /> : t("booking.confirm-your-reservation")
                  }
                  onClick={() => handelApprove()}
                />
              )}
            {dataToReset?.booking_status?.type === "approve" && (
              <Can
                group={
                  PERMISSION_GROUP.BOOKING_BOND || PERMISSION_GROUP.Bill || PERMISSION_GROUP.Cashier
                }
                type={PERMISSION_ACTION.index}
              >
                <div className="flex items-center gap-4">
                  <PrimaryButton
                    text={t("hair.pay")}
                    onClick={() =>
                      navigate("/accounts/vouchers/add", {
                        state: {
                          label: t("bond.booking"),
                          value: "booking_bond",
                          permission: BondPermissionsMap[BondTypes.booking.value],
                          patient: dataToReset?.patient,
                          total: dataToReset?.total,
                          booking_id: dataToReset?.id,
                          service_name: dataToReset?.service?.name,
                        },
                      })
                    }
                  />
                </div>
              </Can>
            )}
            {extraActions2(dataToReset?.booking_status?.type)}
          </>
        }
      />
      <LoadingSection isLoading={isLoading} otherStyle={"h-[80vh]"} />
      <Card otherStyle={"mb-8 !py-6"}>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {bookingInfo.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">{item.label}</p>
              <p className="font-main text-[#333333] text-[0.85rem]">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:w-[80%]">
          {personalInfo.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <p className="font-main text-accent text-[0.75rem]">{item.label}</p>
              <p className="font-main text-[#333333] text-[0.85rem]">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
      <p className="text-primary font-main text-[1rem] mb-4">{t("delayed.medical-info")}</p>
      {dataToReset && (
        <Card otherStyle={"mb-8 !py-6"}>
          <div className="flex flex-col gap-4">
            <p className="font-main text-accent text-[0.75rem]">{t("surgeries.suffer")}</p>
            <p className="font-main text-[#3333333] text-[0.85rem]">
              {dataToReset?.chronic_diseases ? t("common.yes") : t("common.no")},{" "}
              {dataToReset?.chronic_diseases_description}
            </p>
            <p className="font-main text-accent text-[0.75rem]">{t("delayed.drugAllergy")}</p>
            <p className="font-main text-[#3333333] text-[0.85rem]">
              {dataToReset?.drug_allergy ? t("common.yes") : t("common.no")} ,{" "}
              {dataToReset?.drug_allergy_description}
            </p>
          </div>
        </Card>
      )}

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
          onDelete={handelDelete}
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

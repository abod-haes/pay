/* eslint-disable complexity */
/* eslint-disable prefer-template */

import BreadCrumb from "@/components/breadcrumb";
import {
  decryptId,
  encryptId,
  formatSalary,
  formatTimeToSHow,
  getTimeSuffix,
  handleBackendErrors,
} from "@/utils/helpers";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PrimaryButton from "@/components/shared/primaryButton";
import DropdownMenu from "@/components/shared/dropdownMenu";
import Card from "@/components/card";
import PaitientFile from "@/components/surgeries/operation-booking-details/patient-file";
import MedicalInfo from "@/components/surgeries/operation-booking-details/medical-info";
import ProcessData from "@/components/surgeries/operation-booking-details/process-data";
import { useHairTransplantQueries } from "@/apis/booking/hair-transplant/query";
import { useState, useEffect } from "react";
import edit from "@assets/svgs/common/edit-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import { showError, showSuccess } from "@/libs/react.toastify";
import CancelModal from "@/components/shared/modals/cancelModal";
import LoadingElement from "@/components/shared/loading";
import LoadingSection from "@/components/loadingSection";
import { apis } from "@/apis/booking/hair-transplant/api";
import useBookingStatus from "@/hooks/useReservationStatus";
import StatusButtonWithMenu from "@/components/reservationButtonWithMenu";
import { hasPermissionFunction } from "@/utils/helpers";
import {
  PERMISSION_GROUP,
  PERMISSION_ACTION,
  BondTypes,
  BondPermissionsMap,
} from "@/constants/constants";
import { Can } from "@/components/shared/can/can";
import { getUserData, isSuperAdmin } from "@/utils/helpers";
import { formatDateOrTime } from "@/utils/helpers";
import printer from "@assets/svgs/common/printer.svg";
import { useMemo } from "react";
import { truncateText } from "@/utils/helpers";
import { Table } from "@/components/table";
import SurgeriesArchaive from "@/components/surgeries/operation-booking-details/surgeries-archaive";
const HairTransplantDetails = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { id: encryptedId } = useParams();
  const id = encryptedId ? decryptId(encryptedId) : null;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { data, isLoading, refetch } = useHairTransplantQueries.GetOne({ id });

  const dataToReset = data?.data?.data;
  const patientData = dataToReset?.patient;
  const [beforeEyebrowFiles, setBeforeEyebrowFiles] = useState([]);
  const [afterEyebrowFiles, setAfterEyebrowFiles] = useState([]);
  const [afterFirstSessionFiles, setAfterFirstSessionFiles] = useState([]);
  const [afterSecondSessionFiles, setAfterSecondSessionFiles] = useState([]);
  const [afterThreadOpenFiles, setAfterThreadOpenFiles] = useState([]);
  const [isUserSuperAdmin, setUserSuperAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
    setUserSuperAdmin(isSuperAdmin());
  }, []);
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
    [dataToReset?.data]
  );
  const resetFiles = item => {
    const formatFiles = arr =>
      arr?.map(file => ({
        id: file.id, // id من السيرفر
        name: file.name, // اسم الملف
        type: file.mime_type, // نوع الملف
        url: file.url, // رابط مباشر
        uploading: false, // لا يزال مرفوعًا
        media_id: file.id, // نخزن media_id للإرسال لاحقاً
      })) || [];

    setBeforeEyebrowFiles(formatFiles(item.before_eyebrow_transplant));
    setAfterEyebrowFiles(formatFiles(item.after_eyebrow_transplant));
    setAfterFirstSessionFiles(formatFiles(item.after_first_session));
    setAfterSecondSessionFiles(formatFiles(item.after_second_session));
    setAfterThreadOpenFiles(formatFiles(item.after_thread_open));
  };
  useEffect(() => {
    if (data?.data.data.images) {
      resetFiles(data?.data.data.images);
    }
  }, [data?.data.data.images]);
  const details = [
    { label: t("complaints.patient-name"), value: patientData?.full_name },
    { label: t("staff.department"), value: t("home.implant") },
    { label: t("booking.service"), value: dataToReset?.service?.name },
    { label: t("surgeries.doctor-technician"), value: dataToReset?.technician?.full_name || "---" },
    { label: t("surgeries.doctor"), value: dataToReset?.doctor?.full_name || "---" },
    {
      label: t("physician-assistant.physician-assistant"),
      value: dataToReset?.assistant?.full_name || "---",
    },
    { label: t("delayed.date"), value: dataToReset?.date?.split(" ")[0] },
    {
      label: t("delayed.time"),
      value: formatTimeToSHow(dataToReset?.date?.split(" ")[1], i18n),
    },
    { label: t("common.total"), value: formatSalary(Number(dataToReset?.total)) },
  ];

  const extraActions2 = status => {
    const menuItems = [
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () =>
          navigate(`/surgeries/operation-bookings/hair-transplant/${encryptId(dataToReset.id)}`),
        show:
          status !== "done" &&
          status !== "delayed" &&
          status !== "cancel" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.HairTransplant,
            type: PERMISSION_ACTION.update,
          }),
      },
      {
        label: t("surgeries.cancel_surgearies"),
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
        onClick: () => navigate(`/surgeries/surgeries-invoice/${dataToReset?.id}`),
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

  // const handelApprove = async () => {
  //   try {
  //     setIsSending(true);
  //     const response = await apis.approve({ id: dataToReset.id });
  //     showSuccess(response?.data?.message);
  //     refetch();
  //     setIsSending(false);
  //   } catch (error) {
  //     handleBackendErrors({ error: error });
  //     setIsSending(false);
  //   }
  // };

  const handelCloseModal = () => {
    setIsDeleteModalOpen(false);
    refetch();
  };

  const message = t("booking.cancelMessage", {
    name: dataToReset?.patient?.full_name,
    date: dataToReset?.date?.split(" ")[0],
    time: dataToReset?.date?.split(" ")[1] + getTimeSuffix(i18n.language),
  });

  const [isChangeStatus, setIsChangeStatus] = useState(false);
  const offerInfo = [
    {
      label: t("offers.from"),
      value: formatDateOrTime({ input: dataToReset?.offer?.from_date, type: "date" }),
    },
    {
      label: t("offers.to"),
      value: formatDateOrTime({ input: dataToReset?.offer?.to_date, type: "date" }),
    },
    {
      label: t("voucher.discount_type"),
      value:
        dataToReset?.offer?.discount_type === "fixed"
          ? t("offers.fixed")
          : t("employee.percentage"),
    },
    { label: t("voucher.discount_value"), value: dataToReset?.offer?.discount_value },
  ];
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
      handleBackendErrors({ error });
      setIsChangeStatus(false);
    }
  };
  const clickHandlers = {
    onChangeId: id => handelCHangeStatus(id),
  };
  const { bookingStatus } = useBookingStatus(clickHandlers);

  const filteredData = bookingStatus.filter(item => item.value !== "approve");
  const userPermissionsFromRole = currentUser?.role?.permissions || [];

  return (
    <div className="py-2 relative">
      <BreadCrumb
        isAdd
        title={t("surgeries.process-details") + " - " + t("admin.hair")}
        hideBrimaryButton={
          !hasPermissionFunction({
            group: PERMISSION_GROUP.HairTransplant,
            type: PERMISSION_ACTION.index,
          })
        }
        customStatus={
          <StatusButtonWithMenu
            status={data?.data?.data?.booking_status}
            items={filteredData}
            userPermissions={userPermissionsFromRole}
            isSending={isChangeStatus}
            isSuperAdmin={isUserSuperAdmin}
            disabled={
              !hasPermissionFunction({
                group: PERMISSION_GROUP.HairTransplant,
                type: PERMISSION_ACTION.change_status,
              })
            }
          />
        }
        isStatue={!isLoading}
        customSection={
          <>
            {dataToReset?.booking_status?.type !== "done" &&
              dataToReset?.booking_status?.type !== "cancel" &&
              dataToReset?.booking_status?.type !== "delayed" &&
              currentUser?.is_approve &&
              !dataToReset?.is_approve && (
                <PrimaryButton
                  text={isSending ? <LoadingElement size={15} /> : t("surgeries.sure_surgearies")}
                  onClick={() =>
                    navigate("/surgeries/book-operations", {
                      state: {
                        operationId: dataToReset.id,
                        total: dataToReset.total,
                      },
                    })
                  }
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
      <LoadingSection isLoading={isLoading} containerStyle={"h-full"} />

      <Card>
        {/* Details Section */}
        <ul className="grid lg:grid-cols-7 gap-15 md:grid-cols-4 grid-cols-2 w-full">
          {details.map((detail, index) => (
            <li key={index} className="flex gap-4 flex-col text-[0.9rem] py-2">
              <span className="font-normal text-accent">{detail.label}</span>
              <span className="font-normal">{detail.value}</span>
            </li>
          ))}
        </ul>
      </Card>
      {dataToReset?.offer !== null && (
        <>
          {" "}
          <p className="font-main text-[1.25rem] py-6">{t("sidebar.offers")}</p>
          <Card otherStyle={"mb-8 !py-6"}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {offerInfo.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  <p className="font-main text-accent text-[0.75rem] whitespace-nowrap">
                    {item.label}
                  </p>
                  <p className="font-main text-[#333333] text-[0.85rem]">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
      <PaitientFile dataToReset={patientData} />
      <MedicalInfo MedicalInfo={{ ...patientData?.medical_information, ...dataToReset }} />
      {dataToReset?.materials?.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <p className="font-main text-[1.25rem] py-6 ">{t("sidebar.items")}</p>
          </div>
          <Table
            data={rowData || []}
            columns={columns}
            hasSearch={false}
            hasColumnFilters={false}
            isLoading={false}
            hasStickyBreadcrumb={false}
            hasPagination={false}
          />
        </>
      )}

      <ProcessData dataToReset={dataToReset} />
      <SurgeriesArchaive
        setBeforeEyebrowFiles={setBeforeEyebrowFiles}
        beforeEyebrowFiles={beforeEyebrowFiles}
        afterThreadOpenFiles={afterThreadOpenFiles}
        setAfterThreadOpenFiles={setAfterThreadOpenFiles}
        afterSecondSessionFiles={afterSecondSessionFiles}
        setAfterSecondSessionFiles={setAfterSecondSessionFiles}
        afterFirstSessionFiles={afterFirstSessionFiles}
        setAfterFirstSessionFiles={setAfterFirstSessionFiles}
        setAfterEyebrowFiles={setAfterEyebrowFiles}
        afterEyebrowFiles={afterEyebrowFiles}
        title1={t("surgeries.before-hairTransplant")}
        title2={t("surgeries.after-hairTransplant")}
      />
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

export default HairTransplantDetails;

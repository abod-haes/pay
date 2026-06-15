/* eslint-disable complexity */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import DropdownMenu from "@/components/shared/dropdownMenu";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  encryptId,
  getTimeSuffix,
  handleBackendErrors,
  hasPermissionFunction,
  truncateText,
} from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import Mony from "@assets/svgs/common/moneys.svg";
import Approve from "@assets/svgs/hair-care/tick-circle.svg";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import PrimaryButton from "@/components/shared/primaryButton";
import RenderStatus from "@/components/statusButton";
import DateUnderTime from "@/components/dateUnderTime";
import NameCell from "@/components/namecellLink";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { useGeneralBookingQueries } from "@/apis/booking/general-booking/query";
import {
  BondPermissionsMap,
  BondTypes,
  BookingStatus,
  BookingVia,
  PERMISSION_ACTION,
  PERMISSION_GROUP,
} from "@/constants/constants";
import useBookingSections from "@/hooks/useBookingSection";
import { showError, showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/booking/general-booking/api";
import CancelModal from "@/components/shared/modals/cancelModal";
import { useForm } from "react-hook-form";
import useBookingStatus from "@/hooks/useBookingStatus";
import useServices from "@/hooks/useServises";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import SelectField from "@/components/shared/select";
import { Can } from "@/components/shared/can/can";

const Booking = () => {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();
  const { bookingVia } = useBookingSections();
  const { control, watch, reset } = useForm({
    defaultValues: { section: null, service_id: null, status: null, date: null },
  });

  const { data, isLoading, refetch } = useGeneralBookingQueries.GetAll({
    page: state.pageIndex,
    per_page: state.pageSize,
    booking_via: "direct",
    search: state.searchValue ? state.searchValue : null,
    section: watch("section")?.value,
    service_id: watch("service_id")?.value,
    status: watch("status")?.value,
    date: watch("date"),
  });

  const translatedBooking = {
    facebook: t("booking.facebook"),
    instagram: t("booking.instagram"),
    direct: t("booking.direct"),
    other: t("booking.other"),
  };

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        patient: truncateText({ text: item.patient?.full_name, maxLength: 20 }),
        patient_id: item.patient?.id,
        department: item.section,
        service: item.service?.name,
        date: item.date?.split(" ")[0],
        time: item.date?.split(" ")[1],
        bookedBy: translatedBooking[item.booking_via],
        status: item.booking_status,
        patientx: item.patient,
        total: item.total,
      })) || [],
    [data?.data]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "id_show",
        header: "#",
        enableColumnFilter: true,
      },
      {
        accessorKey: "patient",
        header: t("booking.patient"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          const hasPermission = hasPermissionFunction({
            group: PERMISSION_GROUP.Patient,
            type: PERMISSION_ACTION.index,
          });

          if (hasPermission) {
            return (
              <NameCell
                text={row.original.patient}
                to={`/patient-details/${encryptId(String(row.original.patient_id))}`}
              />
            );
          } else {
            return <span>{row.original.patient}</span>;
          }
        },
      },
      {
        accessorKey: "department",
        header: t("booking.department"),
        cell: ({ row }) => {
          const sectionObj = bookingVia.find(s => s.value === row.original.department);
          return <p>{sectionObj.label}</p>;
        },
      },
      { accessorKey: "service", header: t("booking.service") },
      {
        accessorKey: "dateTime",
        header: t("booking.date-time"),
        cell: ({ row }) => <DateUnderTime date={row.original.date} time={row.original.time} />,
      },
      { accessorKey: "bookedBy", header: t("booking.booked-by") },
      {
        accessorKey: "status",
        header: t("booking.status"),
        cell: ({ row }) => RenderStatus(row.original.status),
      },
    ],
    [t]
  );

  // ✅ Handlers
  const handlePageSizeChange = newPageSize => {
    dispatch({ type: branchesActions.pageSize, payload: newPageSize });
  };

  const handlePreviousPage = () => {
    dispatch({ type: branchesActions.pageIndex, payload: Math.max(0, state.pageIndex - 1) });
  };

  const handleNextPage = () => {
    dispatch({ type: branchesActions.pageIndex, payload: state.pageIndex + 1 });
  };

  const handleGotoPage = page => {
    dispatch({ type: branchesActions.pageIndex, payload: page });
  };

  const handleEdit = row => navigate(`/booking/implanted-patients/${encryptId(row.id)}`);

  const handleDelete = row => {
    dispatch({ type: branchesActions.openDeleteModal, payload: true });
    dispatch({ type: branchesActions.selectedId, payload: row.id });
  };
  const handleShow = row =>
    navigate(`/booking/general-booking-details/${encryptId(row.id)}`, {
      state: "implanted-patients",
    });

  const handelApprove = async id => {
    try {
      dispatch({ type: branchesActions.isSending, payload: true });
      const response = await apis.approve({ id });
      dispatch({ type: branchesActions.isSending, payload: false });
      showSuccess(response?.data?.message);
      refetch();
    } catch (error) {
      handleBackendErrors({ error: error });
      dispatch({ type: branchesActions.isSending, payload: false });
    }
  };

  // إنشاء extraActions باستخدام DropdownMenu
  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"),
        icon: <img src={show} alt="show" />, // أيقونة فقط
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Booking,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("booking.confirm-your-reservation"), // النص هنا
        icon: <img src={Approve} alt="approve" />, // أيقونة فقط
        onClick: () => handelApprove(row.id),
        show:
          row.status === "wait" &&
          (hasPermissionFunction({
            group: PERMISSION_GROUP.Bond,
            type: PERMISSION_ACTION.index,
          }) ||
            hasPermissionFunction({
              group: PERMISSION_GROUP.Bill,
              type: PERMISSION_ACTION.index,
            }) ||
            hasPermissionFunction({
              group: PERMISSION_GROUP.Cashier,
              type: PERMISSION_ACTION.index,
            })),
      },
      {
        label: t("hair.pay"), // النص هنا
        icon: <img src={Mony} alt="mony" />, // أيقونة فقط
        onClick: () =>
          navigate("/accounts/vouchers/add", {
            state: {
              label: t("bond.booking"),
              value: "booking_bond",
              permission: BondPermissionsMap[BondTypes.booking.value],
              patient: row?.patientx,
              total: row?.total,
              booking_id: row?.id,
              service_name: row?.service,
            },
          }),
        show:
          row.status === "approve" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Bond,
            type: PERMISSION_ACTION.create,
          }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show:
          row.status !== "done" &&
          row.status !== "delayed" &&
          row.status !== "cancel" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Booking,
            type: PERMISSION_ACTION.update,
          }),
      },
      {
        label: t("hair.cancel"),
        icon: <img src={deleteIcon} alt="cancel" />,
        onClick: () => {
          dispatch({ type: branchesActions.isDeleteModalOpen, payload: true });
          dispatch({ type: branchesActions.selectedData, payload: row });
        },
        show:
          row.status === "wait" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Booking,
            type: PERMISSION_ACTION.change_status,
          }),
      },
      {
        label: t("surgeries.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Booking,
          type: PERMISSION_ACTION.delete,
        }),
      },
    ];
    return (
      <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />
    );
  };

  const handelDelete = async () => {
    try {
      dispatch({ type: branchesActions.isSending, payload: true });
      const response = await apis.deleteApi({ id: state.selectedId });
      dispatch({ type: branchesActions.openDeleteModal, payload: false });
      refetch();
      showSuccess(response.data?.message);
      dispatch({ type: branchesActions.isSending, payload: false });
      dispatch({ type: branchesActions.selectedId, payload: null });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: branchesActions.openDeleteModal, payload: false });
      dispatch({ type: branchesActions.isSending, payload: false });
    }
  };

  const handleConfirmDCancel = async data => {
    if (!data) {
      showError(t("validation.add-note"));
      return;
    }
    try {
      dispatch({ type: branchesActions.isSending, payload: true });
      const response = await apis.cancel({ id: state.selectedData.id, cancel_reason: data });
      showSuccess(response?.data?.message);
      dispatch({ type: branchesActions.isSending, payload: false });
      dispatch({ type: branchesActions.isDeleteModalOpen, payload: false });
      dispatch({ type: branchesActions.selectedData, payload: null });
      refetch();
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: branchesActions.isDeleteModalOpen, payload: false });
      dispatch({ type: branchesActions.isSending, payload: false });
    }
  };

  const handelCloseModal = () => {
    dispatch({ type: branchesActions.isDeleteModalOpen, payload: false });
    dispatch({ type: branchesActions.selectedData, payload: null });
    dispatch({ type: branchesActions.selectedId, payload: 0 });
    dispatch({ type: branchesActions.openDeleteModal, payload: false });
  };

  const message = useMemo(
    () =>
      t("booking.cancelMessage", {
        name: state.selectedData?.patient,
        date: state.selectedData?.date,
        time: state.selectedData?.time + getTimeSuffix(i18n.language),
      }),
    [state.selectedData]
  );
  const { bookingStatus } = useBookingStatus();
  const { services, isLoadingServices } = useServices({
    type: "other",
    section: watch("section")?.value,
  });

  const onResetFilter = () => {
    reset();
    dispatch({ type: branchesActions.pageIndex, payload: 1 });
  };

  const filterItems = [
    {
      id: 1,
      component: (
        <SelectField
          name="section"
          control={control}
          options={bookingVia}
          placeholder={t("staff.department")}
        />
      ),
    },
    {
      id: 2,
      component: (
        <SelectField
          name="service_id"
          control={control}
          options={services}
          loading={isLoadingServices}
          disabled={!watch("section")?.value}
          placeholder={t("booking.service")}
        />
      ),
    },
    {
      id: 3,
      component: (
        <SelectField
          name="status"
          control={control}
          options={bookingStatus}
          placeholder={t("booking.status")}
        />
      ),
    },
    {
      id: 4,
      component: (
        <ControlledTimeField name="date" placeholder={t("delayed.date")} control={control} />
      ),
    },
  ];

  return (
    <div>
      {/* <Can group={PERMISSION_GROUP.Booking} type={PERMISSION_ACTION.create}> */}
      <BreadCrumb
        title={t("sidebar.patients-without-reservation")}
        link={"/booking/implanted-patients/add"}
        onClick={() => navigate("/booking/implanted-patients/add")}
        buttonText={t("booking.add-booking")}
        hideBrimaryButton={
          !hasPermissionFunction({
            group: PERMISSION_GROUP.Booking,
            type: PERMISSION_ACTION.create,
          })
        }
        customSection={
          <Can group={PERMISSION_GROUP.Booking} type={PERMISSION_ACTION.create}>
            <PrimaryButton
              text={t("booking.reservation")}
              otherStyle={"bg-white !text-primary border border-primary"}
              onClick={() => navigate("/patient/add")}
            />
          </Can>
        }
      />
      {/* </Can> */}
      <Table
        data={rowData || []}
        columns={columns}
        pageSize={state.pageSize}
        pageIndex={state.pageIndex}
        totalPages={data?.meta?.last_page}
        onPageSizeChange={handlePageSizeChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onGotoPage={handleGotoPage}
        onEdit={handleEdit}
        onShow={handleShow}
        permissionGroup={PERMISSION_GROUP.Booking}
        hasSearch={true}
        searchValue={state.searchValue}
        onDelete={handleDelete}
        onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
        searchPlaceholder={t("common.searchPlaceholder")}
        hasColumnFilters={false}
        isLoading={isLoading}
        useFullHeight={true}
        hasStickyBreadcrumb={true}
        extraActions={extraActions}
        onResetFilters={onResetFilter}
        filterElements={filterItems}
      />

      {state.openDeleteModal && (
        <DeleteModal
          isOpen={state.openDeleteModal}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("booking.delete-booking")}
          warning={t("delayed.warning")}
          deleteText={t("booking.delete-booking")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
      {state.isDeleteModalOpen && (
        <CancelModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handleConfirmDCancel}
          title={t("hair.cancel")}
          warning={message}
          deleteText={t("hair.cancel")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </div>
  );
};

export default Booking;

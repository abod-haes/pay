/* eslint-disable complexity */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import DropdownMenu from "@/components/shared/dropdownMenu";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  encryptId,
  formatTimeToSHow,
  getTimeSuffix,
  getUserData,
  handleBackendErrors,
  hasPermissionFunction,
  truncateText,
} from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import Mony from "@assets/svgs/common/moneys.svg";
import Approve from "@assets/svgs/hair-care/tick-circle.svg";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import DateUnderTime from "@/components/dateUnderTime";
import NameCell from "@/components/namecellLink";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { useGeneralBookingQueries } from "@/apis/booking/general-booking/query";
import {
  BondPermissionsMap,
  BondTypes,
  PERMISSION_ACTION,
  PERMISSION_GROUP,
} from "@/constants/constants";
import useBookingSections from "@/hooks/useBookingSection";
import { showError, showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/booking/general-booking/api";
import CancelModal from "@/components/shared/modals/cancelModal";
import { useForm } from "react-hook-form";
import useServices from "@/hooks/useServises";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import SelectField from "@/components/shared/select";
import useBookingVia from "@/hooks/useBookingia";
import RenderStatus from "@/components/reservationButton";
import AddDoctorModal from "@/components/shared/modals/addDoctorModal";
import user from "@assets/svgs/common/user1.svg";
import AddTechnicianModal from "@/components/shared/modals/addTechnicianModal";
import useEmployees from "@/hooks/useEmployess";
import finish from "@/assets/svgs/common/close-filter.svg";
import useGetBookingStatus from "@/hooks/useGetBookingStatus";

const Booking = ({
  patient_id,
  hideFilter,
  customHeight,
  hideTitle,
  customTitle,
  hideSearch = false,
}) => {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();
  const { bookingVia } = useBookingSections();
  const { bookingVia: booking_Via } = useBookingVia();
  const { control, watch, reset, setValue } = useForm({
    defaultValues: { section: null, service_id: null, status: null, date: null, employee_id: null },
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
  }, []);
  const userInfo = localStorage.getItem("authData");
  const parseUserData = JSON.parse(userInfo);
  const isEmployee = parseUserData?.user?.type === "employee";
  const { data, isLoading, refetch } = useGeneralBookingQueries.GetAll({
    page: state.pageIndex,
    per_page: state.pageSize,
    search: state.searchValue ? state.searchValue : null,
    section: watch("section")?.value,
    service_id: watch("service_id")?.value,
    booking_status_id: watch("status")?.value,
    date: watch("date"),
    patient_id: patient_id,
    employee_id: watch("employee_id"),
  });

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: (state.pageIndex - 1) * state.pageSize + index + 1,
        patient: truncateText({ text: item.patient?.full_name, maxLength: 20 }),
        patient_id: item.patient?.id,
        patientx: item.patient,
        total: item.total,
        department: item.section,
        is_approve: item.is_approve,
        service: item.service?.name,
        employee: item.employee?.full_name,
        type: item?.service?.type,
        date: item.date?.split(" ")[0],
        time: formatTimeToSHow(item.date?.split(" ")[1], i18n),
        bookedBy: booking_Via?.find(_item => _item?.value.includes(item.booking_via))?.label,
        status: item.booking_status,
        doctor_assigned: item.doctor_id !== null,
        technician_assigned: item.technician_id !== null,
        assistant_assigned: item.assistant_id !== null,
        statueName: item.booking_status?.type,
      })) || [],
    [data?.data],
  );

  const columns = useMemo(() => {
    const baseColumns = [
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
      { accessorKey: "employee", header: t("surgeries.admin-name"), showOnlyForNonEmployees: true },
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
    ];

    return baseColumns.filter(col => (col.showOnlyForNonEmployees ? !isEmployee : true));
  }, [isEmployee, i18n.language, t]);

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
  const handleAddEmployee = row => {
    dispatch({ type: branchesActions.openAddDoctorModal, payload: true });
    dispatch({ type: branchesActions.setSelectedBookingId, payload: row.id });
  };
  const handleAddTechnician = row => {
    dispatch({ type: branchesActions.openAddTechnicianModal, payload: true });
    dispatch({ type: branchesActions.setSelectedBookingId, payload: row.id });
  };
  const handleAssignDoctor = async formData => {
    if (!state.selectedBookingId) return;

    try {
      dispatch({ type: branchesActions.isSending, payload: true });

      const response = await apis.assignDoctor({
        id: state.selectedBookingId,
        doctor_id: formData.doctor_id?.value,
      });

      showSuccess(response?.data?.message);
      dispatch({ type: branchesActions.openAddDoctorModal, payload: false });
      dispatch({ type: branchesActions.setSelectedBookingId, payload: null });

      refetch();
    } catch (error) {
      handleBackendErrors({ error });
    } finally {
      dispatch({ type: branchesActions.isSending, payload: false });
    }
  };
  const handleAssignTechnician = async formData => {
    if (!state.selectedBookingId) return;

    try {
      dispatch({ type: branchesActions.isSending, payload: true });

      const response = await apis.assignTechnician({
        id: state.selectedBookingId,
        technician_id: formData.technician_id?.value,
        assistant_id: formData.assistant_id?.value,
      });

      showSuccess(response?.data?.message);
      dispatch({ type: branchesActions.openAddTechnicianModal, payload: false });
      dispatch({ type: branchesActions.setSelectedBookingId, payload: null });

      refetch();
    } catch (error) {
      handleBackendErrors({ error });
    } finally {
      dispatch({ type: branchesActions.isSending, payload: false });
    }
  };
  const handleCloseAddTechnicianModal = () => {
    dispatch({ type: branchesActions.openAddTechnicianModal, payload: false });
    dispatch({ type: branchesActions.setSelectedBookingId, payload: null });
  };
  const handleCloseAddDoctorModal = () => {
    dispatch({ type: branchesActions.openAddDoctorModal, payload: false });
    dispatch({ type: branchesActions.setSelectedBookingId, payload: null });
  };
  const handleEdit = row => {
    // if (row.type === "other") {
    navigate(`/booking/reservation-patients/${encryptId(row.id)}`);
    // } else {
    //   if (!row.type.includes("eyebrow_transplant")) {
    //     navigate(`/surgeries/operation-bookings/hair-transplant/${encryptId(row.id)}`);
    //   } else {
    //     navigate(`/surgeries/operation-bookings/eyebrow-transplant/${encryptId(row.id)}`);
    //   }
    // }
  };

  const handleDelete = row => {
    dispatch({ type: branchesActions.openDeleteModal, payload: true });
    dispatch({ type: branchesActions.selectedId, payload: row.id });
  };
  const handleShow = row => {
    // if (row.type === "other") {
    navigate(`/booking/general-booking-details/${encryptId(row.id)}`, {
      state: "reservation-patients",
    });
    // } else {
    //   if (!row.type.includes("eyebrow_transplant")) {
    //     navigate(`/surgeries/operation-bookings/hair-transplant-details/${encryptId(row.id)}`);
    //   } else {
    //     navigate(`/surgeries/operation-bookings/eyebrow-transplant-details/${encryptId(row.id)}`);
    //   }
    // }
  };

  const handelApprove = async id => {
    try {
      dispatch({ type: branchesActions.isSending, payload: true });
      const response = await apis.changeStatus({ id, booking_type: "approve" });
      dispatch({ type: branchesActions.isSending, payload: false });
      showSuccess(response?.data?.message);
      refetch();
    } catch (error) {
      handleBackendErrors({ error: error });
      dispatch({ type: branchesActions.isSending, payload: false });
    }
  };

  const handelChangeStatus = async id => {
    try {
      dispatch({ type: branchesActions.isSending, payload: true });
      const response = await apis.changeStatus({ id, booking_type: "done" });
      dispatch({ type: branchesActions.isSending, payload: false });
      showSuccess(response?.data?.message);
      refetch();
    } catch (error) {
      handleBackendErrors({ error: error });
      dispatch({ type: branchesActions.isSending, payload: false });
    }
  };

  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"),
        icon: <img src={show} alt="show" />,
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Booking,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("doctors.add-doctor"),
        icon: <img src={user} alt="user" />,
        onClick: () => handleAddEmployee(row),
        show:
          !row.doctor_assigned &&
          row.statueName !== "done" &&
          row.statueName !== "cancel" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Booking,
            type: PERMISSION_ACTION.assign_doctor,
          }),
      },
      {
        label: t("salary.add"),
        icon: <img src={user} alt="user" />,
        onClick: () => handleAddTechnician(row),
        show:
          row.doctor_assigned &&
          !row.technician_assigned &&
          row.statueName !== "done" &&
          row.statueName !== "cancel" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Booking,
            type: PERMISSION_ACTION.assign_technician,
          }),
      },
      {
        label: t("booking.confirm-your-reservation"),
        icon: <img src={Approve} alt="approve" />,
        onClick: () => handelApprove(row.id),
        show:
          row.statueName !== "done" &&
          row.statueName !== "delayed" &&
          row.statueName !== "cancel" &&
          row.statueName !== "approve" &&
          !row.is_approve &&
          currentUser?.is_approve,
      },
      {
        label: t("hair.pay"),
        icon: <img src={Mony} alt="mony" />,
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
              type: "catch",
            },
          }),
        show:
          row.statueName === "approve" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.BOOKING_BOND,
            type: PERMISSION_ACTION.create,
          }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show:
          row.statueName !== "done" &&
          row.statueName !== "delayed" &&
          row.statueName !== "cancel" &&
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
          row.statueName !== "done" &&
          row.statueName !== "delayed" &&
          row.statueName !== "cancel" &&
          currentUser?.is_cancel,
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
      {
        label: t("hair.done"),
        icon: <img src={finish} alt="done" />,
        onClick: () => handelChangeStatus(row.id),
        show:
          row.statueName !== "done" &&
          row.statueName !== "delayed" &&
          row.statueName !== "cancel" &&
          currentUser?.is_done,
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
      const response = await apis.changeStatus({
        id: state.selectedData.id,
        cancel_reason: data,
        booking_type: "cancel",
      });
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
  const sectionValue = watch("section");
  useEffect(() => {
    if (!sectionValue?.value) {
      setValue("service_id", null);
    }
  }, [sectionValue, setValue]);

  const message = useMemo(
    () =>
      t("booking.cancelMessage", {
        name: state.selectedData?.patient,
        date: state.selectedData?.date,
        time: state.selectedData?.time + getTimeSuffix(i18n.language),
      }),
    [state.selectedData],
  );
  const { isLoadingCities, items: bookingStatus } = useGetBookingStatus();
  const { services, isLoadingServices } = useServices({
    section: watch("section")?.value,
  });

  const onResetFilter = () => {
    reset();
    dispatch({ type: branchesActions.pageIndex, payload: 1 });
  };
  const { isLoadingEmployees2, items: employees2 } = useEmployees({ type: "employee" });

  const filterItems = [
    {
      id: 1,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="section"
            control={control}
            options={bookingVia}
            placeholder={t("staff.department")}
          />
        </div>
      ),
    },
    {
      id: 2,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="service_id"
            control={control}
            options={services}
            loading={isLoadingServices}
            disabled={!watch("section")?.value}
            placeholder={t("booking.service")}
          />
        </div>
      ),
    },
    {
      id: 3,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="status"
            control={control}
            options={bookingStatus}
            placeholder={t("booking.status")}
            loading={isLoadingCities}
          />
        </div>
      ),
    },
    {
      id: 4,
      component: (
        <div className="w-[300px]">
          <ControlledTimeField name="date" placeholder={t("delayed.date")} control={control} />
        </div>
      ),
    },
    {
      id: 6,
      showOnlyForNonEmployees: true,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="employee_id"
            control={control}
            options={employees2}
            placeholder={t("surgeries.admin-name")}
            loading={isLoadingEmployees2}
          />
        </div>
      ),
    },
  ];
  const visibleFilterItems = useMemo(() => {
    return filterItems.filter(item => (item.showOnlyForNonEmployees ? !isEmployee : true));
  }, [isEmployee, filterItems]);
  return (
    <div>
      {!hideTitle && (
        <BreadCrumb
          title={t("sidebar.reservations")}
          link={"/booking/reservation-patients"}
          onClick={() => navigate("/booking/reservation-patients/add")}
          buttonText={t("booking.add-booking")}
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.Booking,
              type: PERMISSION_ACTION.create,
            })
          }
        />
      )}
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
        hasSearch={!hideSearch}
        searchValue={state.searchValue}
        onDelete={handleDelete}
        onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
        searchPlaceholder={t("common.searchPlaceholder")}
        hasColumnFilters={false}
        isLoading={isLoading}
        useFullHeight={customHeight ? false : true}
        customHeight={customHeight}
        hasStickyBreadcrumb={true}
        hideFilter={hideFilter}
        extraActions={extraActions}
        onResetFilters={onResetFilter}
        filterElements={visibleFilterItems}
        customTitle={customTitle}
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
      {state.isAddDoctorModalOpen && (
        <AddDoctorModal
          isOpen={state.isAddDoctorModalOpen}
          onClose={handleCloseAddDoctorModal}
          onSubmit={handleAssignDoctor}
          isSubmitting={state.isSending}
        />
      )}
      {state.isAddTechnicianModalOpen && (
        <AddTechnicianModal
          isOpen={state.isAddTechnicianModalOpen}
          onClose={handleCloseAddTechnicianModal}
          onSubmit={handleAssignTechnician}
          isSubmitting={state.isSending}
        />
      )}
    </div>
  );
};

export default Booking;

/* eslint-disable complexity */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import DropdownMenu from "@/components/shared/dropdownMenu";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useEffect, useMemo, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  encryptId,
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
import RenderStatus from "@/components/reservationButton";
import DateUnderTime from "@/components/dateUnderTime";
import NameCell from "@/components/namecellLink";
import DeleteModal from "@/components/shared/modals/deleteModal";
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
import useServices from "@/hooks/useServises";
import SelectField from "@/components/shared/select";
import { useInjectionsQueries } from "@/apis/booking/injections/query";
import SmallCard from "@/components/smallCard";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import AddDoctorModal from "@/components/shared/modals/addDoctorModal";
import user from "@assets/svgs/common/user1.svg";
import AddTechnicianModal from "@/components/shared/modals/addTechnicianModal";
import useEmployees from "@/hooks/useEmployess";
import finish from "@/assets/svgs/common/close-filter.svg";
import useGetBookingStatus from "@/hooks/useGetBookingStatus";

const Booking = () => {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();
  const { bookingVia } = useBookingSections();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
  }, []);

  const { control, watch, reset } = useForm({
    defaultValues: {
      section: null,
      service_id: null,
      status: null,
      date: null,
      date_from: null,
      date_to: null,
      employee_id: null,
    },
  });

  const { data, isLoading, refetch } = useInjectionsQueries.GetAll({
    page: state.pageIndex,
    per_page: state.pageSize,
    search: state.searchValue ? state.searchValue : null,
    section: watch("section")?.value,
    service_id: watch("service_id")?.value,
    booking_status_id: watch("status")?.value,
    date: watch("date"),
    employee_id: watch("employee_id"),

    date_between:
      watch("date_from") && watch("date_to") ? `${watch("date_from")},${watch("date_to")}` : null,
  });
  const userInfo = localStorage.getItem("authData");
  const parseUserData = JSON.parse(userInfo);
  const isEmployee = parseUserData?.user?.type === "employee";
  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        name: truncateText({ text: item.patient?.full_name, maxLength: 20 }),
        patient_id: item.patient?.id,
        department: item.section,
        service: item.service?.name,
        date: item.date?.split(" ")[0],
        time: item.date?.split(" ")[1],
        doctor: item.technician?.full_name,
        bookedBy: BookingVia[item.booking_via]?.value,
        status: item.booking_status,
        patientx: item.patient,
        total: item.total,
        employee: item.employee?.full_name,
        is_approve: item.is_approve,
        doctor_assigned: item.doctor_id !== null,
        technician_assigned: item.technician_id !== null,
        assistant_assigned: item.assistant_id !== null,
        statueName: item.booking_status?.type,
      })) || [],
    [data?.data]
  );

  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "id_show",
        header: "#",
        enableColumnFilter: true,
      },
      {
        accessorKey: "name",
        header: t("complaints.name"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          const hasPermission = hasPermissionFunction({
            group: PERMISSION_GROUP.Patient,
            type: PERMISSION_ACTION.index,
          });

          if (hasPermission) {
            return (
              <NameCell
                text={row.original.name}
                to={`/patient-details/${encryptId(String(row.original.patient_id))}`}
              />
            );
          } else {
            return <span>{row.original.name}</span>;
          }
        },
      },
      { accessorKey: "employee", header: t("surgeries.admin-name"), showOnlyForNonEmployees: true },

      {
        accessorKey: "department",
        header: t("booking.department"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          const sectionObj = bookingVia.find(s => s.value === row.original.department);
          return <p>{sectionObj.label}</p>;
        },
      },

      {
        accessorKey: "service",
        header: t("booking.service"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "date",
        header: t("booking.date-time"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          const [datePart, timePart] = row.original.date.split("   ");
          return <DateUnderTime date={datePart} time={timePart} />;
        },
      },

      { accessorKey: "doctor", header: t("surgeries.doctor-technician"), enableColumnFilter: true },
      {
        accessorKey: "statue",
        header: t("booking.status"),
        enableColumnFilter: true,
        // cell: ({ row }) => (
        //   <span className="bg-[#F49A13] text-white rounded px-6 py-1">{row.original.statue}</span>
        // ),
        cell: ({ row }) => RenderStatus(row.original.status),
      },
    ];

    // 🔥 remove admin column if isEmployee === true
    return baseColumns.filter(col => (col.showOnlyForNonEmployees ? !isEmployee : true));
  }, [isEmployee, i18n.language, t]);

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

  const handleEdit = row => navigate(`/injections/add-injections/${encryptId(row.id)}`);

  const handleDelete = row => {
    dispatch({ type: branchesActions.openDeleteModal, payload: true });
    dispatch({ type: branchesActions.selectedId, payload: row.id });
  };
  const handleShow = row => navigate(`/injections/${encryptId(row.id)}`, { state: "injections" });

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

  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"),
        icon: <img src={show} alt="show" />,
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Injection,
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
            group: PERMISSION_GROUP.Injection,
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
            group: PERMISSION_GROUP.Injection,
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
            group: PERMISSION_GROUP.Injection,
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
          group: PERMISSION_GROUP.Injection,
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

  const message = useMemo(
    () =>
      t("booking.cancelMessage", {
        name: state.selectedData?.patient,
        date: state.selectedData?.date,
        time: state.selectedData?.time + getTimeSuffix(i18n.language),
      }),
    [state.selectedData]
  );
  const { services, isLoadingServices } = useServices({
    type: "other",
    section: watch("section")?.value,
  });

  const onResetFilter = () => {
    reset();
    dispatch({ type: branchesActions.pageIndex, payload: 1 });
  };
  const { isLoadingEmployees2, items: employees2 } = useEmployees({ type: "employee" });
  const { isLoadingCities, items: bookingStatus } = useGetBookingStatus();

  const filterItems = [
    {
      id: 1,
      component: (
        <div className="w-full md:w-[300px]">
          <SelectField
            name="service_id"
            control={control}
            options={services}
            loading={isLoadingServices}
            // disabled={!watch("section")?.value}
            placeholder={t("booking.service")}
          />
        </div>
      ),
    },
    {
      id: 2,
      component: (
        <div className="w-full md:w-[300px]">
          <SelectField
            name="status"
            control={control}
            options={bookingStatus}
            loading={isLoadingCities}
            placeholder={t("booking.status")}
          />
        </div>
      ),
    },
    {
      id: 3,
      component: (
        <div className="w-[250px]">
          <ControlledTimeField
            name="date_from"
            control={control}
            placeholder={t("holiday.startDate")}
          />
        </div>
      ),
    },
    {
      id: 4,
      component: (
        <div className="w-[250px]">
          <ControlledTimeField
            name="date_to"
            control={control}
            placeholder={t("holiday.endDate")}
          />
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
      <BreadCrumb
        title={t("injection.title")}
        showArrow={false}
        onClick={() => navigate("/injections/add-injections/add")}
        buttonText={t("booking.add-booking")}
        hideBrimaryButton={
          !hasPermissionFunction({
            group: PERMISSION_GROUP.Injection,
            type: PERMISSION_ACTION.create,
          })
        }
      />
      <div className="flex md:flex-row flex-col items-center gap-4 mb-4">
        <SmallCard icon={user} title={t("hair.today-count")} text={data?.today || 0} />
        <SmallCard icon={user} title={t("hair.total-count")} text={data?.total || 0} />
      </div>
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
        permissionGroup={PERMISSION_GROUP.Injection}
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
        filterElements={visibleFilterItems}
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

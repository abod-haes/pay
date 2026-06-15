/* eslint-disable complexity */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useReducer, useState } from "react";
import { Table } from "@/components/table";
import BreadCrumb from "@/components/breadcrumb";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  encryptId,
  getTimeSuffix,
  getUserData,
  handleBackendErrors,
  hasPermissionFunction,
  Permissions,
  truncateText,
} from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import Mony from "@assets/svgs/common/moneys.svg";
import Approve from "@assets/svgs/hair-care/tick-circle.svg";
import DropdownMenu from "@/components/shared/dropdownMenu";
import CancelModal from "@/components/shared/modals/cancelModal";
import PrimaryButton from "@/components/shared/primaryButton";
import Arrow from "@/assets/svgs/common/white-arrow.svg";
import MenuButton from "@/components/menuButton";
import RenderStatus from "@/components/reservationButton";
import DateUnderTime from "@/components/dateUnderTime";
import NameCell from "@/components/namecellLink";
import { useForm } from "react-hook-form";
import useBookingStatus from "@/hooks/useBookingStatus";
import useServices from "@/hooks/useServises";
import { branchesActions, branchesReducer, initialValues } from "@/reducers/branches";
import {
  BondPermissionsMap,
  BondTypes,
  BookingStatus,
  PERMISSION_ACTION,
  PERMISSION_GROUP,
} from "@/constants/constants";
import { showError, showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/booking/hair-transplant/api";
import DeleteModal from "@/components/shared/modals/deleteModal";
import SelectField from "@/components/shared/select";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import { useHairTransplantQueries } from "@/apis/booking/hair-transplant/query";
import useEmployees from "@/hooks/useEmployess";
import { Can } from "@/components/shared/can/can";
import AddDoctorModal from "@/components/shared/modals/addDoctorModal";
import user1 from "@assets/svgs/common/user1.svg";
import AddTechnicianModal from "@/components/shared/modals/addTechnicianModal";
import { isSuperAdmin } from "@/utils/helpers";
import finish from "@/assets/svgs/common/close-filter.svg";
import useGetBookingStatus from "@/hooks/useGetBookingStatus";

export default function OperationBooking() {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();
  const { control, watch, reset } = useForm({
    defaultValues: { section: null, service_id: null, status: null, date: null, employee_id: null },
  });

  const { data, isLoading, refetch } = useHairTransplantQueries.GetAll({
    page: state.pageIndex,
    per_page: state.pageSize,
    search: state.searchValue ? state.searchValue : null,
    booking_status_id: watch("status")?.value,
    service_id: watch("service_id")?.value,
    employee_id: watch("employee_id"),
    technician_id: watch("technician_id")?.value,
    date: watch("date"),
  });

  const { services, isLoadingServices } = useServices({
    section: watch("section")?.value,
  });
  const items = services?.filter(item => item.type !== "other");
  const userInfo = localStorage.getItem("authData");
  const parseUserData = JSON.parse(userInfo);
  const isEmployee = parseUserData?.user?.type === "employee";

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        name: truncateText({ text: item.patient?.full_name, maxLength: 20 }),
        service: truncateText({ text: item.service?.name, maxLength: 5 }),
        phoneNumber: item.patient?.first_phone_number,
        date: item.date?.split(" ")[0],
        time: item.date?.split(" ")[1],
        status: item.booking_status,
        employee: item.employee?.full_name,
        is_approve: item.is_approve,
        adminName: item.employee?.full_name,
        service_id: item.service_id,
        type: item?.service?.type,
        patient_id: item?.patient.id,
        patientx: item.patient,
        total: item.total,
        doctor_assigned: item.doctor_id !== null,
        technician_assigned: item.technician_id !== null,
        assistant_assigned: item.assistant_id !== null,
        statueName: item.booking_status?.type,
      })) || [],
    [data?.data, state.pageIndex, state.pageSize]
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
  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "id_show",
        header: "#",
        enableColumnFilter: true,
      },
      {
        accessorKey: "name",
        header: t("surgeries.patient"),
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
        accessorKey: "phoneNumber",
        header: t("common.phone-number"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "service",
        header: t("surgeries.surgery-type"),
        enableColumnFilter: true,
      },

      {
        accessorKey: "date",
        header: t("common.date-and-time"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          return <DateUnderTime date={row.original.date} time={row.original.time} />;
        },
      },

      {
        accessorKey: "statue",
        header: t("complaints.statue"),
        enableColumnFilter: true,
        cell: ({ row }) => RenderStatus(row.original.status),
      },
    ];

    // 🔥 remove admin column if isEmployee === true
    return baseColumns.filter(col => (col.showOnlyForNonEmployees ? !isEmployee : true));
  }, [isEmployee, i18n.language, t]);

  const handleEdit = row => {
    if (!row.type.includes("eyebrow_transplant")) {
      navigate(`/surgeries/operation-bookings/hair-transplant/${encryptId(row.id)}`);
    } else {
      navigate(`/surgeries/operation-bookings/eyebrow-transplant/${encryptId(row.id)}`);
    }
  };
  const handleDelete = row => {
    dispatch({ type: branchesActions.openDeleteModal, payload: true });
    dispatch({ type: branchesActions.selectedId, payload: row.id });
  };
  const handleShow = row => {
    if (!row.type.includes("eyebrow_transplant")) {
      navigate(`/surgeries/operation-bookings/hair-transplant-details/${encryptId(row.id)}`);
    } else {
      navigate(`/surgeries/operation-bookings/eyebrow-transplant-details/${encryptId(row.id)}`);
    }
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

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
  }, []);

  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"),
        icon: <img src={show} alt="show" />,
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.HairTransplant,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("doctors.add-doctor"),
        icon: <img src={user1} alt="user" />,
        onClick: () => handleAddEmployee(row),
        show:
          !row.doctor_assigned &&
          row.statueName !== "done" &&
          row.statueName !== "cancel" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.HairTransplant,
            type: PERMISSION_ACTION.assign_doctor,
          }),
      },
      {
        label: t("salary.add"),
        icon: <img src={user1} alt="user" />,
        onClick: () => handleAddTechnician(row),
        show:
          row.doctor_assigned &&
          !row.technician_assigned &&
          row.statueName !== "done" &&
          row.statueName !== "cancel" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.HairTransplant,
            type: PERMISSION_ACTION.assign_technician,
          }),
      },
      {
        label: t("hair.pay"), // النص هنا
        icon: <img src={Mony} alt="mony" />, // أيقونة فقط
        onClick: () =>
          navigate("/accounts/vouchers/add", {
            // state: { patient: row?.patientx, total: row?.total },
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
            group: PERMISSION_GROUP.HairTransplant,
            type: PERMISSION_ACTION.update,
          }),
      },
      {
        label: t("surgeries.cancel_surgearies"),
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
        label: t("surgeries.delete_surgearies"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.HairTransplant,
          type: PERMISSION_ACTION.delete,
        }),
      },
      {
        label: t("surgeries.sure_surgearies"),
        icon: <img src={edit} alt="saddd" />,
        onClick: () =>
          navigate("/surgeries/book-operations", {
            state: {
              operationId: row.id,
              patientId: row.patient_id,
              total: row.total,
            },
          }),
        show:
          row.statueName !== "done" &&
          row.statueName !== "delayed" &&
          row.statueName !== "cancel" &&
          row.statueName !== "approve" &&
          !row.is_approve &&
          currentUser?.is_approve,
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
      // const response = await apis.cancel({ id: state.selectedData.id, cancel_reason: data });
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
    [state.selectedData, t, i18n.language]
  );

  const { isLoadingCities, items: bookingStatus } = useGetBookingStatus();

  const onResetFilter = () => {
    reset();
    dispatch({ type: branchesActions.pageIndex, payload: 1 });
  };

  const { isLoadingEmployees, items: techs } = useEmployees({ type: "technician" });
  const { isLoadingEmployees: isLoadingTechnch, items: employee } = useEmployees({
    type: "employee",
  });

  const filterItems = [
    {
      id: 1,
      component: (
        <div className="w-full md:w-[300px]">
          <SelectField
            name="service_id"
            control={control}
            options={items}
            loading={isLoadingServices}
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
        <div className="w-full md:w-[300px]">
          <SelectField
            name="technician_id"
            control={control}
            loading={isLoadingTechnch}
            options={techs}
            placeholder={t("staff.Tunisian")}
          />
        </div>
      ),
    },
    {
      id: 4,
      component: (
        <div className="w-full md:w-[300px]">
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
            options={employee}
            placeholder={t("surgeries.admin-name")}
            loading={isLoadingEmployees}
          />
        </div>
      ),
    },
  ];

  const visibleFilterItems = useMemo(() => {
    return filterItems.filter(item => (item.showOnlyForNonEmployees ? !isEmployee : true));
  }, [isEmployee, filterItems]);
  return (
    <>
      <div>
        <BreadCrumb
          title={t("sidebar.operation-bookings")}
          sticky={true}
          customSection={
            <div className="flex items-center gap-2">
              {/* <Can group={PERMISSION_GROUP.Patient} type={PERMISSION_ACTION.create}>
                <PrimaryButton
                  text={t("add")}
                  otherStyle={"bg-white !text-primary border border-primary"}
                  onClick={() => navigate("/patient/add")}
                />
              </Can> */}
              <Can group={PERMISSION_GROUP.HairTransplant} type={PERMISSION_ACTION.create}>
                <MenuButton
                  items={items}
                  text={
                    <div className="flex items-center gap-1">
                      {" "}
                      +{t("surgeries.add-booking")}
                      <img className="w-[15px]" src={Arrow} alt="arrow" />
                    </div>
                  }
                  onItemClick={item => {
                    if (item.type.includes("eyebrow_transplant")) {
                      navigate("/surgeries/operation-bookings/eyebrow-transplant/add");
                    } else {
                      navigate("/surgeries/operation-bookings/hair-transplant/add");
                    }
                  }}
                />
              </Can>
            </div>
          }
          stickyTop="70px"
          isAdd={false}
          hideBrimaryButton
        />
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
          permissionGroup={PERMISSION_GROUP.HairTransplant}
          hasSearch={true}
          searchValue={state.searchValue}
          onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
          searchPlaceholder={t("common.searchPlaceholder")}
          hasColumnFilters={false}
          isLoading={isLoading}
          useFullHeight={true}
          hasStickyBreadcrumb={true}
          onEdit={handleEdit}
          onShow={handleShow}
          onResetFilters={onResetFilter}
          filterElements={visibleFilterItems}
          extraActions={extraActions}
        />
      </div>

      {state.openDeleteModal && (
        <DeleteModal
          isOpen={state.openDeleteModal}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("surgeries.delete_surgearies")}
          warning={t("delayed.warning")}
          deleteText={t("surgeries.delete_surgearies")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
      {state.isDeleteModalOpen && (
        <CancelModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handleConfirmDCancel}
          title={t("surgeries.cancel_surgearies")}
          warning={message}
          deleteText={t("surgeries.cancel_surgearies")}
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
    </>
  );
}

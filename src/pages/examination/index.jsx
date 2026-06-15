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
  handleBackendErrors,
  hasPermissionFunction,
  truncateText,
  formatDateOrTime,
  getTimeSuffix,
} from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";

import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import PrimaryButton from "@/components/shared/primaryButton";
import NameCell from "@/components/namecellLink";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { ExaminationStatus, PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import useBookingSections from "@/hooks/useBookingSection";
import { showError, showSuccess } from "@/libs/react.toastify";
import { useForm } from "react-hook-form";
import useServices from "@/hooks/useServises";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import SelectField from "@/components/shared/select";
import { Can } from "@/components/shared/can/can";
import useBookingVia from "@/hooks/useBookingia";
import AddDoctorModal from "@/components/shared/modals/addDoctorModal";
import user from "@assets/svgs/common/user1.svg";
import { useExaminationQueries } from "@/apis/examination/query";
import { apis } from "@/apis/examination/api";
import RenderStatus from "@/components/statusButton";
import useEmployees from "@/hooks/useEmployess";
import useExaminationStatus from "@/hooks/useExaminationStatus";
import { isSuperAdmin } from "@/utils/helpers";
import Approve from "@assets/svgs/hair-care/tick-circle.svg";
import CancelModal from "@/components/shared/modals/cancelModal";

export default function Examination() {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();
  const { bookingVia: booking_Via } = useBookingVia();
  const [isChangeStatus, setIsChangeStatus] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { control, watch, reset, setValue } = useForm({
    defaultValues: { status: null, employee_id: null, date: null },
  });

  const { data, isLoading, refetch } = useExaminationQueries.GetAll({
    page: state.pageIndex,
    per_page: state.pageSize,
    search: state.searchValue ? state.searchValue : null,
    employee_id: watch("employee_id"),
    date: watch("date"),
    status: watch("status")?.value,
  });

  const userInfo = localStorage.getItem("authData");
  const parseUserData = JSON.parse(userInfo);
  const isEmployee = parseUserData?.user?.type === "employee";
  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: (state.pageIndex - 1) * state.pageSize + index + 1,
        patient: truncateText({ text: item.patient?.full_name, maxLength: 20 }),
        patient_id: item.patient?.id,
        patientx: item.patient,
        total: item.total,
        employee: item.employee?.full_name,
        type: item?.service?.type,
        date: formatDateOrTime({ input: item.date, type: "date" }),
        time: formatTimeToSHow(item.date?.split(" ")[1], i18n),
        bookedBy: booking_Via?.find(_item => _item?.value.includes(item.booking_via))?.label,
        status: item.status,
        doctor: item.doctor?.id,
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
        accessorKey: "employee",
        header: t("surgeries.admin-name"),
        showOnlyForNonEmployees: true,
      },
      {
        accessorKey: "date",
        header: t("delayed.date"),
      },
      { accessorKey: "bookedBy", header: t("booking.booked-by") },
      {
        accessorKey: "status",
        header: t("booking.status"),
        cell: ({ row }) => RenderStatus(row.original.status),
      },
    ];

    // 🔥 remove admin column if isEmployee === true
    return baseColumns.filter(col => (col.showOnlyForNonEmployees ? !isEmployee : true));
  }, [isEmployee, i18n.language, t]);
  const { isLoadingEmployees2, items: employees2 } = useEmployees({ type: "employee" });

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
  const handelCHangeStatus = async (status, id) => {
    try {
      setIsChangeStatus(true);
      const response = await apis.changeStatus({ id, status });
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

  const handleCloseAddDoctorModal = () => {
    dispatch({ type: branchesActions.openAddDoctorModal, payload: false });
    dispatch({ type: branchesActions.setSelectedBookingId, payload: null });
  };
  const handleEdit = row => {
    navigate(`/examination/${encryptId(row.id)}`);
  };

  const handleDelete = row => {
    dispatch({ type: branchesActions.openDeleteModal, payload: true });
    dispatch({ type: branchesActions.selectedId, payload: row.id });
  };
  const handleShow = row => {
    navigate(`/examination/examination-details/${encryptId(row.id)}`);
  };

  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"),
        icon: <img src={show} alt="show" />,
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Examination,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("doctors.add-doctor"),
        icon: <img src={user} alt="user" />,
        onClick: () => handleAddEmployee(row),
        show:
          !row.doctor &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Examination,
            type: PERMISSION_ACTION.assign_doctor,
          }),
      },

      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show:
          row.status !== ExaminationStatus.booking_assigned.value &&
          row.status !== ExaminationStatus.booking_cancelled.value &&
          row.status !== ExaminationStatus.delayed.value &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Examination,
            type: PERMISSION_ACTION.update,
          }),
      },

      {
        label: t("examination.assign"),
        icon: <img src={Approve} alt="Approve" />,
        onClick: () => handelCHangeStatus("booking_assigned", row.id),
        show:
          row.status !== ExaminationStatus.booking_assigned.value &&
          row.status !== ExaminationStatus.delayed.value &&
          row.status !== ExaminationStatus.booking_cancelled.value &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Examination,
            type: PERMISSION_ACTION.change_status,
          }),
      },
      {
        label: t("common.cancel_preview"),
        icon: <img src={Approve} alt="Approve" />,
        onClick: () => {
          dispatch({ type: branchesActions.isDeleteModalOpen, payload: true });
          dispatch({ type: branchesActions.selectedData, payload: row });
        },
        show:
          row.status !== ExaminationStatus.booking_assigned.value &&
          row.status !== ExaminationStatus.delayed.value &&
          row.status !== ExaminationStatus.booking_cancelled.value &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Examination,
            type: PERMISSION_ACTION.change_status,
          }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Examination,
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

  const handelCloseModal = () => {
    dispatch({ type: branchesActions.isDeleteModalOpen, payload: false });
    dispatch({ type: branchesActions.selectedData, payload: null });
    dispatch({ type: branchesActions.selectedId, payload: 0 });
    dispatch({ type: branchesActions.openDeleteModal, payload: false });
  };

  const { bookingStatus } = useExaminationStatus();

  const onResetFilter = () => {
    reset();
    dispatch({ type: branchesActions.pageIndex, payload: 1 });
  };

  const filterItems = [
    {
      id: 1,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="status"
            control={control}
            options={bookingStatus}
            placeholder={t("booking.status")}
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
    {
      id: 4,
      component: (
        <div className="w-[300px]">
          <ControlledTimeField name="date" placeholder={t("delayed.date")} control={control} />
        </div>
      ),
    },
  ];

  const visibleFilterItems = useMemo(() => {
    return filterItems.filter(item => (item.showOnlyForNonEmployees ? !isEmployee : true));
  }, [isEmployee, filterItems]);

  const handelCloseCancelModal = () => {
    dispatch({ type: branchesActions.isDeleteModalOpen, payload: false });
    dispatch({ type: branchesActions.selectedData, payload: null });
    dispatch({ type: branchesActions.selectedId, payload: 0 });
    dispatch({ type: branchesActions.openDeleteModal, payload: false });
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
        status: ExaminationStatus.booking_cancelled.value,
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

  const message = useMemo(
    () =>
      t("booking.cancelMessage", {
        name: state.selectedData?.patient,
        date: state.selectedData?.date,
        time:
          new Date(state.selectedData?.time).toLocaleTimeString() + getTimeSuffix(i18n.language),
      }),
    [state.selectedData]
  );

  return (
    <div>
      <BreadCrumb
        title={t("sidebar.examination")}
        link={"/examination"}
        onClick={() => navigate("/examination/add")}
        buttonText={t("examination.add")}
        hideBrimaryButton={
          !hasPermissionFunction({
            group: PERMISSION_GROUP.Examination,
            type: PERMISSION_ACTION.create,
          })
        }
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
        onEdit={handleEdit}
        onShow={handleShow}
        permissionGroup={PERMISSION_GROUP.Examination}
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
          title={t("examination.delete")}
          warning={t("delayed.warning")}
          deleteText={t("examination.delete")}
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

      {state.isDeleteModalOpen && (
        <CancelModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseCancelModal}
          onDelete={handleConfirmDCancel}
          title={t("examination.cancel")}
          warning={message}
          deleteText={t("examination.cancel")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </div>
  );
}

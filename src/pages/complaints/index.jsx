/* eslint-disable comma-dangle */
/* eslint-disable curly */
import React, { useMemo, useReducer } from "react";
import { complaintsActions, initialValues, complaintsReducer } from "@/reducers/complaints";
import { Table } from "@/components/table";
import BreadCrumb from "@/components/breadcrumb";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { encryptId, getTimeSuffix, hasPermissionFunction } from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import DropdownMenu from "@/components/shared/dropdownMenu";
import CancelModal from "@/components/shared/modals/cancelModal";
import RenderComplainStatus from "@/components/statusComplainButton";
import DateUnderTime from "@/components/dateUnderTime";
import NameCell from "@/components/namecellLink";
import { useComplaintsQueries } from "@/apis/complaints/query";
import { truncateText } from "@/utils/helpers";
import { formatDateOrTime } from "@/utils/helpers";
import { apis } from "@/apis/complaints/api";
import { handleBackendErrors } from "@/utils/helpers";
import { showSuccess, showError } from "@/libs/react.toastify";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { useForm } from "react-hook-form";
import SelectField from "@/components/shared/select";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import { usePatientsQueries } from "@/apis/patients/query";
import DeleteModal from "@/components/shared/modals/deleteModal";

export default function Complaints() {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(complaintsReducer, initialValues);
  const navigate = useNavigate();
  const { control, watch, reset } = useForm({
    defaultValues: { patient_id: null, date_from: "", date_to: "", status: null, guard_type: "" },
  });
  const { data, isLoading, refetch } = useComplaintsQueries.GetAll({
    page: state.pageIndex,
    per_page: state.pageSize,
    patient_id: watch("patient_id"),
    date_from: watch("date_from"),
    date_to: watch("date_to"),
    search: state.searchValue,
    status: watch("status"),
    guard_type: watch("guard_type"),
  });
  const { data: patientData, isLoading: isLoadingPatient } = usePatientsQueries.GetAll({
    page: null,
    per_page: null,
    city_id: null,
    target: null,
    search: null,
  });
  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,

        patient: item.patient,
        patient_id: item.patient?.id,

        name: truncateText({ text: item.patient?.full_name, maxLength: 20 }),
        service: truncateText({ text: item.service?.name, maxLength: 20 }),
        date: item.date,
        complainDate: formatDateOrTime({ input: item.created_at, type: "date" }),
        reserve: item.guard_type,
        status: item.status,
        originalCreatedAt: item.created_at,
        description: truncateText({ text: item.description || "-", maxLength: 20 }),
      })) || [],
    [data?.data]
  );
  // ✅ Handlers
  const handlePageSizeChange = newPageSize => {
    dispatch({ type: complaintsActions.pageSize, payload: newPageSize });
  };

  const handlePreviousPage = () => {
    dispatch({ type: complaintsActions.pageIndex, payload: state.pageIndex - 1 });
  };

  const handleNextPage = () => {
    dispatch({ type: complaintsActions.pageIndex, payload: state.pageIndex + 1 });
  };

  const handleGotoPage = page => {
    dispatch({ type: complaintsActions.pageIndex, payload: page });
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
      {
        accessorKey: "service",
        header: t("complaints.service"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "date",
        header: t("complaints.date"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          const dateValue = row.original.date;
          if (!dateValue) return null;

          return <DateUnderTime date={formatDateOrTime({ input: dateValue, type: "date" })} />;
        },
      },
      {
        accessorKey: "complainDate",
        header: t("complaints.complaint-date"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          const dateValue = row.original.complainDate;
          if (!dateValue) return null;

          return <DateUnderTime date={formatDateOrTime({ input: dateValue, type: "date" })} />;
        },
      },
      {
        accessorKey: "reserve",
        header: t("complaints.complaint-by"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          const guardType = row.original.reserve;
          return guardType === "dashboard" ? t("common.dashboard") : guardType;
        },
      },

      {
        accessorKey: "description",
        header: t("complaints.details"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "status",
        header: t("complaints.statue"),
        enableColumnFilter: true,
        cell: ({ row }) => <RenderComplainStatus status={row.original.status} />,
      },
    ],
    [t]
  );
  const patientOptions = useMemo(
    () =>
      patientData?.data?.map(role => ({
        label: role.full_name,
        value: role.id,
      })) || [],
    [patientData?.data]
  );

  const handleEdit = row => navigate(`/complaints/${row.id}`);
  // const handleDelete = row => {
  //   dispatch({ type: complaintsActions.openDeleteModal, payload: row });
  // };
  const handleShow = row => navigate(`/complaints/${row.id}?show=true`);
  const handleDelete = row => {
    dispatch({ type: complaintsActions.isDeleteModalOpen, payload: true });
    dispatch({ type: complaintsActions.selectedId, payload: row.id });
  };

  const handleCancel = row => {
    dispatch({ type: complaintsActions.isCancelModalOpen, payload: true });
    dispatch({ type: complaintsActions.selectedData, payload: row });
  };

  const handelDelete = async () => {
    try {
      dispatch({ type: complaintsActions.isSending, payload: true });
      const response = await apis.deleteApi({ id: state.selectedId });
      dispatch({ type: complaintsActions.closeDeleteModal });
      refetch();
      showSuccess(response?.data.message);
      dispatch({ type: complaintsActions.isSending, payload: false });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: complaintsActions.isSending, payload: false });
    }
  };

  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"),
        icon: <img src={show} alt="show" />,
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Complaint,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show:
          row.status !== "done" &&
          row.status !== "canceled" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Complaint,
            type: PERMISSION_ACTION.update,
          }),
      },
      {
        label: t("complaints.cancel"),
        icon: <img src={deleteIcon} alt="cancel" />,
        onClick: () => handleCancel(row),
        show:
          row.status === "waiting" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Complaint,
            type: PERMISSION_ACTION.update,
          }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Complaint,
          type: PERMISSION_ACTION.delete,
        }),
      },
    ];
    return (
      <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />
    );
  };

  const handleConfirmCancel = async data => {
    if (!data) {
      showError(t("validation.add-note"));
      return;
    }
    try {
      dispatch({ type: complaintsActions.isSending, payload: true });
      const response = await apis.cancel({ id: state.selectedData.id, cancel_reason: data });
      showSuccess(response?.data?.message);
      dispatch({ type: complaintsActions.isSending, payload: false });
      dispatch({ type: complaintsActions.closeCancelModal });
      refetch();
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: complaintsActions.closeCancelModal });
      dispatch({ type: complaintsActions.isSending, payload: false });
    }
  };

  const handleCloseDeleteModal = () => {
    dispatch({ type: complaintsActions.closeDeleteModal });
    dispatch({ type: complaintsActions.selectedId, payload: 0 });
  };

  const handleCloseCancelModal = () => {
    dispatch({ type: complaintsActions.closeCancelModal });
    dispatch({ type: complaintsActions.openDeleteModal, payload: false });
  };

  const cancelMessage = useMemo(
    () =>
      t("complaints.cancelMessage", {
        name: state.selectedData?.patient?.full_name,
        date: formatDateOrTime({
          input: state.selectedData?.originalCreatedAt || state.selectedData?.complainDate,
          type: "date",
        }),
        time:
          formatDateOrTime({
            input: state.selectedData?.originalCreatedAt || state.selectedData?.complainDate,
            type: "time",
          }) +
          getTimeSuffix(
            state.selectedData?.originalCreatedAt || state.selectedData?.complainDate,
            i18n.language
          ),
      }),
    [state.selectedData]
  );
  const onResetFilter = () => {
    reset();
    dispatch({ type: complaintsActions.pageIndex, payload: 1 });
  };
  const ComplaintsStatus = [
    { value: "waiting ", label: t("booking.wait") },
    { value: "done", label: t("booking.served") },
    { value: "canceled", label: t("booking.cancel") },
  ];
  const guardStatus = [
    { value: "mobile ", label: t("mobile") },
    { value: "dashboard", label: t("common.dashboard") },
    { value: "clinic", label: t("clinic") },
  ];

  const filterItems = [
    {
      id: 1,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="patient_id"
            control={control}
            options={patientOptions}
            placeholder={t("complaints.patient-name")}
            isLoading={isLoadingPatient}
          />
        </div>
      ),
    },
    {
      id: 2,
      component: (
        <div className="w-[300px]">
          <ControlledTimeField
            name="date_from"
            control={control}
            placeholder={t("holiday.startDate")}
          />
        </div>
      ),
    },
    {
      id: 3,
      component: (
        <div className="w-[300px]">
          <ControlledTimeField
            name="date_to"
            control={control}
            placeholder={t("holiday.endDate")}
          />
        </div>
      ),
    },
    {
      id: 4,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="guard_type"
            control={control}
            options={guardStatus}
            placeholder={t("complaints.complaint-by")}
          />
        </div>
      ),
    },
    {
      id: 5,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="status"
            control={control}
            options={ComplaintsStatus}
            placeholder={t("complaints.statue")}
          />
        </div>
      ),
    },
  ];
  return (
    <>
      <div>
        <BreadCrumb
          title={t("sidebar.complaints")}
          link={"/complained"}
          onClick={() => navigate("/complaints/add")}
          sticky={true}
          stickyTop="70px"
          buttonText={t("complaints.add")}
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.Complaint,
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
          permissionGroup={PERMISSION_GROUP.Complaint}
          hasSearch={true}
          searchValue={state.searchValue}
          onSearchChange={val => dispatch({ type: complaintsActions.searchValue, payload: val })}
          searchPlaceholder={t("common.searchPlaceholder")}
          hasColumnFilters={false}
          isLoading={isLoading}
          useFullHeight={true}
          hasStickyBreadcrumb={true}
          onEdit={handleEdit}
          onShow={handleShow}
          extraActions={extraActions}
          onResetFilters={onResetFilter}
          filterElements={filterItems}
        />
      </div>
      {state.isCancelModalOpen && (
        <CancelModal
          isOpen={state.isCancelModalOpen}
          onClose={handleCloseCancelModal}
          onDelete={handleConfirmCancel}
          title={t("complaints.cancel")}
          warning={cancelMessage}
          deleteText={t("complaints.cancel")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}

      {/* Delete Modal */}
      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onDelete={handelDelete}
          title={t("complaints.delete")}
          warning={t("item.warning")}
          deleteText={t("complaints.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
}

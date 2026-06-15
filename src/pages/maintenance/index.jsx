/* eslint-disable comma-dangle */
/* eslint-disable react-hooks/exhaustive-deps */
import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import { maintenanceActions, initialValues, maintenanceReducer } from "@/reducers/maintenance";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
// import PermissionDebug from "@/components/debug/PermissionDebug";
import { encryptId, Permissions } from "@/utils/helpers";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { useMaintenanceQueries } from "@/apis/maintenance/query";
import { handleBackendErrors } from "@/utils/helpers";
import { apis } from "@/apis/maintenance/api";
import { showSuccess } from "@/libs/react.toastify";
import { truncateText } from "@/utils/helpers";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import RenderMainteneceStatus from "@/components/statusMaintenanceButton";
import { hasPermissionFunction } from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import DropdownMenu from "@/components/shared/dropdownMenu";
import Approve from "@assets/svgs/hair-care/tick-circle.svg";
import printer from "@assets/svgs/common/printer.svg";

export default function Maintenance() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(maintenanceReducer, initialValues);
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useMaintenanceQueries.GetAll({
    page: state.pageIndex,
    per_page: state.pageSize,
    search: state.searchValue,
  });
  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,

        type: item.type,

        piece: item?.item || "-",
        problem: item.description,
        cost: item.cost + " " + t("code"),
        phone: item.no,
        status: item.status,
      })) || [],
    [data?.data]
  );

  const columns = useMemo(
    () => [
      { accessorKey: "id_show", header: "#" },
      { accessorKey: "type", header: t("maintenance.type") },
      { accessorKey: "piece", header: t("maintenance.widget") },
      { accessorKey: "problem", header: t("maintenance.problem") },
      { accessorKey: "cost", header: t("maintenance.cost") },
      { accessorKey: "phone", header: t("maintenance.contact") },
      {
        accessorKey: "status",
        header: t("complaints.statue"),

        cell: ({ row }) => {
          console.log("Status data:", row.original.status);
          return <RenderMainteneceStatus status={row.original.status} />;
        },
      },
    ],
    []
  );

  // ✅ Handlers
  const handlePageSizeChange = newPageSize => {
    dispatch({ type: maintenanceActions.pageSize, payload: newPageSize });
  };

  const handlePreviousPage = () => {
    dispatch({ type: maintenanceActions.pageIndex, payload: state.pageIndex - 1 });
  };

  const handleNextPage = () => {
    dispatch({ type: maintenanceActions.pageIndex, payload: state.pageIndex + 1 });
  };

  const handleGotoPage = page => {
    dispatch({ type: maintenanceActions.pageIndex, payload: page });
  };
  const handleEdit = row => navigate(`/maintenance/${row.id}`);
  const handleDelete = row => {
    dispatch({ type: maintenanceActions.isDeleteModalOpen, payload: true });
    dispatch({ type: maintenanceActions.selectedId, payload: row.id });
  };
  const handlePrint = row => navigate(`/maintenance/maintenance-invoice/${row.id}`);

  const handelDelete = async () => {
    try {
      dispatch({ type: maintenanceActions.isSending, payload: true });
      const response = await apis.deleteApi({ id: state.selectedId });
      dispatch({ type: maintenanceActions.closeDeleteModal });
      refetch();
      showSuccess(response?.data?.message);
      dispatch({ type: maintenanceActions.isSending, payload: false });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: maintenanceActions.isSending, payload: false });
    }
  };

  const handelCloseModal = () => {
    dispatch({ type: maintenanceActions.selectedId, payload: 0 });
    dispatch({ type: maintenanceActions.closeDeleteModal });
    dispatch({ type: maintenanceActions.isSending, payload: false });
  };
  const handleShow = row => navigate(`/maintenance/${row.id}?show=true`);
  const handelProgress = async id => {
    try {
      dispatch({ type: maintenanceActions.isSending, payload: true });
      const response = await apis.changeStatus({ id, status: "in_progress" });
      refetch();
      showSuccess(response?.data?.message);
      dispatch({ type: maintenanceActions.isSending, payload: false });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: maintenanceActions.isSending, payload: false });
    }
  };

  const handelDone = async id => {
    try {
      dispatch({ type: maintenanceActions.isSending, payload: true });
      const response = await apis.changeStatus({ id, status: "done" });
      refetch();
      showSuccess(response?.data?.message);
      dispatch({ type: maintenanceActions.isSending, payload: false });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: maintenanceActions.isSending, payload: false });
    }
  };
  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"), // النص هنا
        icon: <img src={show} alt="show" />, // أيقونة فقط
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Maintenance,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show:
          row.status !== "done" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Maintenance,
            type: PERMISSION_ACTION.update,
          }),
      },
      {
        label: t("booking.progress"),
        icon: <img src={Approve} alt="approve" />,
        onClick: () => handelProgress(row.id),
        show:
          row.status === "waiting" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Maintenance,
            type: PERMISSION_ACTION.change_status_to_in_progress,
          }),
      },
      {
        label: t("permission.print"),
        icon: <img src={printer} alt="printer" />,
        onClick: () => handlePrint(row),
        show:
          row.status !== "waiting" &&
          row.status !== "in_progress" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Maintenance,
            type: PERMISSION_ACTION.index,
          }),
      },
      {
        label: t("booking.served"),
        icon: <img src={Approve} alt="approve" />,
        onClick: () => handelDone(row.id),
        show:
          row.status === "in_progress" &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Maintenance,
            type: PERMISSION_ACTION.change_status_to_done,
          }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Maintenance,
          type: PERMISSION_ACTION.delete,
        }),
      },
    ];
    return (
      <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />
    );
  };
  return (
    <>
      <div>
        <BreadCrumb
          title={t("sidebar.maintenance")}
          link={"/maintenance"}
          onClick={() => navigate("/maintenance/add")}
          buttonText={t("common.add")}
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.Maintenance,
              type: PERMISSION_ACTION.create,
            })
          }
        />

        <Table
          data={rowData}
          columns={columns}
          pageSize={state.pageSize}
          pageIndex={state.pageIndex}
          //  totalPages={totalPages}
          onPageSizeChange={handlePageSizeChange}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onGotoPage={handleGotoPage}
          onEdit={handleEdit}
          permissionGroup={PERMISSION_GROUP.Maintenance}
          hasSearch={true}
          searchValue={state.searchValue}
          onDelete={handleDelete}
          onSearchChange={val => dispatch({ type: maintenanceActions.searchValue, payload: val })}
          searchPlaceholder={t("common.searchPlaceholder")}
          hasColumnFilters={false}
          isLoading={isLoading}
          useFullHeight={true}
          hasStickyBreadcrumb={true}
          extraActions={extraActions}
          hideFilter
        />
      </div>
      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("maintenance.delete")}
          warning={t("package.warning")}
          deleteText={t("maintenance.delete1")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
}

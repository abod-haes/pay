import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import DropdownMenu from "@/components/shared/dropdownMenu";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { handleBackendErrors, hasPermissionFunction, truncateText } from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";

import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import PrimaryButton from "@/components/shared/primaryButton";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/booking-status/api";
import { useBookingStatusQueries } from "@/apis/booking-status/query";
export default function BookingStatus() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useBookingStatusQueries.GetAll({
    page: state.pageIndex,
    per_page: state.pageSize,

    search: state.searchValue ? state.searchValue : null,
  });

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        name: truncateText({ text: item.name, maxLength: 20 }),
        color: item.color,
        is_default: item.is_default,
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

      { accessorKey: "name", header: t("status.name") },

      {
        accessorKey: "color",
        header: t("status.color"),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: row.original.color }}
              />
              <span>{row.original.color}</span>
            </div>
          );
        },
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

  const handleEdit = row => navigate(`/booking-status/${row.id}`);

  const handleDelete = row => {
    dispatch({ type: branchesActions.openDeleteModal, payload: true });
    dispatch({ type: branchesActions.selectedId, payload: row.id });
  };
  const handleShow = row => navigate(`/booking-status/${row.id}?show=true`);

  // إنشاء extraActions باستخدام DropdownMenu
  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"),
        icon: <img src={show} alt="show" />, // أيقونة فقط
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.BOOKING_STATUS,
          type: PERMISSION_ACTION.index,
        }),
      },

      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.BOOKING_STATUS,
          type: PERMISSION_ACTION.update,
        }),
      },

      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show:
          row.is_default === false &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.BOOKING_STATUS,
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

  return (
    <div>
      {/* <Can group={PERMISSION_GROUP.Booking} type={PERMISSION_ACTION.create}> */}
      <BreadCrumb
        title={t("sidebar.booking-status")}
        link={"/booking-status"}
        onClick={() => navigate("/booking-status/add")}
        buttonText={t("status.add")}
        hideBrimaryButton={
          !hasPermissionFunction({
            group: PERMISSION_GROUP.BOOKING_STATUS,
            type: PERMISSION_ACTION.create,
          })
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
        permissionGroup={PERMISSION_GROUP.BOOKING_STATUS}
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
        hideFilter={true}
      />

      {state.openDeleteModal && (
        <DeleteModal
          isOpen={state.openDeleteModal}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("status.delete")}
          warning={t("delayed.warning")}
          deleteText={t("status.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </div>
  );
}

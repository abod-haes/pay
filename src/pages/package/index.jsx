import React, { useMemo, useReducer } from "react";
import { Table } from "@/components/table";
import BreadCrumb from "@/components/breadcrumb";
import { useTranslation } from "react-i18next";
import { warehouseReducer, initialValues, warehouseActions } from "@/reducers/warehouse";
import { useNavigate } from "react-router-dom";
import { encryptId, hasPermissionFunction, Permissions } from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import DropdownMenu from "@/components/shared/dropdownMenu";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { useUnitQueries } from "@/apis/unit/query";
import { truncateText } from "@/utils/helpers";
import { apis } from "@/apis/unit/api";
import { handleBackendErrors } from "@/utils/helpers";
import { showSuccess } from "@/libs/react.toastify";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { Can } from "@/components/shared/can/can";
export default function Package() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(warehouseReducer, initialValues);
  const { data, isLoading, refetch } = useUnitQueries.GetAll({
    per_page: state.pageSize,
    page: state.pageIndex,
    search: state.searchValue,
  });
  const navigate = useNavigate();
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,

        name: truncateText({ text: item.name, maxLength: 5 }),
      })) || [],
    // eslint-disable-next-line comma-dangle
    [data?.data]
  );
  const handlePageSizeChange = newPageSize => {
    dispatch({ type: warehouseActions.pageSize, payload: newPageSize });
  };

  const handlePreviousPage = () => {
    dispatch({ type: warehouseActions.pageIndex, payload: Math.max(0, state.pageIndex - 1) });
  };

  const handleNextPage = () => {
    dispatch({ type: warehouseActions.pageIndex, payload: state.pageIndex + 1 });
  };

  const handleGotoPage = page => {
    dispatch({ type: warehouseActions.pageIndex, payload: page });
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
        header: t("package.name"),
        enableColumnFilter: true,
      },
    ],
    []
  );
  const handleEdit = row => navigate(`/warehouse/package/${row.id}`);
  // const handleShow = row => navigate(`/warehouse/package/${encryptId(row.id)}/show`);
  const handleDelete = row => {
    dispatch({ type: warehouseActions.isDeleteModalOpen, payload: true });
    dispatch({ type: warehouseActions.selectedId, payload: row.id });
  };

  const handelDelete = async () => {
    try {
      dispatch({ type: warehouseActions.isSending, payload: true });
      const response = await apis.deleteApi({ id: state.selectedId });
      dispatch({ type: warehouseActions.closeDeleteModal });
      refetch();
      showSuccess(response?.data?.message);
      dispatch({ type: warehouseActions.isSending, payload: true });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: warehouseActions.isSending, payload: true });
    }
  };

  const handelCloseModal = () => {
    dispatch({ type: warehouseActions.selectedId, payload: 0 });
    dispatch({ type: warehouseActions.closeDeleteModal });
    dispatch({ type: warehouseActions.openDeleteModal, payload: false });
  };

  const extraActions = row => {
    const menuItems = [
      // {
      //   label: t("common.display"), // النص هنا
      //   icon: <img src={show} alt="show" />, // أيقونة فقط
      //   onClick: () => handleShow(row),
      // },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Unit,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Unit,
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
          title={t("sidebar.package")}
          link={"/package"}
          buttonText={t("package.add")}
          onClick={() => navigate("/warehouse/package/add")}
          sticky={true}
          stickyTop="70px"
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.Unit,
              type: PERMISSION_ACTION.create,
            })
          }
        />
        <Table
          data={rowData}
          columns={columns}
          pageSize={state.pageSize}
          pageIndex={state.pageIndex}
          totalPages={data?.meta?.last_page}
          onPageSizeChange={handlePageSizeChange}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onGotoPage={handleGotoPage}
          onEdit={handleEdit}
          // onShow={handleShow}
          onDelete={handleDelete}
          permissionGroup={PERMISSION_GROUP.Unit}
          hasSearch={true}
          searchValue={state.searchValue}
          onSearchChange={val => dispatch({ type: warehouseActions.searchValue, payload: val })}
          searchPlaceholder={t("common.searchPlaceholder")}
          hasColumnFilters={false}
          isLoading={isLoading}
          useFullHeight={true}
          hasStickyBreadcrumb={true}
          extraActions={extraActions}
          hideFilter={true}
        />
      </div>
      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("package.delete")}
          warning={t("package.warning")}
          deleteText={t("package.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
}

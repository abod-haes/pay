/* eslint-disable comma-dangle */
/* eslint-disable react-hooks/exhaustive-deps */
import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import DropdownMenu from "@/components/shared/dropdownMenu";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  encryptId,
  formatDateOrTime,
  Permissions,
  truncateText,
  hasPermissionFunction,
} from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { showSuccess } from "@/libs/react.toastify";
import { handleBackendErrors } from "@/utils/helpers";
import { apis } from "@/apis/cashier/api";
import { useCashierQueries } from "@/apis/cashier/query";
import { formatSalary } from "@/utils/helpers";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
export default function Cashier() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useCashierQueries.GetAll({
    per_page: state.pageSize,
    page: state.pageIndex,
    search: state.searchValue,
  });
  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,

        name: truncateText({ text: item.name, maxLength: 5 }),

        // initial_balance: formatSalary(item.initial_balance) + " " + t("code"),
        total: formatSalary(item.total) + " " + t("code"),
        is_default: item.is_default,
      })) || [],
    // eslint-disable-next-line comma-dangle
    [data?.data]
  );
  const columns = useMemo(
    () => [
      { accessorKey: "name", header: t("cashier.name") },
      // { accessorKey: "initial_balance", header: t("cashier.initial") },
      { accessorKey: "total", header: t("cashier.total") },
    ],
    [t]
  );
  const handlePageSizeChange = newPageSize => {
    dispatch({ type: branchesActions.pageSize, payload: newPageSize });
  };

  const handlePreviousPage = () => {
    dispatch({ type: branchesActions.pageIndex, payload: state.pageIndex - 1 });
  };

  const handleNextPage = () => {
    dispatch({ type: branchesActions.pageIndex, payload: state.pageIndex + 1 });
  };

  const handleGotoPage = page => {
    dispatch({ type: branchesActions.pageIndex, payload: page });
  };
  const handleEdit = row => navigate(`/accounts/cashier/${row.id}`);
  const handleDelete = row => {
    dispatch({ type: branchesActions.isDeleteModalOpen, payload: true });
    dispatch({ type: branchesActions.selectedId, payload: row.id });
  };

  const handelDelete = async () => {
    try {
      dispatch({ type: branchesActions.isSending, payload: true });
      const response = await apis.deleteApi({ id: state.selectedId });
      dispatch({ type: branchesActions.closeDeleteModal });
      refetch();
      showSuccess(response?.data?.message);
      dispatch({ type: branchesActions.isSending, payload: false });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: branchesActions.isSending, payload: false });
    }
  };

  const handelCloseModal = () => {
    dispatch({ type: branchesActions.selectedId, payload: 0 });
    dispatch({ type: branchesActions.closeDeleteModal });
    dispatch({ type: branchesActions.isSending, payload: false });
  };

  const handleShow = row => navigate(`/accounts/cashier/${row.id}/show`);
  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"), // النص هنا
        icon: <img src={show} alt="show" />, // أيقونة فقط
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Cashier,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Cashier,
          type: PERMISSION_ACTION.update,
        }),
      },

      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show:
          !row.is_default &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Cashier,
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
          title={t("sidebar.cashier")}
          link={"/accounts/cashier"}
          onClick={() => navigate("/accounts/cashier/add")}
          buttonText={t("cashier.add")}
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.Cashier,
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
          permissionGroup={Permissions.EMPLOYEES}
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
      </div>
      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("cashier.delete")}
          warning={t("delayed.warning")}
          deleteText={t("cashier.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
}

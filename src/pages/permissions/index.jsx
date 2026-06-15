import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { encryptId, handleBackendErrors, Permissions, truncateText } from "@/utils/helpers";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { useRolesQueries } from "@/apis/roles/query";
import { showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/roles/api";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { Can } from "@/components/shared/can/can";
import edit2 from "@/assets/svgs/table/edit2.svg";
import trash1 from "@/assets/svgs/table/trash.svg";
import eye from "@/assets/svgs/table/e-eye.svg";
import { hasPermissionFunction } from "@/utils/helpers";

const PermissionsPage = () => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useRolesQueries.GetAll({
    page: state.pageIndex,
    per_page: state.pageSize,
    search: state.searchValue ? state.searchValue : null,
  });

  const columns = useMemo(
    () => [
      { accessorKey: "id_show", header: "#" },
      { accessorKey: "name", header: t("permissions.permission-name") },
      { accessorKey: "count", header: t("permissions.employee-count") },
    ],
    []
  );

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        name: truncateText({ text: item.name, maxLength: 20 }),
        count: item.users_count,
        is_default: item.is_default,
      })) || [],
    [data?.data]
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

  const handleEdit = row => navigate(`/permissions/${encryptId(row.id)}`);

  const handleDelete = row => {
    dispatch({ type: branchesActions.openDeleteModal, payload: true });
    dispatch({ type: branchesActions.selectedId, payload: row.id });
  };
  const handleShow = row => navigate(`/permissions/${encryptId(row.id)}?show=true`);

  const handelCloseModal = () => {
    dispatch({ type: branchesActions.isDeleteModalOpen, payload: false });
    dispatch({ type: branchesActions.selectedData, payload: null });
    dispatch({ type: branchesActions.selectedId, payload: 0 });
    dispatch({ type: branchesActions.openDeleteModal, payload: false });
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

  const extraActions = row => {
    return (
      <div className="flex items-center gap-2 ">
        <Can group={PERMISSION_GROUP.Role} type={PERMISSION_ACTION.index}>
          <button
            onClick={e => {
              handleShow(row);
            }}
          >
            <img src={eye} alt="Show" className="w-5 h-5 cursor-pointer" />
          </button>
        </Can>
        {!row.is_default && (
          <Can group={PERMISSION_GROUP.Role} type={PERMISSION_ACTION.update}>
            <button
              onClick={e => {
                handleEdit(row);
              }}
            >
              <img src={edit2} alt="Edit" className="w-5 h-5 cursor-pointer" />
            </button>
          </Can>
        )}
        {!row.is_default && (
          <Can group={PERMISSION_GROUP.Role} type={PERMISSION_ACTION.delete}>
            <button
              type="button"
              onClick={e => {
                handleDelete(row);
              }}
            >
              <img src={trash1} alt="Delete" className="w-5 h-5 cursor-pointer" />
            </button>
          </Can>
        )}
      </div>
    );
  };

  return (
    <>
      <div>
        <BreadCrumb
          title={t("sidebar.permissions")}
          link={"/permissions"}
          onClick={() => navigate("/permissions/add")}
          buttonText={t("permissions.add-permission")}
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.Role,
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
          permissionGroup={PERMISSION_GROUP.Role}
          hasSearch={true}
          searchValue={state.searchValue}
          onDelete={handleDelete}
          onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
          searchPlaceholder={t("common.searchPlaceholder")}
          hasColumnFilters={false}
          isLoading={isLoading}
          useFullHeight={true}
          hideFilter
          hasStickyBreadcrumb={true}
          extraActions={extraActions}
        />
      </div>
      {state.openDeleteModal && (
        <DeleteModal
          isOpen={state.openDeleteModal}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("permissions.delete")}
          warning={t("delayed.warning")}
          deleteText={t("permissions.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
};

export default PermissionsPage;

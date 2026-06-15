/* eslint-disable comma-dangle */
import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import DropdownMenu from "@/components/shared/dropdownMenu";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  encryptId,
  Permissions,
  handleBackendErrors,
  hasPermissionFunction,
} from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import { truncateText } from "@/utils/helpers";
import Tooltip from "@/components/shared/tooltip/tooltip";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { DepartmentsQueries } from "@/apis/department/query";
import { apis } from "@/apis/department/api";
import { showSuccess } from "@/libs/react.toastify";
import Modal from "@/components/shared/modals/modal";
import { useUsersQueries } from "@/apis/users/query";
import SecondaryButton from "@/components/shared/secondaryButton";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";

export default function Departments() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();
  const { data, isLoading, refetch, isRefetching } = DepartmentsQueries.GetAll({
    per_page: state.pageSize,
    page: state.pageIndex,
    search: state.searchValue,
  });
  const { userData } = useUsersQueries.GetAll({ per_page: null });

  const columns = useMemo(
    () => [
      {
        accessorKey: "id_show",
        header: "#",
        enableColumnFilter: true,
      },
      {
        accessorKey: "name",
        header: t("department.name"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "users_count",
        header: t("department.count"),
        cell: ({ row }) => (
          <button
            onClick={() => {
              dispatch({ type: branchesActions.setCurrentDepartment, payload: row.original });
              dispatch({ type: branchesActions.openUsersModal, payload: true });
            }}
            className=" cursor-pointer "
          >
            {row.original.users_count}
          </button>
        ),
      },
      {
        accessorKey: "notes",
        header: t("department.note"),
        cell: ({ row }) => {
          const note = row.original.notes || "";
          return (
            <Tooltip description={note}>
              <span className="cursor-pointer text-sm text-gray-700">
                {truncateText({ text: note, maxLength: 20 })}
              </span>
            </Tooltip>
          );
        },
      },
    ],
    [t]
  );

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,

        name: truncateText({ text: item.name, maxLength: 20 }),
        users_count: item?.users_count,
        notes: truncateText({ text: item?.notes, maxLength: 20 }) || "-",
      })) || [],
    [data?.data]
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

  const handleEdit = row => navigate(`/staff/department/${encryptId(row.id)}`);
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
    dispatch({ type: branchesActions.openDeleteModal, payload: false });
  };
  const handleShow = row => navigate(`/staff/department/${encryptId(row.id)}?show=true`);
  //   const handleCloseUsersModal = () => {
  //     dispatch({ type: branchesActions.closeUsersModal });
  //     dispatch({ type: branchesActions.setCurrentDepartment, payload: null });
  //   };
  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"),
        icon: <img src={show} alt="show" />,
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Department,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Department,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Department,
          type: PERMISSION_ACTION.delete,
        }),
      },
    ];
    return (
      <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />
    );
  };

  return (
    <div>
      <BreadCrumb
        title={t("sidebar.department")}
        link={"/staff/department"}
        buttonText={t("department.add")}
        onClick={() => navigate("/staff/department/add")}
        hideBrimaryButton={
          !hasPermissionFunction({
            group: PERMISSION_GROUP.Department,
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
        permissionGroup={PERMISSION_GROUP.Department}
        hasSearch={true}
        searchValue={state.searchValue}
        onDelete={handleDelete}
        onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
        searchPlaceholder={t("common.searchPlaceholder")}
        hasColumnFilters={false}
        isLoading={isLoading || isRefetching}
        useFullHeight={true}
        hasStickyBreadcrumb={true}
        extraActions={extraActions}
        hideFilter
      />

      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("department.delete")}
          warning={t("delayed.warning")}
          deleteText={t("department.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
      {/* {state.isUsersModalOpen && state.currentDepartment && (
        <Modal open={state.isUsersModalOpen}>
          <div className="flex flex-col w-full  md:min-w-sm  rounded-2xl shadow-lg bg-white relative h-full  py-8 ">
            {userData?.data?.map(user => (
              <p key={user.id} className="text-accent text-[0.75rem] font-main">
                {user.full_name}
              </p>
            ))}
            <SecondaryButton text={t("common.cancel2")} onClick={handleCloseUsersModal} />
          </div>
        </Modal>
      )} */}
    </div>
  );
}

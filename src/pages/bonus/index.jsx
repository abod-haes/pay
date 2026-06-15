/* eslint-disable react-hooks/exhaustive-deps */
import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Permissions } from "@/utils/helpers";
import { useRewardsQueries } from "@/apis/rewards/query";
import { truncateText, formatDateOrTime } from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import DropdownMenu from "@/components/shared/dropdownMenu";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { apis } from "@/apis/rewards/api";
import { handleBackendErrors, hasPermissionFunction } from "@/utils/helpers";
import { showSuccess } from "@/libs/react.toastify";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
export default function Bonus() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useRewardsQueries.GetAll({
    per_page: state.pageSize,
    page: state.pageIndex,
    search: state.searchValue,
  });
  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,

        employee: truncateText({ text: item.user?.full_name || "-", maxLength: 5 }),
        department: truncateText({
          text: item.department?.full_name || "-",
          maxLength: 5,
        }),
        bonus: item.value + " " + t("code"),
        jobTitle: truncateText({ text: item.job_title?.full_name || "-", maxLength: 5 }),

        hireDate: formatDateOrTime({ input: item.date, type: "date" }),
        reason: truncateText({ text: item.notes || "", maxLength: 5 }),
      })) || [],
    // eslint-disable-next-line comma-dangle
    [data?.data]
  );
  // ✅ الأعمدة
  const columns = useMemo(
    () => [
      { accessorKey: "id_show", header: "#" },
      { accessorKey: "employee", header: t("employee.name") },
      { accessorKey: "department", header: t("staff.department") },
      { accessorKey: "bonus", header: t("bonus.bonus") },
      { accessorKey: "jobTitle", header: t("staff.job-title") },
      { accessorKey: "hireDate", header: t("bonus.date") },
      { accessorKey: "reason", header: t("common.reason") },
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
  const handleEdit = row => navigate(`/staff/bonus/${row.id}`);
  const handleShow = row => navigate(`/staff/bonus/${row.id}?show=true`);
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
      showSuccess(response?.data.message);
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

  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"), // النص هنا
        icon: <img src={show} alt="show" />, // أيقونة فقط
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Reward,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Reward,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Reward,
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
        title={t("bonus.name")}
        link={"/staff/bonus"}
        onClick={() => navigate("/staff/bonus/add")}
        buttonText={t("bonus.add")}
        hideBrimaryButton={
          !hasPermissionFunction({
            group: PERMISSION_GROUP.Reward,
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
        permissionGroup={Permissions.EMPLOYEES}
        hasSearch={true}
        searchValue={state.searchValue}
        onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
        searchPlaceholder={t("common.searchPlaceholder")}
        hasColumnFilters={false}
        isLoading={isLoading}
        extraActions={extraActions}
        hideFilter
        useFullHeight={true}
        hasStickyBreadcrumb={true}
      />
      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("bonus.delete")}
          warning={t("item.warning")}
          deleteText={t("bonus.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </div>
  );
}

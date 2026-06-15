/* eslint-disable comma-dangle */
/* eslint-disable react-hooks/exhaustive-deps */
import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import DropdownMenu from "@/components/shared/dropdownMenu";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Permissions, truncateText, hasPermissionFunction } from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { showSuccess } from "@/libs/react.toastify";
import { handleBackendErrors } from "@/utils/helpers";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { useReasonQueries } from "@/apis/reason/query";
import { apis } from "@/apis/reason/api";

const ReasonForNotBooking = () => {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useReasonQueries.GetAll({
    per_page: state.pageSize,
    page: state.pageIndex,

    search: state.searchValue,
  });

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        title: truncateText({ text: item.title, maxLength: 60 }),
      })) || [],
    [data?.data]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "id_show",
        header: "#",
      },
      { accessorKey: "title", header: t("common.address") },
    ],
    [t, i18n.language]
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

  const handleEdit = row => navigate(`/reasons_for_not_booking/${row.id}`);

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

  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.REASON_FOR_NOT_BOOKING,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.REASON_FOR_NOT_BOOKING,
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
          title={t("booking.reasons_for_not_booking")}
          link={"/reasons_for_not_booking"}
          onClick={() => navigate("/reasons_for_not_booking/add")}
          buttonText={t("booking.add_reasons_for_not_booking")}
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.REASON_FOR_NOT_BOOKING,
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
          permissionGroup={Permissions.REASON_FOR_NOT_BOOKING}
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
          hideFilter="true"
        />
      </div>
      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("booking.delete-reasons_for_not_booking")}
          warning={t("delayed.warning")}
          deleteText={t("booking.delete-reasons_for_not_booking")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
};

export default ReasonForNotBooking;

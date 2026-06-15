/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { encryptId, handleBackendErrors, Permissions, truncateText } from "@/utils/helpers";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { showSuccess } from "@/libs/react.toastify";
import DropdownMenu from "@/components/shared/dropdownMenu";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import edit from "@assets/svgs/common/edit-menu.svg";

import { PERMISSION_GROUP, PERMISSION_ACTION } from "@/constants/constants";
import { Can } from "@/components/shared/can/can";
import { hasPermissionFunction } from "@/utils/helpers";
import { apis } from "@/apis/offers/api";
import { useOfferQueries } from "@/apis/offers/query";
import { formatDateOrTime } from "@/utils/helpers";
export default function Offers() {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useOfferQueries.GetAll({
    per_page: state.pageSize,
    page: state.page,
    search: state.searchValue,
  });

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        from_date: formatDateOrTime({ input: item.from_date, type: "date" }),
        to_date: formatDateOrTime({ input: item.to_date, type: "date" }),
        discount_type:
          item?.discount_type === "fixed"
            ? t("offers.fixed")
            : item?.discount_type === "percentage"
            ? t("employee.percentage")
            : item?.discount_type,
        discount_value: item?.discount_value,
        service: item.service?.name,
      })) || [],
    [data?.data]
  );

  const columns = useMemo(
    () => [
      { accessorKey: "id_show", header: "#" },
      { accessorKey: "from_date", header: t("offers.from") },
      { accessorKey: "to_date", header: t("offers.to") },

      { accessorKey: "discount_type", header: t("voucher.discount_type") },
      { accessorKey: "discount_value", header: t("voucher.discount_value") },
      { accessorKey: "service", header: t("booking.service") },
    ],
    []
  );

  // ✅ Handlers
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

  const handleEdit = row => navigate(`/offers/${row.id}`);
  const handleShow = row => navigate(`/offers/${row.id}?show=true`);

  const handleDelete = row => {
    dispatch({ type: branchesActions.openDeleteModal, payload: true });
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
      dispatch({ type: branchesActions.isSending, payload: true });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: branchesActions.isSending, payload: true });
    }
  };

  const handelCloseModal = () => {
    dispatch({ type: branchesActions.selectedId, payload: 0 });
    dispatch({ type: branchesActions.closeDeleteModal });
    dispatch({ type: branchesActions.isDeleteModalOpen, payload: false });
  };
  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"), // النص هنا
        icon: <img src={show} alt="show" />, // أيقونة فقط
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Offers,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Offers,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Offers,
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
          title={t("sidebar.offers")}
          link={"/offers"}
          onClick={() => navigate("/offers/add")}
          buttonText={t("offers.add")}
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.Offers,
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
          onShow={handleShow}
          onDelete={handleDelete}
          permissionGroup={PERMISSION_GROUP.User}
          hasSearch={true}
          searchValue={state.searchValue}
          onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
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
          title={t("offers.delete")}
          warning={t("delayed.warning")}
          deleteText={t("offers.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
}

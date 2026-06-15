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
import { apis } from "@/apis/vendors/api";
import { useVendorsQueries } from "@/apis/vendors/query";
export default function Vendors() {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useVendorsQueries.GetAll({
    per_page: state.pageSize,
    page: state.page,
    search: state.searchValue,
  });

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        name: truncateText({ text: item.full_name, maxLength: 20 }),
        company_name: truncateText({ text: item?.company_name, maxLength: 20 }),
        phone: item?.phone_number,
        notes: truncateText({ text: item?.notes, maxLength: 20 }) || "-",
        address: item.address,
        country_code: item?.country_code,
      })) || [],
    [data?.data]
  );

  const columns = useMemo(
    () => [
      { accessorKey: "id_show", header: "#" },
      { accessorKey: "name", header: t("vendors.name") },
      { accessorKey: "company_name", header: t("vendors.company") },
      {
        accessorKey: "phone",
        header: t("common.phone-number"),
        cell: item => {
          const value = item.getValue();
          const rowData = item.row.original;
          return (
            <div>
              <p
                style={{
                  unicodeBidi: "plaintext",
                  textAlign: i18n.language === "en" ? "left" : "right",
                }}
              >
                {rowData.country_code}
                {value}
              </p>
            </div>
          );
        },
      },

      { accessorKey: "address", header: t("common.address") },
      { accessorKey: "notes", header: t("common.notes") },
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

  const handleEdit = row => navigate(`/warehouse/vendors/${row.id}`);
  const handleShow = row => navigate(`/warehouse/vendors/${row.id}?show=true`);

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
          group: PERMISSION_GROUP.Vendors,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Vendors,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Vendors,
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
          title={t("sidebar.vendors")}
          link={"/warehouse/vendors"}
          onClick={() => navigate("/warehouse/vendors/add")}
          buttonText={t("vendors.add")}
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.Vendors,
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
          title={t("vendors.delete")}
          warning={t("delayed.warning")}
          deleteText={t("vendors.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
}

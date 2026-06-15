/* eslint-disable comma-dangle */
/* eslint-disable react-hooks/exhaustive-deps */
import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import DropdownMenu from "@/components/shared/dropdownMenu";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Permissions, hasPermissionFunction } from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { showSuccess } from "@/libs/react.toastify";
import { handleBackendErrors } from "@/utils/helpers";
import { useBillQueries } from "@/apis/bills/query";
import { apis } from "@/apis/bills/api";
import { useForm } from "react-hook-form";
import Input from "@/components/shared/input";
import { formatSalary } from "@/utils/helpers";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import printer from "@assets/svgs/common/printer.svg";
import useVendors from "@/hooks/useVendors";
import SelectField from "@/components/shared/select";
export default function Bills() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();
  const { control, watch, reset } = useForm({
    defaultValues: { no: "", notes: "", vendor_id: null },
  });
  const { data, isLoading, refetch } = useBillQueries.GetAll({
    per_page: state.pageSize,
    page: state.pageIndex,
    search: state.searchValue,
    no: watch("no"),
    notes: watch("notes"),
    vendor_id: watch("vendor_id"),
  });
  const { isLoadingVendors, items: vendors } = useVendors();

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        no: item.no,
        date: item.date,
        total: item.total + " " + t("code"),
        paid_amount: formatSalary(item.paid_amount) + " " + t("code"),
        remaining_amount: formatSalary(item.remaining_amount) + " " + t("code"),
        notes: item.notes,
        vendor: item.vendor?.name,
      })) || [],
    // eslint-disable-next-line comma-dangle
    [data?.data]
  );
  // Table state
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
  const columns = useMemo(
    () => [
      {
        accessorKey: "id_show",
        header: "#",
        enableColumnFilter: true,
      },
      { accessorKey: "no", header: t("bills.no"), enableColumnFilter: true },
      {
        accessorKey: "date",
        header: t("bills.date"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "total",
        header: t("cashier.total"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "paid_amount",
        header: t("bills.paid"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "remaining_amount",
        header: t("bills.remaining"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "vendor",
        header: t("vendors.name"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "notes",
        header: t("common.notes"),
        enableColumnFilter: true,
      },
    ],
    []
  );
  // Filter data based on search and column filters

  const handleEdit = row => navigate(`/accounts/bills/${row.id}`);
  const handleShow = row => navigate(`/accounts/bills/${row.id}?show=true`);

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
  const handlePrint = row => navigate(`/accounts/bills/bill-invoice/${row.id}`);
  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"), // النص هنا
        icon: <img src={show} alt="show" />, // أيقونة فقط
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Bill,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Bill,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("print.printBill"),
        icon: <img src={printer} alt="printer" />,
        onClick: () => handlePrint(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Bill,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Bill,
          type: PERMISSION_ACTION.delete,
        }),
      },
    ];
    return (
      <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />
    );
  };
  const onResetFilter = () => {
    reset();
    dispatch({ type: branchesActions.pageIndex, payload: 1 });
  };

  const filterItems = [
    {
      id: 1,
      component: (
        <div className="w-[400px]">
          <Input name="no" control={control} placeholder={t("bills.no")} />
        </div>
      ),
    },
    {
      id: 2,
      component: (
        <div className="w-[400px]">
          <Input name="notes" control={control} placeholder={t("common.notes")} />
        </div>
      ),
    },
    {
      id: 3,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="vendor_id"
            control={control}
            options={vendors}
            placeholder={t("vendors.name")}
            loading={isLoadingVendors}
          />
        </div>
      ),
    },
  ];
  return (
    <>
      <div>
        <BreadCrumb
          title={t("sidebar.bills")}
          link={"/accounts/bills"}
          onClick={() => navigate("/accounts/bills/add")}
          sticky={true}
          stickyTop="70px"
          buttonText={t("common.add")}
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.Bill,
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
          permissionGroup={Permissions.VOUCHERS}
          hasSearch={true}
          searchValue={state.searchValue}
          onDelete={handleDelete}
          onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
          searchPlaceholder={t("common.searchPlaceholder")}
          hasColumnFilters={false}
          isLoading={false}
          useFullHeight={true}
          hasStickyBreadcrumb={true}
          onResetFilters={onResetFilter}
          extraActions={extraActions}
          filterElements={filterItems}
        />
      </div>
      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("bills.delete")}
          warning={t("package.warning")}
          deleteText={t("bills.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
}

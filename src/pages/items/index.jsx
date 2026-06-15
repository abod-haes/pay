import React, { useMemo, useReducer } from "react";
import { Table } from "@/components/table";
import BreadCrumb from "@/components/breadcrumb";
import { useTranslation } from "react-i18next";
import { warehouseActions, initialValues, warehouseReducer } from "@/reducers/warehouse";
import { useNavigate } from "react-router-dom";
import { encryptId, hasPermissionFunction, Permissions, truncateText } from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import DropdownMenu from "@/components/shared/dropdownMenu";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { useMaterialQueries } from "@/apis/items/query";
import { handleBackendErrors } from "@/utils/helpers";
import { showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/items/api";
import { useWarehouseQueries } from "@/apis/warehouse/query";
import { useUnitQueries } from "@/apis/unit/query";
import SelectField from "@/components/shared/select";
import { useForm } from "react-hook-form";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { Can } from "@/components/shared/can/can";
export default function Items() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(warehouseReducer, initialValues);
  const navigate = useNavigate();
  const { control, watch, reset } = useForm({
    defaultValues: { warehouse_id: null, unit_id: null },
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { data, isLoading, refetch } = useMaterialQueries.GetAll({
    per_page: state.pageSize,
    page: state.pageIndex,
    unit_id: watch("unit_id"),
    warehouse_id: watch("warehouse_id"),
    search: state.searchValue,
  });
  const { data: warehouseData, isLoading: isLoadingWare } = useWarehouseQueries.GetAll({});
  const { data: unitData, isLoading: isLoadingUnit } = useUnitQueries.GetAll({});
  const warehouseOptions = useMemo(
    () =>
      warehouseData?.data?.map(employee => ({
        label: employee.name,
        value: employee.id,
      })) || [],
    [warehouseData?.data]
  );
  const unitOptions = useMemo(
    () =>
      unitData?.data?.map(employee => ({
        label: employee.name,
        value: employee.id,
      })) || [],
    [unitData?.data]
  );
  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,

        name: truncateText({ text: item.name, maxLength: 5 }),
        buyPrice: item.purchase_price + " " + t("code"),
        sellPrice: item.selling_price + " " + t("code"),
        quantity: item.quantity,
        fill: truncateText({ text: item.unit.name, maxLength: 5 }),
        store: truncateText({ text: item.warehouse.name, maxLength: 5 }),
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
        header: t("hair.item-name"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "buyPrice",
        header: t("item.buy-price"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "sellPrice",
        header: t("hair.sell-price"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "quantity",
        header: t("hair.quantity"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "fill",
        header: t("hair.fill"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "store",
        header: t("hair.store"),
        enableColumnFilter: true,
      },
    ],
    []
  );
  const handleEdit = row => navigate(`/warehouse/items/${row.id}`);
  const handleShow = row => navigate(`/warehouse/items/${row.id}?show=true`);
  // const handleShow = row => navigate(`/warehouse/items/${encryptId(row.id)}/show`);
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
      showSuccess(response?.data.message);
      dispatch({ type: warehouseActions.isSending, payload: false });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: warehouseActions.isSending, payload: false });
    }
  };

  const handelCloseModal = () => {
    dispatch({ type: warehouseActions.selectedId, payload: 0 });
    dispatch({ type: warehouseActions.closeDeleteModal });
    dispatch({ type: warehouseActions.openDeleteModal, payload: false });
  };

  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"), // النص هنا
        icon: <img src={show} alt="show" />, // أيقونة فقط
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Material,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Material,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Material,
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
    dispatch({ type: warehouseActions.pageIndex, payload: 1 });
  };

  const filterItems = [
    {
      id: 1,
      component: (
        <div className="w-[400px]">
          <SelectField
            name="warehouse_id"
            control={control}
            options={warehouseOptions}
            placeholder={t("sidebar.warehouse")}
            loading={isLoadingWare}
          />
        </div>
      ),
    },
    {
      id: 1,
      component: (
        <div className="w-[400px]">
          <SelectField
            name="unit_id"
            control={control}
            options={unitOptions}
            placeholder={t("hair.fill")}
            loading={isLoadingUnit}
          />
        </div>
      ),
    },
  ];
  return (
    <>
      <div>
        <BreadCrumb
          title={t("sidebar.items")}
          link={"/items"}
          buttonText={t("hair.add")}
          onClick={() => navigate("/warehouse/items/add")}
          sticky={true}
          stickyTop="70px"
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.Material,
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
          permissionGroup={PERMISSION_GROUP.Material}
          hasSearch={true}
          searchValue={state.searchValue}
          onSearchChange={val => dispatch({ type: warehouseActions.searchValue, payload: val })}
          searchPlaceholder={t("common.searchPlaceholder")}
          hasColumnFilters={false}
          isLoading={isLoading}
          useFullHeight={true}
          hasStickyBreadcrumb={true}
          extraActions={extraActions}
          onResetFilters={onResetFilter}
          filterElements={filterItems}
        />
      </div>
      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("item.delete")}
          warning={t("item.warning")}
          deleteText={t("item.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
}

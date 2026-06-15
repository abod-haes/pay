/* eslint-disable comma-dangle */
import React, { useMemo, useReducer } from "react";
import { Table } from "@/components/table";
import BreadCrumb from "@/components/breadcrumb";
import { useTranslation } from "react-i18next";
import { warehouseActions, initialValues, warehouseReducer } from "@/reducers/warehouse";
import { useNavigate } from "react-router-dom";
import { encryptId, hasPermissionFunction, Permissions } from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import DropdownMenu from "@/components/shared/dropdownMenu";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { useWarehouseQueries } from "@/apis/warehouse/query";
import { useForm } from "react-hook-form";
import SelectField from "@/components/shared/select";
import WarehouseAction from "./warehouse-action";
import { handleBackendErrors } from "@/utils/helpers";
import { showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/warehouse/api";
import useCities from "@/hooks/useCities";
import Input from "@/components/shared/input";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
export default function Warehouse() {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(warehouseReducer, initialValues);
  const navigate = useNavigate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { control, watch, reset } = useForm({
    defaultValues: { city_id: null, name: "", address: "" },
  });
  const { isLoadingStates, items } = useCities({});

  const { data, isLoading, refetch } = useWarehouseQueries.GetAll({
    per_page: state.pageSize,
    page: state.pageIndex,
    search: state.searchValue,
    city_id: watch("city_id"),
    name: watch("name"),
    address: watch("address"),
  });

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,

        name: item.name,
        phone: item.phone_number,
        address: item.address,
        country_code: item?.country_code,
      })) || [],
    // eslint-disable-next-line comma-dangle
    [data?.data]
  );

  // ✅ Handlers
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
        header: t("warehouse.name"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "phone",
        header: t("common.phone-number"),
        enableColumnFilter: true,
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
                +{rowData.country_code}
                {value}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "address",
        header: t("common.address"),
        enableColumnFilter: true,
      },
    ],
    []
  );
  const handleEdit = row => navigate(`/warehouse/warehouses/${row.id}`);
  const handleShow = row => navigate(`/warehouse/warehouses/${row.id}/show`);
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
          group: PERMISSION_GROUP.Warehouse,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Warehouse,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Warehouse,
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
        <div>
          <SelectField
            name="city_id"
            control={control}
            options={items}
            placeholder={t("users.city")}
            loading={isLoadingStates}
          />
        </div>
      ),
    },
    {
      id: 2,
      component: (
        <div>
          <Input name="name" control={control} placeholder={t("warehouse.name")} />
        </div>
      ),
    },
    {
      id: 3,
      component: (
        <div>
          <Input name="address" control={control} placeholder={t("common.address")} />
        </div>
      ),
    },
  ];

  return (
    <>
      <div>
        <BreadCrumb
          title={t("sidebar.warehouses")}
          link={"/warehouses"}
          buttonText={t("warehouse.add")}
          onClick={() => navigate("/warehouse/warehouses/add")}
          sticky={true}
          stickyTop="70px"
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.Warehouse,
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
          permissionGroup={PERMISSION_GROUP.Warehouse}
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
          hideFilter
        />
      </div>
      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("warehouse.delete")}
          warning={t("package.warning")}
          deleteText={t("warehouse.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
}

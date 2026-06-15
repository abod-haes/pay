/* eslint-disable comma-dangle */
/* eslint-disable curly */
import React, { useMemo, useReducer } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useNavigate } from "react-router-dom";
import Card from "@/components/card";
import { warehouseActions, initialValues, warehouseReducer } from "@/reducers/warehouse";
import { Table } from "@/components/table";
import { encryptId, Permissions } from "@/utils/helpers";
import { useTranslation } from "react-i18next";
import DropdownMenu from "@/components/shared/dropdownMenu";
import { useWarehouseQueries } from "@/apis/warehouse/query";
import { useParams } from "react-router-dom";
import { useMaterialQueries } from "@/apis/items/query";
import { truncateText } from "@/utils/helpers";
import PrimaryButton from "@/components/shared/primaryButton";
import edit from "@assets/svgs/common/edit-menu.svg";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { apis } from "@/apis/items/api";
import { handleBackendErrors, hasPermissionFunction } from "@/utils/helpers";
import { showSuccess } from "@/libs/react.toastify";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { Can } from "@/components/shared/can/can";
export default function WarehouseDetails() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams();
  const [state, dispatch] = useReducer(warehouseReducer, initialValues);
  const { data: warehouse } = useWarehouseQueries.GetOne({ id });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { data, isLoading, refetch } = useMaterialQueries.GetAll({
    per_page: state.pageSize,
    page: state.pageIndex,
    search: state.searchValue,
    unit_id: "",
    warehouse_id: { value: id },
  });

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,

        name: truncateText({ text: item.name, maxLength: 5 }),
        buyPrice: item.purchase_price,
        sellPrice: item.selling_price,
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
        header: t("hair.sales"),
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

  const warehouseInfoData = useMemo(() => {
    if (!warehouse?.data.data) return [];

    return [
      {
        label: t("warehouse.name"),
        value: warehouse.data.data.name || " ",
      },
      {
        label: t("common.phone-number"),
        value: warehouse.data.data.phone_number || " ",
      },
      {
        label: t("common.address"),
        value: warehouse.data.data.address || " ",
      },
    ];
  }, [warehouse, t]);

  return (
    <div>
      <BreadCrumb
        title={t("warehouse.details")}
        link={"/warehouses"}
        // buttonText={t("hair.add")}
        // onClick={() => navigate("/warehouse/items/add")}
        sticky={true}
        stickyTop="70px"
        isAdd
        hideBrimaryButton={
          !hasPermissionFunction({
            group: PERMISSION_GROUP.Material,
            type: PERMISSION_ACTION.create,
          })
        }
        customSection={
          <Can group={PERMISSION_GROUP.Material} type={PERMISSION_ACTION.create}>
            <PrimaryButton
              text={t("hair.add")}
              onClick={() =>
                navigate(
                  `/warehouse/items/add?warehouse_id=${id}&warehouse_name=${encodeURIComponent(
                    warehouse.data.data.name || " "
                  )}`
                )
              }
            />
          </Can>
        }
      />
      <Card otherStyle={"mb-8 !py-6"}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:w-[50%]">
          {warehouseInfoData.map((item, index) => (
            <div key={index} className="flex flex-col gap-4">
              <p className="font-main text-accent text-[0.75rem]">{item.label}</p>
              <p className="font-main text-[#3333333] text-[0.85rem]">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
      <p className="font-main text-[1.25rem] py-6 text-primary">{t("sidebar.items")}</p>
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
        permissionGroup={Permissions.SALARY}
        hasSearch={true}
        searchValue={state.searchValue}
        onSearchChange={val => dispatch({ type: warehouseActions.searchValue, payload: val })}
        searchPlaceholder={t("common.searchPlaceholder")}
        hasColumnFilters={false}
        isLoading={isLoading}
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
          title={t("item.delete")}
          warning={t("item.warning")}
          deleteText={t("item.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </div>
  );
}

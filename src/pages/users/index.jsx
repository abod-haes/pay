/* eslint-disable react-hooks/exhaustive-deps */
import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { encryptId, handleBackendErrors, Permissions, truncateText } from "@/utils/helpers";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { useUsersQueries } from "@/apis/users/query";
import { apis } from "@/apis/users/api";
import { showSuccess } from "@/libs/react.toastify";
import { useForm } from "react-hook-form";
import SelectField from "@/components/shared/select";
import Input from "@/components/shared/input";
import useCities from "@/hooks/useCities";
import { PERMISSION_GROUP, PERMISSION_ACTION } from "@/constants/constants";
import { Can } from "@/components/shared/can/can";
import { hasPermissionFunction } from "@/utils/helpers";
const Users = () => {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();
  const { control, watch, reset } = useForm({ defaultValues: { salary: null, city_id: null } });
  const { isLoadingStates, items } = useCities({});

  const { data, isLoading, refetch } = useUsersQueries.GetAll({
    per_page: state.pageSize,
    page: state.page,
    search: state.searchValue,
    target: watch("salary"),
    city_id: watch("city_id"),
    phone_number: watch("phone"),
  });

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        name: truncateText({ text: item.full_name, maxLength: 20 }),
        city: truncateText({ text: item?.city?.name, maxLength: 20 }),
        phone: item?.phone_number,
        notes: truncateText({ text: item?.notes, maxLength: 20 }) || "-",
        // target: `${item.salary?.value} ${t("common.da")}` || 0,
        country_code: item?.country_code,
      })) || [],
    [data?.data]
  );

  const columns = useMemo(
    () => [
      { accessorKey: "id_show", header: "#" },
      { accessorKey: "name", header: t("users.name") },
      { accessorKey: "city", header: t("users.city") },
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
                +{rowData.country_code}
                {value}
              </p>
            </div>
          );
        },
      },
      // { accessorKey: "target", header: t("users.target") },
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

  const handleEdit = row => navigate(`/users/${encryptId(row.id)}`);
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

  const onResetFilter = () => {
    reset();
    dispatch({ type: branchesActions.pageIndex, payload: 1 });
  };

  const filterItems = [
    // {
    //   id: 1,
    //   component: <Input name="target" control={control} placeholder={t("users.target")} />,
    // },
    {
      id: 1,
      component: (
        <div className="w-[400px]">
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
  ];

  return (
    <>
      <div>
        <BreadCrumb
          title={t("sidebar.users")}
          link={"/users"}
          onClick={() => navigate("/users/add")}
          buttonText={t("common.add")}
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.User,
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
          permissionGroup={PERMISSION_GROUP.User}
          hasSearch={true}
          searchValue={state.searchValue}
          onDelete={handleDelete}
          onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
          hasColumnFilters={false}
          isLoading={isLoading}
          useFullHeight={true}
          onResetFilters={onResetFilter}
          filterElements={filterItems}
          hasStickyBreadcrumb={true}
        />
      </div>
      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("users.delete")}
          warning={t("delayed.warning")}
          deleteText={t("users.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
};

export default Users;

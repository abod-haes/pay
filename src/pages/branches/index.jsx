/* eslint-disable react-hooks/exhaustive-deps */
import BreadCrumb from "@/components/breadcrumb";
import BranchesTable from "@/components/table/table";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  encryptId,
  handleBackendErrors,
  hasPermissionFunction,
  truncateText,
} from "@/utils/helpers";
import eye from "@/assets/svgs/table/e-eye.svg";
import edit2 from "@/assets/svgs/table/edit2.svg";
import trash1 from "@/assets/svgs/table/trash.svg";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { useBranchesQueries } from "@/apis/branches/query";
import { showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/branches/api";
import Input from "@/components/shared/input";
import { useForm } from "react-hook-form";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import DropdownMenu from "@/components/shared/dropdownMenu";

const Branches = () => {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();

  const { control, watch, reset } = useForm({ defaultValues: { name: "", address: "" } });

  const { data, isLoading, refetch } = useBranchesQueries.GetAll({
    per_page: state.pageSize,
    page: state.pageIndex,
    search: state.searchValue,
    name: watch("name"),
    address: watch("address"),
  });

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => {
        const defaultUser = item?.default_user || {};

        return {
          id: item.id,
          id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
          branchName: truncateText({ text: item.name, maxLength: 5 }) || "-",
          address: truncateText({ text: item.address, maxLength: 5 }) || "-",
          notes: truncateText({ text: item.notes, maxLength: 5 }) || "-",
          url: truncateText({ text: item.domain_name, maxLength: 5 }) || "-",
          username: truncateText({ text: defaultUser?.username, maxLength: 18 }) || "-",
          email: truncateText({ text: defaultUser?.email, maxLength: 24 }) || "-",
          phone: item.phone_number,
          country_code: item?.country_code,
        };
      }) || [],
    [data?.data]
  );

  const columns = useMemo(
    () => [
      { accessorKey: "id_show", header: "#" },
      { accessorKey: "branchName", header: t("branches.branch-name") },
      { accessorKey: "username", header: t("common.user") },
      { accessorKey: "email", header: t("common.email") },
      { accessorKey: "address", header: t("common.address") },
      { accessorKey: "url", header: t("branches.url") },
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
      { accessorKey: "notes", header: t("common.notes") },
    ],
    [i18n.language, t]
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

  const handleShow = row => navigate(`/branches/${encryptId(row.id)}?show=true`);
  const handleEdit = row => navigate(`/branches/${encryptId(row.id)}`);
  const handleDelete = row => {
    dispatch({ type: branchesActions.openDeleteModal, payload: true });
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
      dispatch({ type: branchesActions.openDeleteModal, payload: false });
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

  const onResetFilter = () => {
    reset();
    dispatch({ type: branchesActions.pageIndex, payload: 1 });
  };

  const filterItems = [
    {
      id: 0,
      component: (
        <div className="w-[400px]">
          <Input name="name" control={control} placeholder={t("branches.branch-name")} />
        </div>
      ),
    },
    {
      id: 1,
      component: (
        <div className="w-[400px]">
          {" "}
          <Input name="address" control={control} placeholder={t("common.address")} />
        </div>
      ),
    },
  ];

  const userData = localStorage.getItem("authData");
  const jonsAuth = JSON.parse(userData);
  const branch_id = localStorage.getItem("branch_id");
  const jonsBranch_id = JSON.parse(branch_id);

  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"),
        icon: <img src={eye} alt="show" />,
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Branch,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit2} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Branch,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("common.delete"),
        icon: <img src={trash1} alt="cancel" />,
        onClick: () => {
          dispatch({ type: branchesActions.openDeleteModal, payload: true });
          dispatch({ type: branchesActions.selectedId, payload: row.id });
        },
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Branch,
          type: PERMISSION_ACTION.delete,
        }),
      },
      {
        label: t("branches.impersonation"),
        icon: <img src={eye} alt="sadad" />,
        onClick: () => {
          localStorage.setItem("branch_id", JSON.stringify(row));
          navigate("/homePage");
        },
        show: jonsAuth?.user?.id !== row?.id && jonsBranch_id?.id !== row?.id,
      },
    ];
    return (
      <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />
    );
  };

  return (
    <>
      <div>
        <Can group={PERMISSION_GROUP.Branch} type={PERMISSION_ACTION.create}>
          <BreadCrumb
            title={t("branches.branches")}
            link={"/branches"}
            onClick={() => navigate("/branches/add")}
            buttonText={t("common.add")}
            sticky={true}
            stickyTop="70px"
          />
        </Can>
        <BranchesTable
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
          permissionGroup={PERMISSION_GROUP.Branch}
          hasSearch={true}
          filterElements={filterItems}
          searchValue={state.searchValue}
          onDelete={handleDelete}
          onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
          searchPlaceholder={t("common.searchPlaceholder")}
          hasColumnFilters={false}
          isLoading={isLoading}
          useFullHeight={true}
          hasStickyBreadcrumb={true}
          onResetFilters={onResetFilter}
          extraActions={extraActions}
        />
      </div>
      {state.openDeleteModal && (
        <DeleteModal
          isOpen={state.openDeleteModal}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("branches.delete")}
          warning={t("delayed.warning")}
          deleteText={t("branches.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
};

export default Branches;

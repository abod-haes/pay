/* eslint-disable comma-dangle */
/* eslint-disable react-hooks/exhaustive-deps */
import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import DropdownMenu from "@/components/shared/dropdownMenu";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { encryptId, Permissions } from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import { useEmployeeQueries } from "@/apis/employee/query";
import { useForm } from "react-hook-form";
import { truncateText, formatDateOrTime, hasPermissionFunction } from "@/utils/helpers";
import SelectField from "@/components/shared/select";
import { handleBackendErrors } from "@/utils/helpers";
import { showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/employee/api";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { jobTitleQueries } from "@/apis/jobTitle/query";

export default function Tenchnician() {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();
  const { control, watch, reset } = useForm({
    defaultValues: {
      type: null,
      city_id: null,
      full_name: null,
      job_title_id: null,
      department_id: null,
    },
  });
  const { data, isLoading, refetch } = useEmployeeQueries.GetAll({
    per_page: state.pageSize,
    page: state.pageIndex,
    type: "technician",
    city_id: watch("city_id"),
    full_name: watch("full_name"),
    job_title_id: watch("job_title_id"),
    department_id: watch("department_id"),
    search: state.searchValue,
  });
  const { data: jobData, isLoading: isLoadingJob } = jobTitleQueries.GetAll({});
  const shiftTranslations = useMemo(
    () => ({
      morning: t("shift.morning"),
      afternoon: t("shift.afternoon"),
      night: t("shift.night"),
      flexible: t("shift.flexible"),
    }),
    [t]
  );
  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        employee: truncateText({ text: item.full_name, maxLength: 20 }),

        jobTitle: truncateText({ text: item.jobTitle.name, maxLength: 20 }),
        time: item.start_time ? item.start_time.substring(0, 5) : "",
        phone: item.phone_number,
        shift: shiftTranslations[item.shift_type] || item.shift_type,
        hireDate: formatDateOrTime({ input: item.appointment_date, type: "date" }),
        startDate: formatDateOrTime({ input: item.start_date, type: "date" }),
        country_code: item.country_code,
      })) || [],
    // eslint-disable-next-line comma-dangle
    [data?.data]
  );
  // ✅ الأعمدة
  const columns = useMemo(
    () => [
      { accessorKey: "id_show", header: "#" },
      { accessorKey: "employee", header: t("staff.Tunisian") },

      { accessorKey: "jobTitle", header: t("staff.job-title") },
      { accessorKey: "time", header: t("salary.working-time") },
      { accessorKey: "shift", header: t("salary.shift") },
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
      { accessorKey: "hireDate", header: t("staff.hire-date") },
      { accessorKey: "startDate", header: t("staff.start-date") },
    ],
    [t]
  );
  const jobOptions = useMemo(
    () =>
      jobData?.data?.map(employee => ({
        label: employee.name,
        value: employee.id,
      })) || [],
    [jobData?.data]
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

  const handleEdit = row => navigate(`/staff/tenchnician/${row.id}`);
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
      dispatch({ type: branchesActions.isSending, payload: true });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: branchesActions.isSending, payload: true });
    }
  };

  const handelCloseModal = () => {
    dispatch({ type: branchesActions.selectedId, payload: 0 });
    dispatch({ type: branchesActions.closeDeleteModal });
    dispatch({ type: branchesActions.openDeleteModal, payload: false });
  };

  const handleShow = row => navigate(`/staff/tenchnician/${row.id}/show`);

  // إنشاء extraActions باستخدام DropdownMenu
  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"), // النص هنا
        icon: <img src={show} alt="show" />, // أيقونة فقط
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Employee,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Employee,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Employee,
          type: PERMISSION_ACTION.delete,
        }),
      },
    ];
    return (
      <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />
    );
  };
  const filterItems = [
    // {
    //   id: 1,
    //   component: (
    //     <div >
    //       <SelectField
    //         name="type"
    //         control={control}
    //         options={userType}
    //         placeholder={t("employee.type")}
    //         loading={isLoading}
    //       />
    //     </div>
    //   ),
    // },
    {
      id: 1,
      component: (
        <div className="w-[400px]">
          <SelectField
            name="job_title_id"
            control={control}
            options={jobOptions}
            placeholder={t("job.choose")}
            loading={isLoadingJob}
          />
        </div>
      ),
    },
  ];
  const onResetFilter = () => {
    reset();
    dispatch({ type: branchesActions.pageIndex, payload: 1 });
  };
  return (
    <div>
      <BreadCrumb
        title={t("staff.Tunisian")}
        link={"/staff/employee"}
        onClick={() => navigate("/staff/tenchnician/add")}
        buttonText={t("salary.add")}
        hideBrimaryButton={
          !hasPermissionFunction({
            group: PERMISSION_GROUP.Employee,
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
        permissionGroup={Permissions.EMPLOYEES}
        hasSearch={true}
        searchValue={state.searchValue}
        onDelete={handleDelete}
        onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
        searchPlaceholder={t("common.searchPlaceholder")}
        hasColumnFilters={false}
        isLoading={false}
        useFullHeight={true}
        hasStickyBreadcrumb={true}
        extraActions={extraActions}
        onResetFilters={onResetFilter}
        filterElements={filterItems}
      />
      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("employee.delete")}
          warning={t("delayed.warning")}
          deleteText={t("employee.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
    </div>
  );
}

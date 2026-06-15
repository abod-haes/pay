/* eslint-disable comma-dangle */
/* eslint-disable complexity */
import React, { useMemo, useReducer } from "react";
import { Table } from "@/components/table";
import BreadCrumb from "@/components/breadcrumb";
import { useTranslation } from "react-i18next";
import { salaryActions, initialValues, salaryReducer } from "@/reducers/salary";
import { useNavigate } from "react-router-dom";
import { encryptId, hasPermissionFunction, Permissions, truncateText } from "@/utils/helpers";
import edit from "@assets/svgs/common/edit-menu.svg";
import DropdownMenu from "@/components/shared/dropdownMenu";
import show from "@assets/svgs/common/eye-menu.svg";
import money from "@assets/svgs/common/money-add.svg";
import { useSalariesQueries } from "@/apis/salary/query";
import { formatDateOrTime } from "@/utils/helpers";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
export default function Salary() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(salaryReducer, initialValues);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useSalariesQueries.GetAll({
    per_page: state.pageSize,
    search: state.searchValue,
    page: state.pageIndex,
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,

        name: truncateText({ text: item.user?.full_name, maxLength: 5 }) || "-",
        department: truncateText({ text: item.user?.department?.name, maxLength: 5 }) || "-",
        job: truncateText({ text: item.user?.job_title?.name, maxLength: 5 }) || "-",
        salary: item.current + " " + t("code"),
        date: item.user?.appointment_date
          ? formatDateOrTime({ input: item.user.appointment_date, type: "date" })
          : "-",
        start: item.user?.start_date
          ? formatDateOrTime({ input: item.user.start_date, type: "date" })
          : "-",
      })) || [],
    [data?.data]
  );

  const handlePageSizeChange = newPageSize => {
    dispatch({ type: salaryActions.pageSize, payload: newPageSize });
  };

  const handlePreviousPage = () => {
    dispatch({ type: salaryActions.pageIndex, payload: state.pageIndex - 1 });
  };

  const handleNextPage = () => {
    dispatch({ type: salaryActions.pageIndex, payload: state.pageIndex + 1 });
  };

  const handleGotoPage = page => {
    dispatch({ type: salaryActions.pageIndex, payload: page });
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
        header: t("staff.employee"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "department",
        header: t("staff.department"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "job",
        header: t("staff.job-title"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "salary",
        header: t("salary.salary"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "date",
        header: t("staff.hire-date"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "start",
        header: t("staff.start-date"),
        enableColumnFilter: true,
      },
    ],
    []
  );
  const handleEdit = row => navigate(`/salary/${row.id}`);
  const handleShow = row => navigate(`/salary/${row.id}?show=true`);
  const handleAddBonus = row =>
    navigate(
      `/staff/bonus/add?employee_id=${row.id}&employee_name=${encodeURIComponent(row.name)}`
    );
  const handleAddDeduction = row =>
    navigate(
      `/staff/deduction/add?employee_id=${row.id}&employee_name=${encodeURIComponent(row.name)}`
    );
  const extraActions = row => {
    const menuItems = [
      {
        label: t("salary.show"), // النص هنا
        icon: <img src={show} alt="show" />, // أيقونة فقط
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Salary,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("bonus.add"),
        icon: <img src={money} alt="money" />,
        onClick: () => handleAddBonus(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Reward,
          type: PERMISSION_ACTION.create,
        }),
      },
      {
        label: t("deduction.add"),
        icon: <img src={money} alt="money" />,
        onClick: () => handleAddDeduction(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Punishment,
          type: PERMISSION_ACTION.create,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Salary,
          type: PERMISSION_ACTION.update,
        }),
      },
    ];
    return (
      <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />
    );
  };
  return (
    <div>
      <BreadCrumb
        title={t("sidebar.salary")}
        link={"/salary"}
        isAdd={true}
        sticky={true}
        stickyTop="70px"
        showArrow={false}
        hideBrimaryButton={
          !hasPermissionFunction({
            group: PERMISSION_GROUP.Salary,
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
        onShow={handleShow}
        permissionGroup={PERMISSION_GROUP.Salary}
        hasSearch={true}
        searchValue={state.searchValue}
        onSearchChange={val => dispatch({ type: salaryActions.searchValue, payload: val })}
        searchPlaceholder={t("common.searchPlaceholder")}
        hasColumnFilters={false}
        isLoading={isLoading}
        useFullHeight={true}
        hasStickyBreadcrumb={true}
        extraActions={extraActions}
        hideFilter
      />
    </div>
  );
}

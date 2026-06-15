/* eslint-disable max-lines */
/* eslint-disable indent */
/* eslint-disable curly */
/* eslint-disable complexity */
/* eslint-disable comma-dangle */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useReducer, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import PrimaryButton from "@/components/shared/primaryButton";
import DropdownMenu from "@/components/shared/dropdownMenu";
import Card from "@/components/card";
import { Table } from "@/components/table";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { Permissions } from "@/utils/helpers";
import { useTranslation } from "react-i18next";
import BorderedButton from "@/components/shared/borderedButton";
import { useParams, useNavigate } from "react-router-dom";
import { useEmployeeQueries } from "@/apis/employee/query";
import { useRewardsQueries } from "@/apis/rewards/query";
import { useDeductionQueries } from "@/apis/deduction/query";
import {
  truncateText,
  formatDateOrTime,
  formatSalary,
  hasPermissionFunction,
} from "@/utils/helpers";
import LoadingElement from "@/components/shared/loading";
import DeleteModal from "@/components/shared/modals/deleteModal";
import { apis } from "@/apis/employee/api";
import { handleBackendErrors } from "@/utils/helpers";
import { showSuccess } from "@/libs/react.toastify";
import deleteIcon from "@assets/svgs/table/trash.svg";
import lock from "@assets/svgs/common/lock.svg";
import PasswordModal from "@/components/shared/modals/passwordModal";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { apis as apisDeduction } from "@/apis/deduction/api";
import edit from "@assets/svgs/common/edit-menu.svg";
import show from "@assets/svgs/common/eye-menu.svg";
import { apis as apisRewards } from "@/apis/rewards/api";

export default function ShowPhysicianAssistant() {
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    type: null,
    selectedId: null,
    isSending: false,
  });
  const { data: oneData, isLoading: isLoadingData } = useEmployeeQueries.GetOne({ id });

  const {
    data: rewardData,
    isLoadingReward,
    refetch: refetchBonus,
  } = useRewardsQueries.GetByUser({
    id,
    per_page: state.pageSize,
    page: state.pageIndex,
    search: state.searchValue,
  });
  const {
    data: deductionData,
    isLoading,
    refetch: refetchDeduction,
  } = useDeductionQueries.GetByUser({
    id,
    per_page: state.pageSize,
    page: state.pageIndex,
    search: state.searchValue,
  });
  const rowData = useMemo(
    () =>
      Array.isArray(rewardData?.data?.data)
        ? rewardData.data.data.map((item, index) => ({
            id: item.id,
            //name: truncateText({ text: item.user?.full_name || "", maxLengthPercent: 0.9 }),
            price: item.value,
            date: formatDateOrTime({ input: item.date, type: "date" }),
            reason: truncateText({ text: item.notes || "", maxLength: 5 }),
          }))
        : [],
    [rewardData?.data?.data]
  );

  const rowData1 = useMemo(
    () =>
      Array.isArray(deductionData?.data?.data)
        ? deductionData.data.data.map((item, index) => ({
            id: item.id,
            // name: truncateText({ text: item.user?.full_name || "", maxLengthPercent: 0.9 }),
            price: item.value,
            date: formatDateOrTime({ input: item.date, type: "date" }),
            reason: truncateText({ text: item.notes || "", maxLength: 5 }),
          }))
        : [],
    [deductionData?.data?.data]
  );

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
        accessorKey: "id",
        header: "#",
        enableColumnFilter: true,
      },

      {
        accessorKey: "date",
        header: "التاريخ",
        enableColumnFilter: true,
      },
      {
        accessorKey: "price",
        header: "قيمة المكافأة",
        enableColumnFilter: true,
      },
      {
        accessorKey: "reason",
        header: "السبب",
        enableColumnFilter: true,
      },
    ],
    []
  );
  const columns3 = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "#",
        enableColumnFilter: true,
      },

      {
        accessorKey: "date",
        header: "التاريخ",
        enableColumnFilter: true,
      },
      {
        accessorKey: "price",
        header: "قيمة الاستطاع",
        enableColumnFilter: true,
      },
      {
        accessorKey: "reason",
        header: "السبب",
        enableColumnFilter: true,
      },
    ],
    []
  );
  const handleShow = row => window.open(row.url, "_blank");
  const shiftTranslations = useMemo(
    () => ({
      morning: t("shift.morning"),
      afternoon: t("shift.afternoon"),
      night: t("shift.night"),
      flexible: t("shift.flexible"),
    }),
    [t]
  );
  const calculateWorkingTime = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    const diffMs = end - start;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHours}h ${diffMinutes}m`;
  };
  const personalInfoData1 = useMemo(() => {
    if (!oneData?.data) return [];

    return [
      { label: t("common.name"), value: oneData.data.full_name || "-" },
      {
        label: t("common.phone-number"),
        value: oneData?.data?.country_code + oneData?.data.phone_number || "-",
      },
      { label: t("staff.job-title"), value: oneData.data.job_title?.name || "-" },
      {
        label: t("salary.shift"),
        value: oneData.data.shift_type
          ? shiftTranslations[oneData.data.shift_type] || oneData.data.shift_type
          : "-",
      },
      {
        label: t("salary.working-time"),
        value:
          oneData?.data?.start_time && oneData?.data?.end_time
            ? calculateWorkingTime(oneData.data.start_time, oneData.data.end_time)
            : "-",
      },
    ];
  }, [oneData, t]);
  const salaryType = [
    {
      label: t("employee.monthly"),
      value: "monthly",
    },
    {
      label: t("employee.percentage"),
      value: "percentage",
    },
    {
      label: t("employee.wageless"),
      value: "wageless",
    },
  ];
  const personalInfoData2 = useMemo(() => {
    if (!oneData?.data) return [];

    return [
      { label: t("salary.process"), value: oneData.data.surgeries_count?.toString() || "0" },
      {
        label: t("staff.salary_type"),
        value:
          salaryType.find(item => item.value === oneData?.data.salary_type)?.label ||
          oneData?.data.salary_type ||
          "-",
      },
      {
        label: t("staff.salary_value"),
        value: oneData.data.salary?.value ? formatSalary(oneData.data.salary.value) : "-",
      },
      {
        label: t("salary.due"),
        value: oneData.data.salary?.due ? formatSalary(oneData.data.salary.due) : "-",
      },
      {
        label: t("salary.arrival"),
        value: oneData.data.salary?.paid ? formatSalary(oneData.data.salary.paid) : "-",
      },
      {
        label: t("salary.rest"),
        value: oneData.data.salary?.remaining ? formatSalary(oneData.data.salary.remaining) : "-",
      },
      {
        label: t("salary.transportation"),
        value: oneData.data.transportation_expenses
          ? formatSalary(oneData.data.transportation_expenses)
          : "-",
      },
    ];
  }, [oneData, t]);

  const personalInfoData3 = useMemo(() => {
    if (!oneData?.data) return [];

    return [
      { label: t("salary.vacation"), value: oneData.data.holidays_num?.toString() || "0" },
      { label: t("salary.operations"), value: oneData.data.delayed_operations?.toString() || "0" },
      {
        label: t("salary.evaluation"),
        value: oneData.data.rate ? `${oneData.data.rate}/10` : "-",
      },
      {
        label: t("salary.fine"),
        value: oneData.data.fines ? formatSalary(oneData.data.fines) : "0 د.ع",
      },
    ];
  }, [oneData, t]);

  const personalInfoData4 = useMemo(() => {
    if (!oneData?.data) return [];

    return [
      {
        label: t("staff.hire-date"),
        value: oneData.data.appointment_date
          ? formatDateOrTime({ input: oneData.data.appointment_date, type: "date" })
          : "-",
      },
      {
        label: t("staff.start-date"),
        value: oneData.data.start_date
          ? formatDateOrTime({ input: oneData.data.start_date, type: "date" })
          : "-",
      },
      {
        label: t("salary.go"),
        value: oneData.data.went_date
          ? formatDateOrTime({ input: oneData.data.went_date, type: "date" })
          : "-",
      },
      {
        label: t("salary.back"),
        value: oneData.data.back_date
          ? formatDateOrTime({ input: oneData.data.back_date, type: "date" })
          : "-",
      },
      { label: t("login.userName"), value: oneData.data.username || "-" },
      { label: t("permissions.permission"), value: oneData.data.role?.name || "-" },
    ];
  }, [oneData, t]);
  const handleDelete = row => {
    setDeleteModalState({
      isOpen: true,
      type: "assistant",
      selectedId: id,
      isSending: false,
    });
  };

  const columns2 = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "#",
        enableColumnFilter: true,
      },

      {
        accessorKey: "name",
        header: t("employee.file"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "date",
        header: t("booking.date-time"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          const datePart = row.original?.date?.split("T")[0];
          const timePart = row.original?.date?.split("T")[1];
          const timeOnly = timePart.split(".")[0];

          return (
            <div className="flex flex-col">
              <span>{datePart}</span>
              <span className="text-accent">{timeOnly}</span>
            </div>
          );
        },
      },
    ],
    []
  );

  const rowData2 = useMemo(
    () =>
      oneData?.data?.attachments?.map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        date: item.created_at,
      })) || [],
    [oneData?.data]
  );
  const handleEdit1 = row => navigate(`/staff/deduction/${row.id}`);
  const handleShow1 = row => navigate(`/staff/deduction/${row.id}?show=true`);
  const handleDelete1 = row => {
    setDeleteModalState({
      isOpen: true,
      type: "deduction",
      selectedId: row.id,
      isSending: false,
    });
  };

  const extraActions1 = row => {
    const menuItems = [
      {
        label: t("common.display"),
        icon: <img src={show} alt="show" />,
        onClick: () => handleShow1(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Punishment,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit1(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Punishment,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete1(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Punishment,
          type: PERMISSION_ACTION.delete,
        }),
      },
    ];
    return (
      <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />
    );
  };
  const handleEdit2 = row => navigate(`/staff/bonus/${row.id}`);
  const handleShow2 = row => navigate(`/staff/bonus/${row.id}?show=true`);
  const handleDelete2 = row => {
    setDeleteModalState({
      isOpen: true,
      type: "reward",
      selectedId: row.id,
      isSending: false,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteModalState(prev => ({ ...prev, isSending: true }));

      let response;

      switch (deleteModalState.type) {
        case "employee":
          response = await apis.deleteApi({ id: deleteModalState.selectedId });
          showSuccess(response?.data?.message);
          navigate(-1);
          break;

        case "reward":
          response = await apisRewards.deleteApi({ id: deleteModalState.selectedId });
          showSuccess(response?.data?.message);
          refetchBonus();
          break;

        case "deduction":
          response = await apisDeduction.deleteApi({ id: deleteModalState.selectedId });
          showSuccess(response?.data?.message);
          refetchDeduction();
          break;

        default:
          break;
      }

      // Close modal
      setDeleteModalState({
        isOpen: false,
        type: null,
        selectedId: null,
        isSending: false,
      });
    } catch (error) {
      handleBackendErrors({ error });
      setDeleteModalState(prev => ({ ...prev, isSending: false }));
    }
  };

  const handleCloseModal = () => {
    setDeleteModalState({
      isOpen: false,
      type: null,
      selectedId: null,
      isSending: false,
    });
  };

  const extraActions2 = row => {
    const menuItems = [
      {
        label: t("common.display"),
        icon: <img src={show} alt="show" />,
        onClick: () => handleShow2(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Reward,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit2(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Reward,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete2(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Reward,
          type: PERMISSION_ACTION.delete,
        }),
      },
    ];
    return (
      <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />
    );
  };
  return (
    <div>
      {" "}
      <BreadCrumb
        isAdd
        title={t("physician-assistant.details2")}
        link="/physician-assistant"
        hideBrimaryButton={
          !hasPermissionFunction({
            group: PERMISSION_GROUP.Employee,
            type: PERMISSION_ACTION.update,
          })
        }
        customSection={
          <div className="flex items-center gap-4">
            <Can group={PERMISSION_GROUP.Employee} type={PERMISSION_ACTION.update}>
              <PrimaryButton
                text={t("employee.update")}
                otherStyle={"!px-10 !py-3"}
                onClick={() => navigate(`/staff/physician-assistant/${id}`)}
              />
            </Can>

            <DropdownMenu
              items={[
                {
                  label: t("employee.password"),
                  icon: <img src={lock} alt="password" />,
                  onClick: () => setIsChangePasswordModalOpen(true),
                },
                {
                  label: t("employee.delete"),
                  icon: <img src={deleteIcon} alt="delete" />,
                  onClick: () => handleDelete(id),
                  show: hasPermissionFunction({
                    group: PERMISSION_GROUP.Employee,
                    type: PERMISSION_ACTION.delete,
                  }),
                },
              ]}
            />
          </div>
        }
      />
      {isLoadingData ? (
        <div className="flex justify-center items-center">
          <LoadingElement color="#29b4c3" />
        </div>
      ) : (
        <Card otherStyle={"mb-8 !py-8 !px-6"}>
          {/* Section 1: Basic Information */}
          <div className="mb-6">
            <h3 className="font-main text-primary text-[1rem] font-semibold mb-4 pb-2 border-b border-gray-200">
              {t("staff.basic-info")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {personalInfoData1.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-accent/30"
                >
                  <p className="font-main text-accent text-[0.7rem] font-medium mb-2 uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="font-main text-gray-800 text-[0.95rem] font-semibold break-words">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Salary & Financial Information */}
          <div className="mb-6">
            <h3 className="font-main text-primary text-[1rem] font-semibold mb-4 pb-2 border-b border-gray-200">
              {t("salary.financial-info")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {personalInfoData2.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-300 hover:border-primary/30"
                >
                  <p className="font-main text-primary text-[0.7rem] font-medium mb-2 uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="font-main text-gray-800 text-[0.95rem] font-semibold break-words">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Performance & Statistics */}
          <div className="mb-6">
            <h3 className="font-main text-primary text-[1rem] font-semibold mb-4 pb-2 border-b border-gray-200">
              {t("salary.performance-stats")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {personalInfoData3.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-green-50 to-white p-4 rounded-lg border border-green-100 hover:shadow-md transition-all duration-300 hover:border-accent/30"
                >
                  <p className="font-main text-accent text-[0.7rem] font-medium mb-2 uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="font-main text-gray-800 text-[0.95rem] font-semibold break-words">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Dates & Permissions */}
          <div>
            <h3 className="font-main text-primary text-[1rem] font-semibold mb-4 pb-2 border-b border-gray-200">
              {t("staff.dates-permissions")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {personalInfoData4.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-lg border border-purple-100 hover:shadow-md transition-all duration-300 hover:border-primary/30"
                >
                  <p className="font-main text-primary text-[0.7rem] font-medium mb-2 uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="font-main text-gray-800 text-[0.95rem] font-semibold break-words">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
      <p className="text-primary font-main text-[1rem] mb-4">{t("employee.attachment")}</p>
      <Table
        data={rowData2 || []}
        columns={columns2}
        pageSize={state.pageSize}
        pageIndex={state.pageIndex}
        totalPages={oneData?.meta?.last_page}
        onPageSizeChange={handlePageSizeChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onGotoPage={handleGotoPage}
        permissionGroup={Permissions.EMPLOYEES}
        hasSearch={true}
        onShow={handleShow}
        searchValue={state.searchValue}
        onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
        searchPlaceholder={t("common.searchPlaceholder")}
        hasColumnFilters={false}
        isLoading={false}
        useFullHeight={true}
        hasStickyBreadcrumb={true}
        hideFilter
      />
      <div className="flex justify-between items-center">
        <p className="font-main text-[1.25rem] py-6 text-primary">{t("employee.register")}</p>
        <Can group={PERMISSION_GROUP.Reward} type={PERMISSION_ACTION.create}>
          <BorderedButton
            text={t("employee.add-reward")}
            border={"border border-primary"}
            textColor={"text-primary"}
            onClick={() =>
              navigate(
                `/staff/bonus/add?employee_id=${id}&employee_name=${encodeURIComponent(
                  oneData?.data?.full_name || ""
                )}`
              )
            }
          />
        </Can>
      </div>
      <Table
        data={rowData}
        columns={columns}
        pageSize={state.pageSize}
        pageIndex={state.pageIndex}
        totalPages={rewardData?.meta?.last_page}
        onPageSizeChange={handlePageSizeChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onGotoPage={handleGotoPage}
        permissionGroup={Permissions.EMPLOYEES}
        hasSearch={true}
        searchValue={state.searchValue}
        onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
        searchPlaceholder={t("common.searchPlaceholder")}
        hasColumnFilters={false}
        isLoading={isLoadingReward}
        useFullHeight={true}
        hasStickyBreadcrumb={true}
        hideFilter
        customHeight="min-h-[300px] h-full"
        extraActions={extraActions2}
        onShow={handleShow2}
        onEdit={handleEdit2}
      />
      <div className="flex justify-between items-center">
        <p className="font-main text-[1.25rem] py-6 text-primary">{t("employee.deduction")}</p>
        <Can group={PERMISSION_GROUP.Punishment} type={PERMISSION_ACTION.create}>
          <BorderedButton
            text={t("employee.add-deduction")}
            border={"border border-primary"}
            textColor={"text-primary"}
            onClick={() =>
              navigate(
                `/staff/deduction/add?employee_id=${id}&employee_name=${encodeURIComponent(
                  oneData?.data?.full_name || ""
                )}`
              )
            }
          />
        </Can>
      </div>
      <Table
        data={rowData1}
        columns={columns3}
        pageSize={state.pageSize}
        pageIndex={state.pageIndex}
        totalPages={deductionData?.meta?.last_page}
        onPageSizeChange={handlePageSizeChange}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onGotoPage={handleGotoPage}
        hasSearch={true}
        searchValue={state.searchValue}
        onSearchChange={val => dispatch({ type: branchesActions.searchValue, payload: val })}
        searchPlaceholder={t("common.searchPlaceholder")}
        hasColumnFilters={false}
        isLoading={isLoading}
        useFullHeight={true}
        hasStickyBreadcrumb={true}
        hideFilter
        customHeight="min-h-[300px] h-full"
        extraActions={extraActions1}
        permissionGroup={Permissions.EMPLOYEES}
        onShow={handleShow1}
        onEdit={handleEdit1}
      />
      {deleteModalState.isOpen && (
        <DeleteModal
          isOpen={deleteModalState.isOpen}
          onClose={handleCloseModal}
          onDelete={handleConfirmDelete}
          title={t("common.delete")}
          warning={t("delayed.warning")}
          deleteText={t("common.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={deleteModalState.isSending}
        />
      )}
      {isChangePasswordModalOpen && (
        <PasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
          userId={id}
        />
      )}
    </div>
  );
}

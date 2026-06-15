import { useTranslation } from "react-i18next";
import { Table } from "../table";
import {
  formatDateOrTime,
  getUserData,
  handleBackendErrors,
  hasBondPermission,
  hasPermissionFunction,
  isSuperAdmin,
  Permissions,
} from "@/utils/helpers";
import { BondStatus, BondTypes, PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { useEffect, useMemo, useState } from "react";
import useBookingBondTypes from "@/hooks/useBookingTypes";
import { branchesActions } from "@/reducers/branches";
import RenderStatus from "@/components/statusBondButton";
import { useNavigate } from "react-router-dom";
import { showSuccess } from "@/libs/react.toastify";
import { apis } from "@/apis/bonds/api";
import edit from "@assets/svgs/common/edit-menu.svg";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import QICARDICON from "@/assets/svgs/qi card.svg";
import Approve from "@assets/svgs/hair-care/tick-circle.svg";
import printer from "@assets/svgs/common/printer.svg";
import DropdownMenu from "../shared/dropdownMenu";
import SelectField from "../shared/select";
import ControlledTimeField from "../shared/controlledDatePicker";
import useEmployees from "@/hooks/useEmployess";
import useFinencar from "@/hooks/useFinencar";
import { usePatientsQueries } from "@/apis/patients/query";

const VoucherTable = ({
  data,
  reset,
  dispatch,
  state,
  setSelectedQiCardRow,
  setQiCardModalOpen,
  refetch,
  isLoading,
  control,
  showQICardOprion = false,
}) => {
  const { t } = useTranslation();
  const [isUserSuperAdmin, setUserSuperAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData?.user || null);
    setUserSuperAdmin(isSuperAdmin());
  }, []);

  const { bookingBondTypes } = useBookingBondTypes();
  const navigate = useNavigate();

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

  const { data: patientData, isLoading: isLoadingPatient } = usePatientsQueries.GetAll({
    page: null,
    per_page: null,
    city_id: null,
    target: null,
    search: null,
  });

  const { isLoadingEmployees: isLoadingEmployees2, items: employees2 } = useEmployees({});
  const { isLoadingFinencar: isLoadingFinancer, items: financer } = useFinencar({});

  const patientOptions = useMemo(
    () =>
      patientData?.data?.map(role => ({
        label: role.full_name,
        value: role.id,
      })) || [],
    [patientData?.data]
  );

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        no: bookingBondTypes?.find(_val => _val?.value === item?.bond_group)?.label || "-",
        account: item.cashier?.name || "-",
        total: item.final_total ? item.final_total + " " + t("code") : "-",
        date: formatDateOrTime({ input: item.date, type: "date" }),
        notes: item.notes || "-",
        description: item.description || "-",
        paying_type: item.booking?.paying_type || "-",
        patient_id: item.patient?.full_name || "-",
        employee_id: item?.user?.full_name || "-",
        financier_id: item.financier?.full_name || "-",
        related_to_bill: item.related_to_bill,
        status: BondStatus[item.status]?.value,
        bond_group: bookingBondTypes?.find(_val => _val?.value === item?.bond_group),
      })) || [],
    // eslint-disable-next-line comma-dangle
    [data?.data]
  );

  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "id_show",
        header: "#",
        enableColumnFilter: true,
      },
      {
        accessorKey: "no",
        header: t("voucher.type"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "account",
        header: t("voucher.account"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "total",
        header: t("voucher.total_x"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "date",
        header: t("delayed.date"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "notes",
        header: t("voucher.statue"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "description",
        header: t("common.notes"),
        enableColumnFilter: true,
      },
    ];

    if (
      hasPermissionFunction({ group: PERMISSION_GROUP.BOOKING_BOND, type: PERMISSION_ACTION.index })
    ) {
      baseColumns.push({
        accessorKey: "patient_id",
        header: t("complaints.patient-name"),
        enableColumnFilter: true,
      });
    }

    if (
      hasPermissionFunction({
        group: PERMISSION_GROUP.FINANCIER_BOND,
        type: PERMISSION_ACTION.index,
      })
    ) {
      baseColumns.push({
        accessorKey: "financier_id",
        header: t("print.sponsor"),
        enableColumnFilter: true,
      });
    }

    if (
      hasPermissionFunction({ group: PERMISSION_GROUP.SALARY_BOND, type: PERMISSION_ACTION.index })
    ) {
      baseColumns.push({
        accessorKey: "employee_id",
        header: t("sidebar.staff"),
        enableColumnFilter: true,
      });
    }
    baseColumns.push({
      accessorKey: "status",
      header: t("booking.status"),
      cell: ({ row }) => RenderStatus(row.original.status),
    });

    return baseColumns;
  }, [t]);

  const handleEdit = row => {
    navigate(`/accounts/vouchers/${row.id}`, { state: row.bond_group });
  };
  const handleShow = row => {
    navigate(`/accounts/vouchers/${row.id}?show=true`, { state: row.bond_group });
  };

  const handleDelete = row => {
    dispatch({ type: branchesActions.openDeleteModal, payload: true });
    dispatch({ type: branchesActions.isDeleteModalOpen, payload: true });
    dispatch({ type: branchesActions.selectedId, payload: row.id });
  };
  const handlePrint = row => navigate(`/accounts/vouchers/bond-invoice/${row.id}`);

  const handleQiCardClick = row => {
    setSelectedQiCardRow(row);
    setQiCardModalOpen(true);
  };
  const handelApprove = async id => {
    try {
      dispatch({ type: branchesActions.isSending, payload: true });
      const response = await apis.approve({ id });
      dispatch({ type: branchesActions.isSending, payload: false });
      showSuccess(response?.data?.message);
      refetch();
    } catch (error) {
      handleBackendErrors({ error: error });
      dispatch({ type: branchesActions.isSending, payload: false });
    }
  };

  const extraActions = row => {
    const bondGroup = row.bond_group?.value;

    const menuItems = [
      {
        label: t("common.display"),
        icon: <img src={show} alt="show" />,
        onClick: () => handleShow(row),
        show: hasBondPermission(bondGroup, "view"),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show:
          !row.related_to_bill &&
          row.status !== "approved" &&
          row.status !== "paid" &&
          hasBondPermission(bondGroup, "edit"),
      },
      {
        label: t("voucher.approve"),
        icon: <img src={Approve} alt="approve" />,
        onClick: () => handelApprove(row.id),
        show: row.status === "pending" && hasBondPermission(bondGroup, "approve"),
      },
      {
        label: t("print-voucher"),
        icon: <img src={printer} alt="printer" />,
        onClick: () => handlePrint(row),
        show: true,
      },
      {
        label: t("common.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: !row.related_to_bill && hasBondPermission(bondGroup, "delete"),
      },
      {
        label: "Qi Card",
        icon: <img src={QICARDICON} alt="Qi card" />,
        onClick: () => handleQiCardClick(row),
        show:
          bondGroup === BondTypes.booking.value &&
          row.status === "approved" &&
          row.paying_type === "installment" &&
          hasBondPermission(bondGroup, "pay") &&
          showQICardOprion,
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

  const { bookingBondTypes: bondTypes } = useBookingBondTypes();

  const filterItems = useMemo(() => {
    try {
      const baseFilterItems = [
        {
          id: 1,
          component: (
            <div>
              <SelectField
                name="type"
                control={control}
                options={bookingBondTypes}
                placeholder={t("voucher.voucher")}
              />
            </div>
          ),
        },
        {
          id: 10,
          component: (
            <div>
              <ControlledTimeField
                name="date_from"
                control={control}
                placeholder={t("holiday.startDate")}
              />
            </div>
          ),
        },
        {
          id: 2,
          component: (
            <div>
              <ControlledTimeField
                name="date_to"
                control={control}
                placeholder={t("holiday.endDate")}
              />
            </div>
          ),
        },
      ];

      if (
        hasPermissionFunction({
          group: PERMISSION_GROUP.BOOKING_BOND,
          type: PERMISSION_ACTION.index,
        })
      ) {
        baseFilterItems.push({
          id: 3,
          component: (
            <div className="w-[300px]">
              <SelectField
                name="patient_id"
                control={control}
                options={patientOptions}
                placeholder={t("complaints.patient-name")}
                isLoading={isLoadingPatient}
              />
            </div>
          ),
        });
      }

      if (
        hasPermissionFunction({
          group: PERMISSION_GROUP.SALARY_BOND,
          type: PERMISSION_ACTION.index,
        })
      ) {
        baseFilterItems.push({
          id: 6,
          showOnlyForNonEmployees: true,
          component: (
            <div className="w-[300px]">
              <SelectField
                name="employee_id"
                control={control}
                options={employees2}
                placeholder={t("sidebar.staff")}
                loading={isLoadingEmployees2}
              />
            </div>
          ),
        });
      }

      if (
        hasPermissionFunction({
          group: PERMISSION_GROUP.FINANCIER_BOND,
          type: PERMISSION_ACTION.index,
        })
      ) {
        baseFilterItems.push({
          id: 5,
          showOnlyForNonEmployees: true,
          component: (
            <div className="w-[300px]">
              <SelectField
                name="financier_id"
                control={control}
                options={financer}
                placeholder={t("print.sponsor")}
                loading={isLoadingFinancer}
              />
            </div>
          ),
        });
      }

      return baseFilterItems;
    } catch (error) {
      console.log("erwe", error);
    }
  }, [
    t,
    bondTypes,
    control,
    patientOptions,
    isLoadingPatient,
    employees2,
    isLoadingEmployees2,
    financer,
    isLoadingFinancer,
  ]);

  return (
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
      isLoading={isLoading}
      useFullHeight={true}
      hasStickyBreadcrumb={true}
      extraActions={extraActions}
      onResetFilters={onResetFilter}
      filterElements={filterItems}
    />
  );
};

export default VoucherTable;

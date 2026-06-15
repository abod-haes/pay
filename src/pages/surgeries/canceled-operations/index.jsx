/* eslint-disable complexity */
import React, { useMemo, useReducer } from "react";
import { complaintsActions, initialValues, complaintsReducer } from "@/reducers/complaints";
import { Table } from "@/components/table";
import BreadCrumb from "@/components/breadcrumb";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { encryptId, Permissions, truncateText } from "@/utils/helpers";
import borderIcon from "@assets/svgs/common/bordered-eye.svg";
import NameCell from "@/components/namecellLink";
import DateUnderTime from "@/components/dateUnderTime";
import { useHairTransplantQueries } from "@/apis/booking/hair-transplant/query";
import { branchesActions, branchesReducer } from "@/reducers/branches";
import { BookingStatus } from "@/constants/constants";
import { Can } from "@/components/shared/can/can";
import { PERMISSION_GROUP, PERMISSION_ACTION } from "@/constants/constants";
import { hasPermissionFunction } from "@/utils/helpers";
import RenderStatus from "@/components/reservationButton";
export default function CanceledOperations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);

  const { data, isLoading } = useHairTransplantQueries.GetAll({
    page: state.pageIndex,
    per_page: state.pageSize,
    search: state.searchValue ? state.searchValue : null,
    status: "cancel",
  });

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + state.pageIndex,
        name: truncateText({ text: item.patient?.full_name, maxLength: 20 }),
        service: truncateText({ text: item.service?.name, maxLength: 5 }),
        phoneNumber: item.patient?.first_phone_number,
        date: item.date?.split(" ")[0],
        cancel_date: item?.cancel_date?.split(" ")[0],
        cancel_time: item?.cancel_date?.split(" ")[1],
        time: item.date?.split(" ")[1],
        status: item.booking_status,
        service_id: item.service_id,
        type: item?.service?.type,
        patient_id: item?.patient.id,
      })) || [],
    [data?.data]
  );

  const handlePageSizeChange = newPageSize => {
    dispatch({ type: branchesActions.pageSize, payload: newPageSize });
  };

  const handlePreviousPage = () => {
    dispatch({ type: branchesActions.pageIndex, payload: Math.max(0, state.pageIndex - 1) });
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
      {
        accessorKey: "name",
        header: t("surgeries.patient"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          const hasPermission = hasPermissionFunction({
            group: PERMISSION_GROUP.Patient,
            type: PERMISSION_ACTION.index,
          });

          if (hasPermission) {
            return (
              <NameCell
                text={row.original.name}
                to={`/patient-details/${encryptId(String(row.original.patient_id))}`}
              />
            );
          } else {
            return <span>{row.original.name}</span>;
          }
        },
      },
      {
        accessorKey: "phoneNumber",
        header: t("common.phone-number"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "service",
        header: t("surgeries.surgery-type"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "date",
        header: t("common.date-and-time"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          return <DateUnderTime date={row.original.date} time={row.original.time} />;
        },
      },
      {
        accessorKey: "cancel_date",
        header: t("surgeries.cancel-date"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          return <DateUnderTime date={row.original.date} time={row.original.cancel_time} />;
        },
      },
      {
        accessorKey: "statue",
        header: t("complaints.statue"),
        enableColumnFilter: true,
        cell: ({ row }) => RenderStatus(row.original.status),
      },
    ],
    []
  );

  const extraActions = row => {
    return (
      <Can group={PERMISSION_GROUP.HairTransplant} type={PERMISSION_ACTION.index}>
        <img
          src={borderIcon}
          alt="borderIcon"
          className="cursor-pointer"
          onClick={() => {
            if (!row.type.includes("eyebrow_transplant")) {
              navigate(
                `/surgeries/operation-bookings/hair-transplant-details/${encryptId(row.id)}`
              );
            } else {
              navigate(
                `/surgeries/operation-bookings/eyebrow-transplant-details/${encryptId(row.id)}`
              );
            }
          }}
        />
      </Can>
    );
  };

  return (
    <div>
      <BreadCrumb
        title={t("sidebar.canceled-operations")}
        sticky={true}
        customSection={<></>}
        stickyTop="70px"
        isAdd={false}
        hideBrimaryButton
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
        permissionGroup={Permissions.SALARY}
        hasSearch={true}
        searchValue={state.searchValue}
        onSearchChange={val => dispatch({ type: complaintsActions.searchValue, payload: val })}
        searchPlaceholder={t("common.searchPlaceholder")}
        hasColumnFilters={false}
        isLoading={isLoading}
        useFullHeight={true}
        hideFilter
        hasStickyBreadcrumb={true}
        extraActions={extraActions}
      />
    </div>
  );
}

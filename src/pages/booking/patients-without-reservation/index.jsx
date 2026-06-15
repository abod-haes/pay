/* eslint-disable indent */
/* eslint-disable complexity */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import BreadCrumb from "@/components/breadcrumb";
import Table from "@/components/table/table";
import { branchesActions, initialValues, branchesReducer } from "@/reducers/branches";
import { useMemo, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { encryptId, formatTimeToSHow, Permissions, truncateText } from "@/utils/helpers";
import borderIcon from "@assets/svgs/common/bordered-eye.svg";
import DateUnderTime from "@/components/dateUnderTime";
import NameCell from "@/components/namecellLink";
import { useGeneralBookingQueries } from "@/apis/booking/general-booking/query";
import { useForm } from "react-hook-form";
import useServices from "@/hooks/useServises";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import SelectField from "@/components/shared/select";
import useEmployees from "@/hooks/useEmployess";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import { Can } from "@/components/shared/can/can";
import useBookingSections from "@/hooks/useBookingSection";
import { hasPermissionFunction } from "@/utils/helpers";
import { useHairTransplantQueries } from "@/apis/booking/hair-transplant/query";

const Booking = () => {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(branchesReducer, initialValues);
  const navigate = useNavigate();
  const { control, watch, reset } = useForm({
    defaultValues: { technician_id: null, employee_id: null, service_id: null, date: null },
  });

  const { isLoadingEmployees, items } = useEmployees({ type: "technician" });
  const { isLoadingEmployees: isLoadingTechnch, items: employee } = useEmployees({
    type: "employee",
  });

  const { data, isLoading } = useHairTransplantQueries.GetAll({
    page: state.pageIndex,
    per_page: state.pageSize,
    search: state.searchValue ? state.searchValue : null,
    service_id: watch("service_id")?.value,
    employee_id: watch("employee_id")?.value,
    technician_id: watch("technician_id")?.value,
    date: watch("date"),
    status: "done",
  });

  const { bookingVia } = useBookingSections();

  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        patient: truncateText({ text: item.patient?.full_name, maxLength: 20 }),
        patient_id: item?.patient?.id,
        phone_number1: item?.patient?.first_phone_number,
        phone_number2: item?.patient?.second_phone_number || "-",
        service: item?.service?.name,
        admin_name: item?.employee?.full_name || "-",
        "t-name": item.technician?.full_name || "-",
        type: item?.service?.type,
        date: item?.date?.split(" ")[0],
        time: formatTimeToSHow(item.date?.split(" ")[1], i18n),
        "type-of-agriculture": bookingVia?.find(s => s.value === item?.section)?.label,
      })) || [],
    [data?.data],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "id_show",
        header: "#",
        enableColumnFilter: true,
      },
      {
        accessorKey: "patient",
        header: t("booking.patient"),
        enableColumnFilter: true,
        cell: ({ row }) => {
          const hasPermission = hasPermissionFunction({
            group: PERMISSION_GROUP.Patient,
            type: PERMISSION_ACTION.index,
          });

          if (hasPermission) {
            return (
              <NameCell
                text={row.original.patient}
                to={`/patient-details/${encryptId(String(row.original.patient_id))}`}
              />
            );
          } else {
            return <span>{row.original.patient}</span>;
          }
        },
      },
      {
        accessorKey: "phone_number1",
        header: t("surgeries.phone-number"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "phone_number2",
        header: t("surgeries.phone-number2"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "type-of-agriculture",
        header: t("booking.type-of-agriculture"),
      },
      { accessorKey: "service", header: t("booking.service") },
      {
        accessorKey: "dateTime",
        header: t("booking.date-time"),
        cell: ({ row }) => <DateUnderTime date={row.original.date} time={row.original.time} />,
      },
      { accessorKey: "admin_name", header: t("surgeries.admin-name") },
      {
        accessorKey: "t-name",
        header: t("complaints.t-name"),
      },
    ],
    [t],
  );

  // ✅ Handlers
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

  // const handleEdit = row => navigate(`/booking/implanted-patients/${encryptId(row.id)}`);
  const handleEdit = row => {
    // if (row.type === "other") {
    navigate(`/booking/reservation-patients/${encryptId(row.id)}`);
    // } else {
    //   if (!row.type.includes("eyebrow_transplant")) {
    //     navigate(`/surgeries/operation-bookings/hair-transplant/${encryptId(row.id)}`);
    //   } else {
    //     navigate(`/surgeries/operation-bookings/eyebrow-transplant/${encryptId(row.id)}`);
    //   }
    // }
  };

  const handleDelete = row => {
    dispatch({ type: branchesActions.openDeleteModal, payload: true });
    dispatch({ type: branchesActions.selectedId, payload: row.id });
  };
  // const handleShow = row => navigate(`/booking/general-booking-details/${encryptId(row.id)}`);
  const handleShow = row => {
    // if (row.type === "other") {
    navigate(`/booking/general-booking-details/${encryptId(row.id)}`, {
      state: "reservation-patients",
    });
    // } else {
    //   if (!row.type.includes("eyebrow_transplant")) {
    //     navigate(`/surgeries/operation-bookings/hair-transplant-details/${encryptId(row.id)}`);
    //   } else {
    //     navigate(`/surgeries/operation-bookings/eyebrow-transplant-details/${encryptId(row.id)}`);
    //   }
    // }
  };

  const extraActions = row => {
    return (
      <Can group={PERMISSION_GROUP.Booking} type={PERMISSION_ACTION.index}>
        <img
          src={borderIcon}
          alt="borderIcon"
          className="cursor-pointer"
          onClick={() =>
            // navigate(`/surgeries/operation-bookings/eyebrow-transplant-details/${encryptId(row.id)}`)
            {
              if (!row.type.includes("eyebrow_transplant")) {
                navigate(
                  `/surgeries/operation-bookings/hair-transplant-details/${encryptId(row.id)}`,
                );
              } else {
                navigate(
                  `/surgeries/operation-bookings/eyebrow-transplant-details/${encryptId(row.id)}`,
                );
              }
            }
          }
        />
      </Can>
    );
  };

  const { services, isLoadingServices } = useServices({});
  const filterdService = services?.filter(item => item.type !== "other");

  const onResetFilter = () => {
    reset();
    dispatch({ type: branchesActions.pageIndex, payload: 1 });
  };

  const filterItems = [
    {
      id: 1,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="service_id"
            control={control}
            options={filterdService}
            loading={isLoadingServices}
            placeholder={t("booking.service")}
          />
        </div>
      ),
    },
    {
      id: 3,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="employee_id"
            control={control}
            options={employee}
            loading={isLoadingEmployees}
            placeholder={t("common.admin")}
          />
        </div>
      ),
    },
    {
      id: 3,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="technician_id"
            control={control}
            loading={isLoadingTechnch}
            options={items}
            placeholder={t("staff.Tunisian")}
          />
        </div>
      ),
    },
    {
      id: 4,
      component: (
        <div className="w-[300px]">
          <ControlledTimeField name="date" placeholder={t("delayed.date")} control={control} />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* <Can group={PERMISSION_GROUP.Booking} type={PERMISSION_ACTION.create}> */}
      <BreadCrumb
        title={t("sidebar.implanted-patients")}
        link={"/booking/patients-without-reservation"}
        onClick={() => navigate("/booking/patients-without-reservation/add")}
        buttonText={t("booking.add-booking")}
        isAdd
        hideBrimaryButton
        showArrow={false}
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
        permissionGroup={PERMISSION_GROUP.Booking}
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
    </div>
  );
};

export default Booking;

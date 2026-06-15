/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useReducer, useState } from "react";
import { Table } from "@/components/table";
import BreadCrumb from "@/components/breadcrumb";
import { useTranslation } from "react-i18next";
import { patientActions, initialValues, patientReducer } from "@/reducers/patient-archive";
import { useNavigate } from "react-router-dom";
import {
  encryptId,
  formatDate,
  handleBackendErrors,
  hasPermissionFunction,
  truncateText,
} from "@/utils/helpers";
import show from "@assets/svgs/common/eye-menu.svg";
import deleteIcon from "@assets/svgs/table/trash.svg";
import DropdownMenu from "@/components/shared/dropdownMenu";
import edit from "@assets/svgs/common/edit-menu.svg";
import DeleteModal from "@/components/shared/modals/deleteModal";
import ReasonForNotBookingModal from "@/components/shared/modals/reasonForNotBookingModal";
import { usePatientsQueries } from "@/apis/patients/query";
import { useForm } from "react-hook-form";
import { branchesActions } from "@/reducers/branches";
import { apis } from "@/apis/patients/api";
import { showSuccess } from "@/libs/react.toastify";
import { PERMISSION_ACTION, PERMISSION_GROUP } from "@/constants/constants";
import useCities from "@/hooks/useCities";
import SelectField from "@/components/shared/select";
import usePatientStatus from "@/hooks/usePatientStatus";
import useStates from "@/hooks/useStates";
import ControlledTimeField from "@/components/shared/controlledDatePicker";
import useEmployees from "@/hooks/useEmployess";
import { useReasonQueries } from "@/apis/reason/query";
import ExcelImage from "@assets/svgs/common/excel-file.png";
import { Can } from "@/components/shared/can/can";

export default function PatientArchive() {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(patientReducer, initialValues);
  const navigate = useNavigate();
  const userInfo = localStorage.getItem("authData");
  const parseUserData = JSON.parse(userInfo);
  const isEmployee = parseUserData?.user?.type === "employee";
  const { patientStatus } = usePatientStatus();
  const [isExporting, setIsExporting] = useState(false);
  const { control, watch, reset } = useForm({
    defaultValues: {
      salary: null,
      employee_id: null,
      city_id: null,
      country: null,
      gender: null,
      register_date: "",
      birth_date: "",
      reason_id: null,
    },
  });
  const { isLoadingCountries, items: states } = useStates();
  const { isLoadingStates, items } = useCities({ state_id: watch("country")?.value });
  const { isLoadingEmployees2, items: employees2 } = useEmployees({ type: "employee" });
  const { data, isLoading, refetch } = usePatientsQueries.GetAll({
    page: state.pageIndex,
    per_page: state.pageSize,
    search: state.searchValue,
    city_id: watch("city_id"),
    gender: watch("gender"),
    register_date: watch("register_date"),
    birth_date: watch("birth_date"),
    employee_id: watch("employee_id"),
    reason_id: watch("reason_id"),
  });

  const genderOptions = [
    { value: "male", label: "ذكر" },
    { value: "female", label: "أنثى" },
  ];
  const getTranslatedStatus = status => {
    switch (status) {
      case "pending":
        return t("patient_status.pending");
      case "active":
        return t("patient_status.active");
      case "booked":
        return t("patient_status.booked");
      default:
        return status;
    }
  };
  const { data: reasonData, isLoading: isLoadingReasons } = useReasonQueries.GetAll({});

  const reasonOptions = useMemo(
    () =>
      reasonData?.data?.map(item => ({
        label: item.title,
        value: item.id,
      })) || [],
    [reasonData?.data],
  );
  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        id_show: index + 1 + (state.pageIndex - 1) * state.pageSize,
        name: truncateText({ text: item.full_name, maxLength: 20 }),
        city: truncateText({ text: item?.city?.name, maxLength: 20 }),
        country: truncateText({ text: item?.state?.name, maxLength: 20 }),
        region: truncateText({ text: item.address, maxLength: 20 }) || "-",
        phone: item?.second_phone_number || "-",
        number: item?.first_phone_number || "-",
        gender: genderOptions?.find(_item => _item?.value.includes(item?.gender))?.label,
        patient_status: patientStatus?.find(s => s.value === item?.section)?.label || "-",
        birthday: formatDate(item.birth_date, "date") || "-",
        // first_phone_number_country_code: item?.first_phone_number_country_code,
        // second_phone_number_country_code: item?.second_phone_number_country_code,
        admin: item?.employee?.full_name || "---",
        status: getTranslatedStatus(item.status),
        register_date: formatDate(item.register_date, "date"),
        reason_id: item?.reason?.id,
        reason: item?.reason?.name,
      })) || [],
    [data?.data],
  );

  // ✅ Handlers
  const handlePageSizeChange = newPageSize => {
    dispatch({ type: patientActions.pageSize, payload: newPageSize });
  };

  const handlePreviousPage = () => {
    dispatch({ type: patientActions.pageIndex, payload: Math.max(0, state.pageIndex - 1) });
  };

  const handleNextPage = () => {
    dispatch({ type: patientActions.pageIndex, payload: state.pageIndex + 1 });
  };

  const handleGotoPage = page => {
    dispatch({ type: patientActions.pageIndex, payload: page });
  };

  const columns = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "id_show",
        header: "#",
        enableColumnFilter: true,
      },
      {
        accessorKey: "name",
        header: t("booking.patient"),
        enableColumnFilter: true,
      },
      // ADMIN COLUMN (conditionally removed later)
      {
        accessorKey: "admin",
        header: t("surgeries.admin-name"),
        enableColumnFilter: true,
        showOnlyForNonEmployees: true,
      },
      {
        accessorKey: "number",
        header: t("complaints.phone1"),
        enableColumnFilter: true,
        // cell: item => {
        //   const value = item.getValue();
        //   const rowData = item.row.original;
        //   return (
        //     <p
        //       style={{
        //         unicodeBidi: "plaintext",
        //         textAlign: i18n.language === "en" ? "left" : "right",
        //       }}
        //     >
        //       +{rowData.first_phone_number_country_code}
        //       {value}
        //     </p>
        //   );
        // },
      },
      {
        accessorKey: "phone",
        header: t("complaints.phone2"),
        enableColumnFilter: true,
        // cell: item => {
        //   const value = item.getValue();
        //   const rowData = item.row.original;
        //   if (!rowData.second_phone_number_country_code) return "---";

        //   return (
        //     <p
        //       style={{
        //         unicodeBidi: "plaintext",
        //         textAlign: i18n.language === "en" ? "left" : "right",
        //       }}
        //     >
        //       +{rowData.second_phone_number_country_code}
        //       {value}
        //     </p>
        //   );
        // },
      },
      {
        accessorKey: "birthday",
        header: t("delayed.birthday"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "register_date",
        header: t("patient.register_date"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "gender",
        header: t("delayed.gender"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "city",
        header: t("delayed.country"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "country",
        header: t("users.city"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "region",
        header: t("delayed.area"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "reason",
        header: t("common.reason"),
        enableColumnFilter: true,
      },
      {
        accessorKey: "status",
        header: t("common.patient_status"),
        enableColumnFilter: true,
      },
    ];

    // 🔥 remove admin column if isEmployee === true
    return baseColumns.filter(col => (col.showOnlyForNonEmployees ? !isEmployee : true));
  }, [isEmployee, i18n.language, t]);

  const handleShow = row => navigate(`/patient-details/${encryptId(row.id)}`);

  const handleDelete = row => {
    dispatch({ type: patientActions.openDeleteModal, payload: row });
    dispatch({ type: patientActions.selectedId, payload: row.id });
  };
  const handleEdit = row => navigate(`/patient/${encryptId(row.id)}`);

  const handleReasonModal = row => {
    dispatch({ type: patientActions.openReasonModal, payload: row });
  };

  const extraActions = row => {
    const menuItems = [
      {
        label: t("common.display"), // النص هنا
        icon: <img src={show} alt="show" />, // أيقونة فقط
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Patient,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: t("common.edit"),
        icon: <img src={edit} alt="edit" />,
        onClick: () => handleEdit(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Patient,
          type: PERMISSION_ACTION.update,
        }),
      },
      {
        label: t("patient.delete"),
        icon: <img src={deleteIcon} alt="delete" />,
        onClick: () => handleDelete(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Patient,
          type: PERMISSION_ACTION.delete,
        }),
      },
      {
        label: t("booking.reasons_for_not_booking"),
        icon: <img src={edit} alt="reason" />, // Using edit icon for now, or maybe a specific one if available
        onClick: () => handleReasonModal(row),
        show:
          row.reason_id === null &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Patient,
            type: PERMISSION_ACTION.update, // Assuming update permission is needed
          }),
      },
    ];
    return (
      <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />
    );
  };

  const handelDelete = async () => {
    try {
      dispatch({ type: branchesActions.isSending, payload: true });
      const response = await apis.deleteApi({ id: state.selectedId });
      dispatch({ type: branchesActions.closeDeleteModal });
      refetch();
      showSuccess(response?.data?.message);
      dispatch({ type: branchesActions.isSending, payload: false });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: branchesActions.isSending, payload: false });
    }
  };

  const handelCloseModal = () => {
    dispatch({ type: branchesActions.selectedId, payload: 0 });
    dispatch({ type: branchesActions.closeDeleteModal });
    dispatch({ type: branchesActions.isSending, payload: false });
  };

  const handleCloseReasonModal = () => {
    dispatch({ type: patientActions.closeReasonModal });
  };

  const handleSubmitReason = async payload => {
    try {
      dispatch({ type: patientActions.isSending, payload: true });
      const response = await apis.addReasonForNotBooking({
        id: state.reasonTarget?.id,
        payload,
      });
      dispatch({ type: patientActions.closeReasonModal });
      showSuccess(response?.data?.message);
      dispatch({ type: patientActions.isSending, payload: false });
    } catch (error) {
      handleBackendErrors({ error });
      dispatch({ type: patientActions.isSending, payload: false });
    }
  };

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
            name="country"
            control={control}
            options={states}
            placeholder={t("users.city")}
            loading={isLoadingCountries}
          />
        </div>
      ),
    },
    {
      id: 2,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="city_id"
            control={control}
            options={items}
            placeholder={t("delayed.country")}
            disabled={!watch("country")}
            loading={isLoadingStates}
          />
        </div>
      ),
    },
    {
      id: 3,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="gender"
            control={control}
            options={genderOptions}
            placeholder={t("delayed.gender")}
          />
        </div>
      ),
    },
    {
      id: 4,
      component: (
        <div className="w-[300px]">
          <ControlledTimeField
            name="register_date"
            control={control}
            placeholder={t("patient.register_date")}
          />
        </div>
      ),
    },
    {
      id: 5,
      component: (
        <div className="w-[300px]">
          <ControlledTimeField
            name="birth_date"
            control={control}
            placeholder={t("delayed.birthday")}
          />
        </div>
      ),
    },
    {
      id: 6,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="reason_id"
            control={control}
            options={reasonOptions}
            placeholder={t("common.reason")}
            loading={isLoadingReasons}
          />
        </div>
      ),
    },
    {
      id: 7,
      showOnlyForNonEmployees: true,
      component: (
        <div className="w-[300px]">
          <SelectField
            name="employee_id"
            control={control}
            options={employees2}
            placeholder={t("surgeries.admin-name")}
            loading={isLoadingEmployees2}
          />
        </div>
      ),
    },
  ];

  const visibleFilterItems = useMemo(() => {
    return filterItems.filter(item => (item.showOnlyForNonEmployees ? !isEmployee : true));
  }, [isEmployee, filterItems]);

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);

      const response = await apis.exportToExcel();

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const now = new Date();

      const day = now.getDate();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");

      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12;

      const fileName = `CRM-Report (${day}-${month}-${year}_${hours}-${minutes}-${ampm}).xlsx`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      showSuccess(t("common.export_excel_done"));
    } catch (error) {
      handleBackendErrors({ error });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="w-[80dvw]">
        {/* <Can group={PERMISSION_GROUP.Patient} type={PERMISSION_ACTION.create}> */}
        <BreadCrumb
          title={t("sidebar.patient")}
          link={"/patient"}
          onClick={() => navigate("/patient/add")}
          sticky={true}
          stickyTop="70px"
          buttonText={t("booking.reservation")}
          hideBrimaryButton={
            !hasPermissionFunction({
              group: PERMISSION_GROUP.Patient,
              type: PERMISSION_ACTION.create,
            })
          }
        />
        <div className="w-[calc(100%-20px)]">
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
            onShow={handleShow}
            onEdit={handleEdit}
            permissionGroup={PERMISSION_GROUP.Patient}
            hasSearch={true}
            searchValue={state.searchValue}
            onDelete={handleDelete}
            onSearchChange={val => dispatch({ type: patientActions.searchValue, payload: val })}
            searchPlaceholder={t("common.searchPlaceholder")}
            hasColumnFilters={false}
            isLoading={isLoading}
            onResetFilters={onResetFilter}
            filterElements={visibleFilterItems}
            useFullHeight={true}
            hasStickyBreadcrumb={true}
            extraActions={extraActions}
            customTitle={
              <div className="w-[80%]">
                <Can group={PERMISSION_GROUP.Patient} type={PERMISSION_ACTION.index}>
                  <button
                    type="button"
                    className="flex items-center border border-primary justify-center text-primary rounded-full px-4 cursor-pointer py-1 mr-2 hover:bg-[#e6f7fa] transition"
                    style={{ fontSize: 12, fontWeight: 500 }}
                    onClick={() => handleExportToExcel()}
                    disabled={isExporting}
                  >
                    <p className="text-[12px]">{t("common.export_excel")}</p>
                    <img src={ExcelImage} width={40} height={40} alt="excel" />
                  </button>
                </Can>
              </div>
            }
          />
        </div>
      </div>
      {state.isDeleteModalOpen && (
        <DeleteModal
          isOpen={state.isDeleteModalOpen}
          onClose={handelCloseModal}
          onDelete={handelDelete}
          title={t("patient.delete")}
          warning={t("package.warning")}
          deleteText={t("patient.delete")}
          cancelText={t("common.cancel2")}
          isSubmitting={state.isSending}
        />
      )}
      {state.isReasonModalOpen && (
        <ReasonForNotBookingModal
          isOpen={state.isReasonModalOpen}
          onClose={handleCloseReasonModal}
          onSubmit={handleSubmitReason}
          isSubmitting={state.isSending}
        />
      )}
    </>
  );
}

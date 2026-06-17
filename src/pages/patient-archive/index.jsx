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
import {
  printPatientQuestionnaire,
  questionnaireHealthQuestions,
  questionnaireRequestOptions,
  questionnaireSourceOptions,
} from "@/utils/printPatientQuestionnaire";

const getInitialQuestionnaireForm = () => ({
  sources: [],
  sourceOther: "",
  requests: [],
  medicalHistory: "",
  currentMedications: "",
  drugAllergy: "",
  consultation: "",
  healthAnswers: questionnaireHealthQuestions.reduce((acc, item) => {
    acc[item.key] = "";
    return acc;
  }, {}),
});

export default function PatientArchive() {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(patientReducer, initialValues);
  const [questionnaireTarget, setQuestionnaireTarget] = useState(null);
  const [questionnaireForm, setQuestionnaireForm] = useState(getInitialQuestionnaireForm);
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
    [reasonData?.data]
  );
  const rowData = useMemo(
    () =>
      data?.data?.map((item, index) => ({
        id: item.id,
        patient: item,
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
    [data?.data]
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
      },
      {
        accessorKey: "phone",
        header: t("complaints.phone2"),
        enableColumnFilter: true,
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

  const handleOpenQuestionnaire = row => {
    setQuestionnaireTarget(row);
    setQuestionnaireForm(getInitialQuestionnaireForm());
  };

  const handleCloseQuestionnaire = () => {
    setQuestionnaireTarget(null);
    setQuestionnaireForm(getInitialQuestionnaireForm());
  };

  const toggleQuestionnaireOption = (field, value) => {
    setQuestionnaireForm(prev => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      const next = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];

      return {
        ...prev,
        [field]: next,
      };
    });
  };

  const updateQuestionnaireField = (field, value) => {
    setQuestionnaireForm(prev => ({ ...prev, [field]: value }));
  };

  const updateHealthAnswer = (key, value) => {
    setQuestionnaireForm(prev => ({
      ...prev,
      healthAnswers: {
        ...prev.healthAnswers,
        [key]: value,
      },
    }));
  };

  const handlePrintQuestionnaire = () => {
    if (!questionnaireTarget) return;

    printPatientQuestionnaire({
      patient: questionnaireTarget.patient || questionnaireTarget,
      form: questionnaireForm,
    });
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
        label: "طباعة استبيان",
        icon: <span className="text-[0.9rem]">🖨️</span>,
        onClick: () => handleOpenQuestionnaire(row),
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

      {questionnaireTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" dir="rtl">
          <div className="max-h-[92vh] w-full max-w-[980px] overflow-y-auto rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#EEF2F6] pb-4">
              <div>
                <h3 className="font-main text-[1.15rem] font-bold text-[#2F3747]">طباعة استبيان المريض</h3>
                <p className="mt-1 text-[0.78rem] text-accent">
                  معلومات المريض ستظهر تلقائياً، عبئ الأقسام المتبقية ثم اضغط طباعة.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseQuestionnaire}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-accent transition hover:bg-[#F7FAFC]"
              >
                ×
              </button>
            </div>

            <div className="grid gap-5">
              <section className="rounded-2xl border border-[#E8D8F3] bg-[#FCF8FF] p-4">
                <h4 className="mb-3 font-main text-[0.92rem] font-bold text-primary">كيف تعرفت علينا؟</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {questionnaireSourceOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-2 text-[0.8rem] text-[#2F3747]">
                      <input
                        type="checkbox"
                        checked={questionnaireForm.sources.includes(option.value)}
                        onChange={() => toggleQuestionnaireOption("sources", option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                {questionnaireForm.sources.includes("other") && (
                  <input
                    value={questionnaireForm.sourceOther}
                    onChange={event => updateQuestionnaireField("sourceOther", event.target.value)}
                    placeholder="اكتب المصدر الآخر"
                    className="mt-3 h-11 w-full rounded-full border border-[#E4EAF0] px-4 text-[0.8rem] outline-none focus:border-primary"
                  />
                )}
              </section>

              <section className="rounded-2xl border border-[#D9F3D5] bg-[#FBFFFA] p-4">
                <h4 className="mb-3 font-main text-[0.92rem] font-bold text-[#30a520]">طلب</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {questionnaireRequestOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-2 text-[0.8rem] text-[#2F3747]">
                      <input
                        type="checkbox"
                        checked={questionnaireForm.requests.includes(option.value)}
                        onChange={() => toggleQuestionnaireOption("requests", option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="grid gap-3 rounded-2xl border border-[#F7DCA3] bg-[#FFFDF8] p-4">
                <h4 className="font-main text-[0.92rem] font-bold text-[#D98900]">المعلومات الطبية</h4>
                <input
                  value={questionnaireForm.medicalHistory}
                  onChange={event => updateQuestionnaireField("medicalHistory", event.target.value)}
                  placeholder="سوابق لمرض أو عملية جراحية"
                  className="h-11 rounded-full border border-[#E4EAF0] px-4 text-[0.8rem] outline-none focus:border-primary"
                />
                <input
                  value={questionnaireForm.currentMedications}
                  onChange={event => updateQuestionnaireField("currentMedications", event.target.value)}
                  placeholder="الأدوية المستخدمة حالياً"
                  className="h-11 rounded-full border border-[#E4EAF0] px-4 text-[0.8rem] outline-none focus:border-primary"
                />
                <input
                  value={questionnaireForm.drugAllergy}
                  onChange={event => updateQuestionnaireField("drugAllergy", event.target.value)}
                  placeholder="حساسية لبعض الأدوية"
                  className="h-11 rounded-full border border-[#E4EAF0] px-4 text-[0.8rem] outline-none focus:border-primary"
                />
              </section>

              <section className="rounded-2xl border border-[#F6C8DF] bg-[#FFF9FC] p-4">
                <h4 className="mb-3 font-main text-[0.92rem] font-bold text-[#E45298]">استشارة</h4>
                <textarea
                  value={questionnaireForm.consultation}
                  onChange={event => updateQuestionnaireField("consultation", event.target.value)}
                  placeholder="اكتب الاستشارة"
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-[#E4EAF0] px-4 py-3 text-[0.8rem] outline-none focus:border-primary"
                />
              </section>

              <section className="rounded-2xl border border-[#E5D5F3] bg-white p-4">
                <h4 className="mb-3 font-main text-[0.92rem] font-bold text-primary">أسئلة طبية</h4>
                <div className="grid gap-3">
                  {questionnaireHealthQuestions.map((question, index) => (
                    <div key={question.key} className="grid gap-2 lg:grid-cols-[32px_1fr_1fr] lg:items-center">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[0.72rem] font-bold text-white">
                        {index + 1}
                      </span>
                      <label className="text-[0.8rem] font-medium text-[#2F3747]">{question.label}</label>
                      <input
                        value={questionnaireForm.healthAnswers[question.key] || ""}
                        onChange={event => updateHealthAnswer(question.key, event.target.value)}
                        placeholder="الإجابة"
                        className="h-10 rounded-full border border-[#E4EAF0] px-4 text-[0.78rem] outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#EEF2F6] pt-4">
              <button
                type="button"
                onClick={handleCloseQuestionnaire}
                className="rounded-full border border-[#D5DCE5] px-8 py-2.5 text-[0.8rem] text-accent transition hover:bg-[#F7FAFC]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handlePrintQuestionnaire}
                className="rounded-full bg-primary px-10 py-2.5 text-[0.8rem] font-bold text-white transition hover:bg-primary/90"
              >
                طباعة الاستبيان
              </button>
            </div>
          </div>
        </div>
      )}

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

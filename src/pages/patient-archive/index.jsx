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
import Logo from "@assets/svgs/common/logo.svg";
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

const QuestionnaireMenuIcon = () => (
  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 8V4.8C7 4.36 7.36 4 7.8 4h8.4c.44 0 .8.36.8.8V8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6.5 17H5.8A2.8 2.8 0 0 1 3 14.2v-3.4A2.8 2.8 0 0 1 5.8 8h12.4a2.8 2.8 0 0 1 2.8 2.8v3.4a2.8 2.8 0 0 1-2.8 2.8h-.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M7 14.8c0-.44.36-.8.8-.8h8.4c.44 0 .8.36.8.8v4.4c0 .44-.36.8-.8.8H7.8a.8.8 0 0 1-.8-.8v-4.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M17.5 11.5h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  </span>
);

const questionnaireSectionClass =
  "rounded-[22px] border border-[#DCEFF3] bg-[#FBFEFF] p-5 shadow-[0_10px_35px_rgba(42,180,195,0.06)]";
const questionnaireTitleClass =
  "mb-4 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 font-main text-[0.86rem] font-bold text-primary";
const questionnaireInputClass =
  "h-11 rounded-full border border-[#DDEAF0] bg-white px-4 text-[0.8rem] text-[#2F3747] outline-none transition placeholder:text-[#9AA3AF] focus:border-primary focus:ring-2 focus:ring-primary/10";
const questionnaireTextareaClass =
  "w-full resize-none rounded-[18px] border border-[#DDEAF0] bg-white px-4 py-3 text-[0.8rem] text-[#2F3747] outline-none transition placeholder:text-[#9AA3AF] focus:border-primary focus:ring-2 focus:ring-primary/10";

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
        admin: item?.employee?.full_name || "---",
        status: getTranslatedStatus(item.status),
        register_date: formatDate(item.register_date, "date"),
        reason_id: item?.reason?.id,
        reason: item?.reason?.name,
      })) || [],
    [data?.data]
  );

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
      { accessorKey: "id_show", header: "#", enableColumnFilter: true },
      { accessorKey: "name", header: t("booking.patient"), enableColumnFilter: true },
      {
        accessorKey: "admin",
        header: t("surgeries.admin-name"),
        enableColumnFilter: true,
        showOnlyForNonEmployees: true,
      },
      { accessorKey: "number", header: t("complaints.phone1"), enableColumnFilter: true },
      { accessorKey: "phone", header: t("complaints.phone2"), enableColumnFilter: true },
      { accessorKey: "birthday", header: t("delayed.birthday"), enableColumnFilter: true },
      { accessorKey: "register_date", header: t("patient.register_date"), enableColumnFilter: true },
      { accessorKey: "gender", header: t("delayed.gender"), enableColumnFilter: true },
      { accessorKey: "city", header: t("delayed.country"), enableColumnFilter: true },
      { accessorKey: "country", header: t("users.city"), enableColumnFilter: true },
      { accessorKey: "region", header: t("delayed.area"), enableColumnFilter: true },
      { accessorKey: "reason", header: t("common.reason"), enableColumnFilter: true },
      { accessorKey: "status", header: t("common.patient_status"), enableColumnFilter: true },
    ];

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

      return { ...prev, [field]: next };
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
        label: t("common.display"),
        icon: <img src={show} alt="show" />,
        onClick: () => handleShow(row),
        show: hasPermissionFunction({
          group: PERMISSION_GROUP.Patient,
          type: PERMISSION_ACTION.index,
        }),
      },
      {
        label: "طباعة استبيان",
        icon: <QuestionnaireMenuIcon />,
        onClick: () => handleOpenQuestionnaire(row),
        className: "questionnaire-print-menu-item",
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
        icon: <img src={edit} alt="reason" />,
        onClick: () => handleReasonModal(row),
        show:
          row.reason_id === null &&
          hasPermissionFunction({
            group: PERMISSION_GROUP.Patient,
            type: PERMISSION_ACTION.update,
          }),
      },
    ];

    return <DropdownMenu items={menuItems} position="bottom-left" className="employee-actions-menu" />;
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

  const renderQuestionnaireOption = (field, option) => (
    <label
      key={option.value}
      className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-full border border-[#DDEAF0] bg-white px-3 text-[0.8rem] text-[#2F3747] transition hover:border-primary/50 hover:bg-primary/5"
    >
      <input
        type="checkbox"
        className="h-4 w-4 accent-primary"
        checked={questionnaireForm[field].includes(option.value)}
        onChange={() => toggleQuestionnaireOption(field, option.value)}
      />
      <span>{option.label}</span>
    </label>
  );

  return (
    <>
      <div className="w-[80dvw]">
        <BreadCrumb
          title={t("sidebar.patient")}
          link="/patient"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 px-4 backdrop-blur-sm"
          dir="rtl"
        >
          <div className="max-h-[92vh] w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
            <div className="relative overflow-hidden border-b border-[#E8F3F6] bg-gradient-to-l from-primary/15 via-white to-white px-6 py-5">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-primary via-[#3B5A92] to-primary/40" />
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-primary/15 bg-white shadow-sm">
                    <img src={Logo} alt="Paydar" className="max-h-12 max-w-12 object-contain" />
                  </div>
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[0.72rem] font-bold text-primary">
                      <QuestionnaireMenuIcon />
                      طباعة استبيان
                    </div>
                    <h3 className="font-main text-[1.2rem] font-bold text-[#1F2937]">
                      استبيان المريض قبل الطباعة
                    </h3>
                    <p className="mt-1 text-[0.78rem] text-[#718096]">
                      معلومات المريض ستظهر تلقائياً، عبّئ الأقسام المتبقية ثم اضغط طباعة.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseQuestionnaire}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DDEAF0] bg-white text-accent shadow-sm transition hover:bg-[#F7FAFC]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 grid gap-3 rounded-[20px] border border-primary/10 bg-white/80 p-4 text-[0.78rem] text-[#2F3747] md:grid-cols-3">
                <div>
                  <span className="text-[#8A96A8]">المريض</span>
                  <p className="mt-1 font-bold">{questionnaireTarget?.patient?.full_name || questionnaireTarget?.name || "-"}</p>
                </div>
                <div>
                  <span className="text-[#8A96A8]">رقم الهاتف</span>
                  <p className="mt-1 font-bold">{questionnaireTarget?.patient?.first_phone_number || questionnaireTarget?.number || "-"}</p>
                </div>
                <div>
                  <span className="text-[#8A96A8]">تاريخ التسجيل</span>
                  <p className="mt-1 font-bold">{questionnaireTarget?.register_date || "-"}</p>
                </div>
              </div>
            </div>

            <div className="max-h-[calc(92vh-210px)] overflow-y-auto px-6 py-5">
              <div className="grid gap-5">
                <section className={questionnaireSectionClass}>
                  <h4 className={questionnaireTitleClass}>كيف تعرفت علينا؟</h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {questionnaireSourceOptions.map(option => renderQuestionnaireOption("sources", option))}
                  </div>
                  {questionnaireForm.sources.includes("other") && (
                    <input
                      value={questionnaireForm.sourceOther}
                      onChange={event => updateQuestionnaireField("sourceOther", event.target.value)}
                      placeholder="اكتب المصدر الآخر"
                      className={`${questionnaireInputClass} mt-3 w-full`}
                    />
                  )}
                </section>

                <section className={questionnaireSectionClass}>
                  <h4 className={questionnaireTitleClass}>طلب</h4>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {questionnaireRequestOptions.map(option => renderQuestionnaireOption("requests", option))}
                  </div>
                </section>

                <section className={`${questionnaireSectionClass} grid gap-3`}>
                  <h4 className={questionnaireTitleClass}>المعلومات الطبية</h4>
                  <input
                    value={questionnaireForm.medicalHistory}
                    onChange={event => updateQuestionnaireField("medicalHistory", event.target.value)}
                    placeholder="سوابق لمرض أو عملية جراحية"
                    className={questionnaireInputClass}
                  />
                  <input
                    value={questionnaireForm.currentMedications}
                    onChange={event => updateQuestionnaireField("currentMedications", event.target.value)}
                    placeholder="الأدوية المستخدمة حالياً"
                    className={questionnaireInputClass}
                  />
                  <input
                    value={questionnaireForm.drugAllergy}
                    onChange={event => updateQuestionnaireField("drugAllergy", event.target.value)}
                    placeholder="حساسية لبعض الأدوية"
                    className={questionnaireInputClass}
                  />
                </section>

                <section className={questionnaireSectionClass}>
                  <h4 className={questionnaireTitleClass}>استشارة</h4>
                  <textarea
                    value={questionnaireForm.consultation}
                    onChange={event => updateQuestionnaireField("consultation", event.target.value)}
                    placeholder="اكتب الاستشارة"
                    rows={3}
                    className={questionnaireTextareaClass}
                  />
                </section>

                <section className={questionnaireSectionClass}>
                  <h4 className={questionnaireTitleClass}>أسئلة طبية</h4>
                  <div className="grid gap-3">
                    {questionnaireHealthQuestions.map((question, index) => (
                      <div
                        key={question.key}
                        className="grid gap-3 rounded-[18px] border border-[#E9F3F5] bg-white p-3 lg:grid-cols-[36px_1fr_1.1fr] lg:items-center"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[0.72rem] font-bold text-white shadow-sm">
                          {index + 1}
                        </span>
                        <label className="text-[0.8rem] font-medium text-[#2F3747]">{question.label}</label>
                        <input
                          value={questionnaireForm.healthAnswers[question.key] || ""}
                          onChange={event => updateHealthAnswer(question.key, event.target.value)}
                          placeholder="الإجابة"
                          className={questionnaireInputClass}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#E8F3F6] bg-[#F8FCFD] px-6 py-4">
              <p className="hidden text-[0.74rem] text-[#8A96A8] sm:block">
                سيتم فتح نافذة الطباعة بعد الضغط على زر الطباعة.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseQuestionnaire}
                  className="rounded-full border border-[#D5DCE5] bg-white px-8 py-2.5 text-[0.8rem] text-accent transition hover:bg-[#F7FAFC]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handlePrintQuestionnaire}
                  className="rounded-full bg-primary px-10 py-2.5 text-[0.8rem] font-bold text-white shadow-sm transition hover:bg-primary/90"
                >
                  طباعة الاستبيان
                </button>
              </div>
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

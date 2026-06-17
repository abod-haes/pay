import logo from "@assets/svgs/common/logo.svg";

const escapeHtml = value =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getPatientValue = (patient, keys, fallback = "") => {
  for (const key of keys) {
    const value = patient?.[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }

  return fallback;
};

const formatDate = value => {
  if (!value) return "";
  return String(value).split("T")[0].split(" ")[0];
};

const QUESTIONNAIRE_SOURCE_OPTIONS = [
  { value: "previous_patient", label: "المريض السابق" },
  { value: "ads", label: "إعلان" },
  { value: "facebook", label: "فيسبوك" },
  { value: "instagram", label: "إنستغرام" },
  { value: "whatsapp", label: "واتساب" },
  { value: "sms", label: "رسالة قصيرة" },
  { value: "other", label: "آخر" },
];

const QUESTIONNAIRE_REQUEST_OPTIONS = [
  { value: "hair_loss", label: "علاج تساقط الشعر" },
  { value: "hair_transplant", label: "نصيحة زراعة الشعر" },
  { value: "eyebrow_transplant", label: "نصيحة زراعة الحواجب" },
  { value: "skin_disease", label: "مرض جلدي" },
  { value: "beauty", label: "نصيحة الجمال" },
  { value: "laser", label: "العلاج بالليزر" },
];

const QUESTIONNAIRE_HEALTH_QUESTIONS = [
  { key: "specialDrugAllergy", label: "حساسيت داروي خاصي نداريد؟" },
  { key: "skinAllergy", label: "حساسيت پوستي، قارچ، شوره نداريد؟" },
  { key: "medicationSensitivity", label: "بيماري فاویسم (حساسيت به باقالي) نداريد؟" },
  { key: "chronicDiseases", label: "مشكلات قلبي، فشار خون، ديابت، جراحي خون نداريد؟" },
  { key: "aspirin", label: "اسپرين مصرف ميكنيد؟" },
  { key: "jointDisease", label: "بيماري مفصلي نداريد؟" },
  { key: "breathingIssue", label: "مشكل تنفسي نداريد؟" },
  { key: "specialNotes", label: "موارد خاص:" },
];

const isChecked = (values = [], value) => Array.isArray(values) && values.includes(value);

const selectedBox = checked => `<span class="check-box ${checked ? "checked" : ""}">${checked ? "✓" : ""}</span>`;

const renderInlineOptions = (options, selectedValues, otherValue = "") =>
  options
    .map(option => {
      const value = option.value === "other" && otherValue ? `${option.label}: ${otherValue}` : option.label;
      return `<div class="option-item">${selectedBox(isChecked(selectedValues, option.value))}<span>${escapeHtml(value)}</span></div>`;
    })
    .join("");

const renderLine = ({ label, value = "", wide = false }) => `
  <div class="line-field ${wide ? "wide" : ""}">
    <span class="line-label">${escapeHtml(label)}</span>
    <strong class="line-value">${escapeHtml(value)}</strong>
  </div>`;

const buildQuestionnaireHtml = ({ patient = {}, form = {} }) => {
  const patientName = getPatientValue(patient, ["full_name", "name", "patient"], "");
  const phone = getPatientValue(patient, ["first_phone_number", "number", "phone", "phoneNumber"], "");
  const secondPhone = getPatientValue(patient, ["second_phone_number", "phone"], "");
  const address = getPatientValue(patient, ["address", "region"], "");
  const birthDate = formatDate(getPatientValue(patient, ["birth_date", "birthday"], ""));
  const today = new Date().toLocaleDateString("ar");

  return `<!doctype html>
  <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8" />
      <title>&#8203;</title>
      <style>
        @page { size: A4; margin: 0; }
        @font-face {
          font-family: "notoku";
          src: url("/src/assets/fonts/NotoKufiArabic-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
        }
        @font-face {
          font-family: "Alhurra";
          src: url("/src/assets/fonts/Alhurra Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
        }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        html, body { margin: 0; padding: 0; background: #f9f9f9; }
        body {
          font-family: "notoku", Tahoma, Arial, sans-serif;
          color: #333333;
          padding: 12px 16px;
        }
        .page {
          min-height: calc(100vh - 24px);
          background: #fff;
          border: 1px solid #e6edf2;
          border-radius: 18px;
          padding: 14px 26px 10px;
          box-shadow: 0 12px 34px rgba(41, 180, 195, 0.08);
        }
        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }
        .logo-block { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .logo-block img { width: 148px; max-height: 76px; object-fit: contain; display: block; }
        .logo-block span { color: #3b5a92; font-size: 10px; font-weight: 800; }
        .top-lines { width: 280px; padding-top: 8px; color: #3b5a92; font-size: 12px; font-weight: 900; }
        .top-line { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .top-line::before { content: ""; flex: 1; height: 1px; border-bottom: 1.5px dotted #8ba7bb; }
        .brand-rule {
          height: 5px;
          margin: 9px 0 11px;
          border-radius: 999px;
          background: linear-gradient(90deg, #29b4c3, #3b5a92);
        }
        .section {
          position: relative;
          border: 1.5px solid #d7e7ee;
          border-inline-start: 5px solid #29b4c3;
          border-radius: 16px;
          padding: 14px 16px 13px;
          margin-bottom: 10px;
          background: #fff;
        }
        .section.soft { background: #fbfdfe; }
        .section-title {
          position: absolute;
          top: -12px;
          right: 18px;
          background: #fff;
          border: 1px solid #d7e7ee;
          border-radius: 999px;
          padding: 2px 12px;
          color: #29b4c3;
          font-family: "Alhurra", "notoku", sans-serif;
          font-size: 12px;
          font-weight: 900;
        }
        .patient-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px 18px; }
        .line-field { display: flex; align-items: end; gap: 8px; min-height: 24px; }
        .line-field.wide { grid-column: span 2; }
        .line-label { white-space: nowrap; font-size: 11px; font-weight: 900; color: #3b5a92; }
        .line-label::after { content: " :"; }
        .line-value {
          flex: 1;
          min-height: 18px;
          border-bottom: 1.3px dotted #9aa7b2;
          font-size: 11.5px;
          font-weight: 800;
          color: #333333;
          padding: 0 4px 1px;
        }
        .options { display: grid; grid-template-columns: repeat(7, max-content); gap: 10px 14px; align-items: center; }
        .requests { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 18px; padding-top: 3px; }
        .option-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          color: #333333;
          font-size: 11px;
          font-weight: 700;
        }
        .check-box {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          border: 1.7px solid #29b4c3;
          border-radius: 4px;
          color: #29b4c3;
          font-size: 10px;
          font-weight: 900;
          line-height: 1;
          background: #fff;
        }
        .check-box.checked { background: rgba(41, 180, 195, 0.12); }
        .medical-lines { display: grid; gap: 8px; padding-right: 14px; }
        .text-lines { display: grid; gap: 8px; }
        .health-list { display: grid; gap: 5px; }
        .health-row {
          display: grid;
          grid-template-columns: 26px 1fr minmax(120px, 1fr);
          align-items: end;
          gap: 8px;
          font-size: 11px;
          font-weight: 800;
          color: #333333;
        }
        .number-badge {
          display: inline-flex;
          width: 21px;
          height: 21px;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          color: #fff;
          font-size: 11px;
          font-weight: 900;
          background: #29b4c3;
        }
        .line-answer { min-height: 17px; border-bottom: 1.3px dotted #9aa7b2; color: #333333; padding: 0 4px; }
        .footer {
          margin-top: 7px;
          border-top: 3px solid #29b4c3;
          padding-top: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #3b5a92;
          font-size: 10px;
          font-weight: 800;
        }
        @media print {
          body { padding: 0 !important; background: #fff !important; }
          .page { min-height: 100vh; border: 0; border-radius: 0; box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <main class="page">
        <header class="header">
          <div class="logo-block">
            <img src="${logo}" alt="Paydar" />
            <span>عيادة التخصصي لزراعة الشعر</span>
          </div>
          <div class="top-lines">
            <div class="top-line"><span>التاريخ</span><strong>${escapeHtml(today)}</strong></div>
            <div class="top-line"><span>الرقم</span><strong>${escapeHtml(patient?.id || "")}</strong></div>
          </div>
        </header>
        <div class="brand-rule"></div>

        <section class="section">
          <span class="section-title">معلومات المريض</span>
          <div class="patient-grid">
            ${renderLine({ label: "الاسم", value: patientName })}
            ${renderLine({ label: "اسم الأب", value: patient?.father_name || "" })}
            ${renderLine({ label: "اللقب", value: patient?.last_name || "" })}
            ${renderLine({ label: "تاريخ الولادة", value: birthDate })}
            ${renderLine({ label: "رقم الهوية", value: patient?.identity_number || patient?.id || "" })}
            ${renderLine({ label: "العنوان", value: address, wide: true })}
            ${renderLine({ label: "العمل", value: patient?.job || patient?.work || "" })}
            ${renderLine({ label: "رقم الهاتف", value: phone || secondPhone, wide: true })}
          </div>
        </section>

        <section class="section soft">
          <span class="section-title">كيف تعرفت علينا؟</span>
          <div class="options">${renderInlineOptions(
            QUESTIONNAIRE_SOURCE_OPTIONS,
            form.sources,
            form.sourceOther
          )}</div>
        </section>

        <section class="section">
          <span class="section-title">طلب</span>
          <div class="requests">${renderInlineOptions(QUESTIONNAIRE_REQUEST_OPTIONS, form.requests)}</div>
        </section>

        <section class="section soft">
          <span class="section-title">المعلومات الطبية</span>
          <div class="medical-lines">
            ${renderLine({ label: "سوابق لمرض أو عملية جراحية", value: form.medicalHistory })}
            ${renderLine({ label: "الأدوية المستخدمة حالياً", value: form.currentMedications })}
            ${renderLine({ label: "حساسية لبعض الأدوية", value: form.drugAllergy })}
          </div>
        </section>

        <section class="section">
          <span class="section-title">استشارة</span>
          <div class="text-lines">
            ${renderLine({ label: "", value: form.consultation, wide: true })}
            ${renderLine({ label: "", value: "", wide: true })}
            ${renderLine({ label: "", value: "", wide: true })}
          </div>
        </section>

        <section class="section soft">
          <span class="section-title">أسئلة طبية</span>
          <div class="health-list">
            ${QUESTIONNAIRE_HEALTH_QUESTIONS.map((question, index) => {
              const colors = ["#29b4c3", "#3b5a92"];
              return `<div class="health-row">
                <span class="number-badge" style="background:${colors[index % colors.length]}">${index + 1}</span>
                <span>${escapeHtml(question.label)}</span>
                <strong class="line-answer">${escapeHtml(form.healthAnswers?.[question.key] || "")}</strong>
              </div>`;
            }).join("")}
          </div>
        </section>

        <footer class="footer">
          <span>Paydar Clinic</span>
          <span>تم إنشاء الاستبيان من نظام Paydar</span>
        </footer>
      </main>
    </body>
  </html>`;
};

export const printPatientQuestionnaire = ({ patient, form }) => {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;

  printWindow.document.write(buildQuestionnaireHtml({ patient, form }));
  printWindow.document.close();
  printWindow.document.title = "\u200B";
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.document.title = "\u200B";
    printWindow.print();
  };
};

export const questionnaireSourceOptions = QUESTIONNAIRE_SOURCE_OPTIONS;
export const questionnaireRequestOptions = QUESTIONNAIRE_REQUEST_OPTIONS;
export const questionnaireHealthQuestions = QUESTIONNAIRE_HEALTH_QUESTIONS;

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
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        html, body { margin: 0; padding: 0; background: #fff; }
        body { font-family: Arial, Tahoma, sans-serif; color: #192040; padding: 10px 14px; }
        .page { min-height: calc(100vh - 20px); border: 1px solid #f4e8fb; background: #fff; padding: 10px 28px 8px; }
        .header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
        .logo-block { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .logo-block img { width: 150px; max-height: 78px; object-fit: contain; display: block; }
        .logo-block span { color: #7b1fc1; font-size: 10px; font-weight: 800; }
        .top-lines { width: 280px; padding-top: 8px; color: #161e55; font-size: 13px; font-weight: 900; }
        .top-line { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .top-line::before { content: ""; flex: 1; height: 1px; border-bottom: 1.5px dotted #1e2555; }
        .purple-rule { height: 5px; margin: 8px 0 10px; border-radius: 999px; background: #8b28c6; }
        .section { position: relative; border: 1.6px solid #8b28c6; border-radius: 10px; padding: 13px 16px; margin-bottom: 10px; }
        .section.blue { border-color: #1fa6ff; }
        .section.green { border-color: #52ce3c; }
        .section.orange { border-color: #f0ac2b; }
        .section.pink { border-color: #f39ac8; }
        .section.purple { border-color: #9b54d3; }
        .section-title { position: absolute; top: -10px; right: 18px; background: #fff; padding: 0 8px; color: #7b1fc1; font-size: 12px; font-weight: 900; }
        .section.blue .section-title { color: #168fd8; }
        .section.green .section-title { color: #30a520; }
        .section.orange .section-title { color: #d98900; }
        .section.pink .section-title { color: #e45298; }
        .patient-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px 18px; }
        .line-field { display: flex; align-items: end; gap: 8px; min-height: 24px; }
        .line-field.wide { grid-column: span 2; }
        .line-label { white-space: nowrap; font-size: 11.5px; font-weight: 900; color: #11184d; }
        .line-label::after { content: " :"; }
        .line-value { flex: 1; min-height: 18px; border-bottom: 1.4px dotted #333; font-size: 12px; font-weight: 800; color: #111; padding: 0 4px 1px; }
        .options { display: grid; grid-template-columns: repeat(7, max-content); gap: 10px 14px; align-items: center; }
        .requests { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 18px; padding-top: 3px; }
        .option-item { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; color: #1b244f; font-size: 11.5px; font-weight: 700; }
        .check-box { display: inline-flex; align-items: center; justify-content: center; width: 13px; height: 13px; border: 1.6px solid #55b7f5; color: #18a2e3; font-size: 10px; font-weight: 900; line-height: 1; }
        .green .check-box, .requests .check-box { border-color: #64d85b; color: #2aad1d; }
        .check-box.checked { background: #f3fff2; }
        .medical-lines { display: grid; gap: 8px; padding-right: 62px; }
        .text-lines { display: grid; gap: 8px; }
        .health-list { display: grid; gap: 5px; }
        .health-row { display: grid; grid-template-columns: 26px 1fr minmax(120px, 1fr); align-items: end; gap: 8px; font-size: 11.5px; font-weight: 800; color: #1b244f; }
        .number-badge { display: inline-flex; width: 20px; height: 20px; align-items: center; justify-content: center; border-radius: 4px; color: #fff; font-size: 11px; font-weight: 900; }
        .line-answer { min-height: 17px; border-bottom: 1.4px dotted #333; color: #111; padding: 0 4px; }
        .footer { margin-top: 7px; border-top: 3px solid #8b28c6; padding-top: 5px; display: flex; align-items: center; justify-content: space-between; color: #7b1fc1; font-size: 10px; font-weight: 800; }
        @media print { body { padding: 0 !important; } .page { min-height: 100vh; border: 0; } }
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
        <div class="purple-rule"></div>

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

        <section class="section blue">
          <span class="section-title">كيف تعرفت علينا؟</span>
          <div class="options">${renderInlineOptions(
            QUESTIONNAIRE_SOURCE_OPTIONS,
            form.sources,
            form.sourceOther
          )}</div>
        </section>

        <section class="section green">
          <span class="section-title">طلب</span>
          <div class="requests">${renderInlineOptions(QUESTIONNAIRE_REQUEST_OPTIONS, form.requests)}</div>
        </section>

        <section class="section orange">
          <div class="medical-lines">
            ${renderLine({ label: "سوابق لمرض أو عملية جراحية", value: form.medicalHistory })}
            ${renderLine({ label: "الأدوية المستخدمة حالياً", value: form.currentMedications })}
            ${renderLine({ label: "حساسية لبعض الأدوية", value: form.drugAllergy })}
          </div>
        </section>

        <section class="section pink">
          <span class="section-title">استشارة</span>
          <div class="text-lines">
            ${renderLine({ label: "", value: form.consultation, wide: true })}
            ${renderLine({ label: "", value: "", wide: true })}
            ${renderLine({ label: "", value: "", wide: true })}
          </div>
        </section>

        <section class="section purple">
          <div class="health-list">
            ${QUESTIONNAIRE_HEALTH_QUESTIONS.map((question, index) => {
              const colors = ["#6e35b8", "#2585d9", "#43b02a", "#f49b22", "#ec477a", "#16a2c8", "#9450c9", "#5bbd40"];
              return `<div class="health-row">
                <span class="number-badge" style="background:${colors[index]}">${index + 1}</span>
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

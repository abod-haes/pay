import logo from "@assets/svgs/common/logo.svg";

const PRINT_VALUE_TRANSLATIONS = {
  hair_transplant: "زراعة الشعر",
  eyebrow_transplant: "زراعة الحواجب",
  injection: "الحقن",
  hair_care: "العناية بالشعر",
  other: "أخرى",
  wait: "انتظار",
  approve: "موافق عليه",
  cancel: "ملغي",
  done: "منجز",
  delayed: "مؤجل",
  pending: "انتظار",
  active: "نشط",
  booked: "محجوز",
  male: "ذكر",
  female: "أنثى",
  true: "نعم",
  false: "لا",
};

const PRINT_SECTION_TRANSLATIONS = {
  hair_transplant: "زراعة",
  eyebrow_transplant: "زراعة",
  injection: "حقن",
  hair_care: "عناية الشعر",
  other: "أخرى",
};

const escapeHtml = value =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const translatePrintValue = value => {
  if (value === null || value === undefined || value === "") return "-";
  const stringValue = String(value).trim();
  return PRINT_VALUE_TRANSLATIONS[stringValue] || stringValue;
};

const translatePrintSection = value => {
  if (value === null || value === undefined || value === "") return "-";
  const stringValue = String(value).trim();
  return PRINT_SECTION_TRANSLATIONS[stringValue] || translatePrintValue(stringValue);
};

const getValue = value => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") {
    return translatePrintValue(value?.name || value?.full_name || value?.title || value?.label || value?.type || "-");
  }
  return translatePrintValue(value);
};

const getSectionValue = value => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") {
    return translatePrintSection(value?.name || value?.title || value?.label || value?.type || "-");
  }
  return translatePrintSection(value);
};

const formatStatus = status => getValue(status?.name || status?.title || status?.type || status);

const splitDateTime = (dateValue, fallbackTime) => {
  if (!dateValue) {
    return { date: "-", time: fallbackTime || "-" };
  }

  const value = String(dateValue).trim();

  if (value.includes("T")) {
    const [datePart, rawTimePart] = value.split("T");
    const timePart = rawTimePart?.replace("Z", "")?.split(".")?.[0];
    return { date: datePart || "-", time: fallbackTime || timePart || "-" };
  }

  if (value.includes(" ")) {
    const [datePart, rawTimePart] = value.split(/\s+/);
    const timePart = rawTimePart?.replace("Z", "")?.split(".")?.[0];
    return { date: datePart || "-", time: fallbackTime || timePart || "-" };
  }

  return { date: value || "-", time: fallbackTime || "-" };
};

const buildInfoRows = rows =>
  rows
    .filter(row => row?.value !== undefined)
    .map(row => {
      const value = row.isSection ? getSectionValue(row.value) : getValue(row.value);
      return `
        <div class="info-item ${row.isFullWidth ? "full" : ""}">
          <span class="info-label">${escapeHtml(row.label)}</span>
          <strong class="info-value">${escapeHtml(value)}</strong>
        </div>`;
    })
    .join("");

const buildDetailsTableRows = rows =>
  rows
    .filter(row => row?.value !== undefined)
    .map(row => {
      const value = row.isSection ? getSectionValue(row.value) : getValue(row.value);
      return `
        <tr>
          <td class="label-cell">${escapeHtml(row.label)}</td>
          <td>${escapeHtml(value)}</td>
        </tr>`;
    })
    .join("");

const buildBookingsRows = bookings => {
  if (!bookings?.length) {
    return `<tr><td colspan="7" class="empty">لا توجد حجوزات</td></tr>`;
  }

  return bookings
    .map((booking, index) => {
      const dateTime = splitDateTime(booking?.date || booking?.booking_date, booking?.time);
      return `
        <tr>
          <td class="index-cell">${index + 1}</td>
          <td>${escapeHtml(getValue(booking?.title || booking?.service?.name || booking?.service || booking?.section || booking?.type))}</td>
          <td>${escapeHtml(getSectionValue(booking?.department || booking?.section || booking?.type))}</td>
          <td>${escapeHtml(getValue(dateTime.date))}</td>
          <td>${escapeHtml(getValue(dateTime.time))}</td>
          <td><span class="status-badge">${escapeHtml(formatStatus(booking?.booking_status || booking?.status))}</span></td>
          <td>${escapeHtml(getValue(booking?.employee?.full_name || booking?.employee || booking?.doctor?.full_name || booking?.doctor))}</td>
        </tr>`;
    })
    .join("");
};

const buildFilesRows = files => {
  if (!files?.length) {
    return `<tr><td colspan="4" class="empty">لا توجد ملفات مرفقة</td></tr>`;
  }

  return files
    .map((file, index) => {
      const dateTime = splitDateTime(file?.date || file?.created_at || file?.updated_at);
      return `
        <tr>
          <td class="index-cell">${index + 1}</td>
          <td>${escapeHtml(getValue(file?.name || file?.file_name || file?.title))}</td>
          <td>${escapeHtml(getValue(dateTime.date))}</td>
          <td>${escapeHtml(getValue(file?.url ? "مرفق" : "-"))}</td>
        </tr>`;
    })
    .join("");
};

const buildSection = ({ title, className = "", children }) => {
  if (!children) return "";
  return `
    <div class="section ${className}">
      <h2 class="section-title">${escapeHtml(title)}</h2>
      ${children}
    </div>`;
};

const buildPrintHtml = ({
  title,
  patient,
  detailsTitle = "تفاصيل الحجز / العملية",
  details = [],
  bookings = [],
  files = [],
  extraSections = [],
}) => `
  <!doctype html>
  <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8" />
      <title>&#8203;</title>
      <style>
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        html, body { margin: 0; padding: 0; background: #fff; }
        body { font-family: Arial, Tahoma, sans-serif; color: #1f2937; padding: 12px; line-height: 1.55; }
        .print-page { min-height: calc(100vh - 24px); border: 1px solid #d7edf1; border-radius: 10px; overflow: hidden; background: #fff; }
        .clinic-header { padding: 18px 26px 10px; background: #fff; }
        .header-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
        .clinic-logo { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 180px; }
        .clinic-logo img { max-width: 150px; max-height: 72px; object-fit: contain; display: block; }
        .clinic-subtitle { color: #34466b; font-size: 10.5px; font-weight: 800; margin: 0; }
        .clinic-lines { flex: 1; max-width: 360px; color: #2b3f71; font-size: 13px; font-weight: 900; padding-top: 8px; }
        .clinic-line { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .clinic-line span { white-space: nowrap; }
        .clinic-line::before { content: ""; flex: 1; height: 1px; border-bottom: 1px dotted #7b8aa8; }
        .brand-rule, .footer-rule { height: 4px; border-radius: 999px; background: linear-gradient(90deg, #29b4c3 0%, #3b5a92 100%); }
        .brand-rule { margin-top: 10px; }
        .report-title-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 13px 26px 0; }
        .report-title { margin: 0; color: #29b4c3; font-size: 18px; font-weight: 900; }
        .print-date-pill { border: 1px solid #d7edf1; border-radius: 999px; padding: 6px 12px; color: #34466b; background: #f7fdfe; font-size: 11px; font-weight: 800; }
        .content { padding: 16px 26px 14px; }
        .section { margin-bottom: 13px; border: 1.5px solid #d7edf1; border-radius: 14px; padding: 13px; background: #fff; break-inside: avoid; }
        .section-title { display: inline-flex; align-items: center; margin: -2px 0 12px; padding: 4px 12px; border-radius: 999px; background: #e8f8fb; color: #29b4c3; font-size: 13px; font-weight: 900; }
        .info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px 14px; }
        .info-item { display: grid; grid-template-columns: 105px 1fr; gap: 8px; align-items: end; min-height: 32px; }
        .info-item.full { grid-column: 1 / -1; }
        .info-label { color: #34466b; font-size: 12px; font-weight: 900; white-space: nowrap; }
        .info-label::after { content: " :"; }
        .info-value { min-height: 24px; color: #1f2937; font-size: 12.5px; font-weight: 800; border-bottom: 1px dotted #7b8aa8; padding-bottom: 2px; word-break: break-word; }
        .table-wrap { border: 1px solid #d7edf1; border-radius: 12px; overflow: hidden; background: #fff; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px 9px; text-align: right; font-size: 11.5px; border-bottom: 1px solid #edf6f8; vertical-align: middle; }
        tr:last-child td { border-bottom: 0; }
        th { background: #f7fdfe; color: #34466b; font-weight: 900; white-space: nowrap; }
        .label-cell { width: 30%; color: #34466b; background: #f7fdfe; font-weight: 900; }
        .index-cell { width: 44px; text-align: center; color: #29b4c3; font-weight: 900; }
        .status-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 62px; padding: 4px 9px; border-radius: 999px; background: #e8f8fb; color: #29b4c3; font-weight: 900; font-size: 10.5px; }
        .empty { padding: 20px 12px; text-align: center; color: #7b8aa8; background: #fbfeff; }
        .clinic-footer { padding: 0 26px 16px; }
        .footer-rule { margin-bottom: 8px; }
        .footer-content { display: flex; align-items: center; justify-content: center; gap: 8px; color: #34466b; font-size: 10.5px; font-weight: 800; }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; }
          body { padding: 8px !important; }
          .print-page { min-height: calc(100vh - 16px); }
          .section { page-break-inside: avoid; }
          tr { break-inside: avoid; page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <main class="print-page">
        <header class="clinic-header">
          <div class="header-top">
            <div class="clinic-logo">
              <img src="${logo}" alt="Paydar" />
              <p class="clinic-subtitle">عيادة التخصصي لزراعة الشعر</p>
            </div>
            <div class="clinic-lines">
              <div class="clinic-line"><span>التاريخ</span></div>
              <div class="clinic-line"><span>الرقم</span></div>
            </div>
          </div>
          <div class="brand-rule"></div>
        </header>

        <div class="report-title-row">
          <h1 class="report-title">${escapeHtml(title)}</h1>
          <div class="print-date-pill">تاريخ الطباعة: ${escapeHtml(new Date().toLocaleString("ar"))}</div>
        </div>

        <section class="content">
          ${buildSection({
            title: "معلومات المريض",
            children: `<div class="info-grid">${buildInfoRows([
              { label: "الاسم", value: patient?.full_name || patient?.name || patient?.patient },
              { label: "رقم الهاتف", value: patient?.first_phone_number || patient?.phoneNumber || patient?.phone },
              { label: "رقم هاتف إضافي", value: patient?.second_phone_number },
              { label: "الجنس", value: patient?.gender },
              { label: "تاريخ الولادة", value: patient?.birth_date },
              { label: "العنوان", value: patient?.address },
            ])}</div>`,
          })}

          ${details?.length ? buildSection({
            title: detailsTitle,
            children: `<div class="table-wrap"><table><tbody>${buildDetailsTableRows(details)}</tbody></table></div>`,
          }) : ""}

          ${extraSections
            .map(section =>
              buildSection({
                title: section.title,
                children: `<div class="table-wrap"><table><tbody>${buildDetailsTableRows(section.rows || [])}</tbody></table></div>`,
              })
            )
            .join("")}

          ${bookings?.length ? buildSection({
            title: "الحجوزات",
            children: `<div class="table-wrap"><table><thead><tr><th>#</th><th>العنوان</th><th>القسم</th><th>التاريخ</th><th>الوقت</th><th>الحالة</th><th>الموظف / الطبيب</th></tr></thead><tbody>${buildBookingsRows(bookings)}</tbody></table></div>`,
          }) : ""}

          ${files?.length ? buildSection({
            title: "ملفات المريض",
            children: `<div class="table-wrap"><table><thead><tr><th>#</th><th>اسم الملف</th><th>التاريخ</th><th>الحالة</th></tr></thead><tbody>${buildFilesRows(files)}</tbody></table></div>`,
          }) : ""}
        </section>

        <footer class="clinic-footer">
          <div class="footer-rule"></div>
          <div class="footer-content">النجف الأشرف، شارع الفرات، عمودي، بناية بايدار ط السابع</div>
        </footer>
      </main>
    </body>
  </html>`;

export const printPatientData = ({
  title = "معلومات المريض",
  patient,
  detailsTitle,
  details,
  bookings,
  files,
  extraSections,
}) => {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;

  printWindow.document.write(buildPrintHtml({ title, patient, detailsTitle, details, bookings, files, extraSections }));
  printWindow.document.close();
  printWindow.document.title = "\u200B";
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.document.title = "\u200B";
    printWindow.print();
  };
};

export const printBookingRow = (row, options = {}) => {
  printPatientData({
    title: options.title || "طباعة حجز",
    detailsTitle: options.detailsTitle || "تفاصيل الحجز",
    patient: row?.patientx || row,
    details: [
      { label: "الخدمة", value: row?.serviceName || row?.service },
      { label: "القسم", value: row?.department || row?.section || row?.type, isSection: true },
      { label: "التاريخ", value: row?.date },
      { label: "الوقت", value: row?.time },
      { label: "الحالة", value: formatStatus(row?.status) },
      { label: "الموظف / الطبيب", value: row?.employee || row?.adminName },
      { label: "المبلغ", value: row?.total },
    ],
  });
};

export const printPatientWithBookings = ({ patient, bookings }) => {
  const medical = patient?.medical_information || {};

  printPatientData({
    title: "طباعة إضبارة مريض",
    patient,
    bookings,
    files: patient?.attachments || [],
    extraSections: [
      {
        title: "المعلومات الطبية",
        rows: [
          {
            label: "أمراض مزمنة",
            value: `${translatePrintValue(Boolean(medical?.chronic_diseases))}${medical?.chronic_diseases_description ? `، ${medical.chronic_diseases_description}` : ""}`,
          },
          {
            label: "حساسية أدوية",
            value: `${translatePrintValue(Boolean(medical?.drug_allergy))}${medical?.drug_allergy_description ? `، ${medical.drug_allergy_description}` : ""}`,
          },
          {
            label: "عملية سابقة",
            value: `${translatePrintValue(Boolean(medical?.previous_surgery))}${medical?.previous_surgery_description ? `، ${medical.previous_surgery_description}` : ""}`,
          },
        ],
      },
    ],
  });
};

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
    return {
      date: "-",
      time: fallbackTime || "-",
    };
  }

  const value = String(dateValue).trim();

  if (value.includes("T")) {
    const [datePart, rawTimePart] = value.split("T");
    const timePart = rawTimePart?.replace("Z", "")?.split(".")?.[0];

    return {
      date: datePart || "-",
      time: fallbackTime || timePart || "-",
    };
  }

  if (value.includes(" ")) {
    const [datePart, rawTimePart] = value.split(/\s+/);
    const timePart = rawTimePart?.replace("Z", "")?.split(".")?.[0];

    return {
      date: datePart || "-",
      time: fallbackTime || timePart || "-",
    };
  }

  return {
    date: value || "-",
    time: fallbackTime || "-",
  };
};

const buildRows = rows =>
  rows
    .filter(row => row?.value !== undefined)
    .map(row => {
      const value = row.isSection ? getSectionValue(row.value) : getValue(row.value);

      return `
        <div class="info-item">
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
    return `<tr><td colspan="6" class="empty">لا توجد حجوزات</td></tr>`;
  }

  return bookings
    .map((booking, index) => {
      const dateTime = splitDateTime(booking?.date || booking?.booking_date, booking?.time);

      return `
        <tr>
          <td class="index-cell">${index + 1}</td>
          <td>${escapeHtml(getValue(booking?.title || booking?.service?.name || booking?.service || booking?.section || booking?.type))}</td>
          <td>${escapeHtml(getValue(dateTime.date))}</td>
          <td>${escapeHtml(getValue(dateTime.time))}</td>
          <td><span class="status-badge">${escapeHtml(formatStatus(booking?.booking_status || booking?.status))}</span></td>
          <td>${escapeHtml(getValue(booking?.employee?.full_name || booking?.employee || booking?.doctor?.full_name))}</td>
        </tr>`;
    })
    .join("");
};

const buildPrintHtml = ({ title, patient, details = [], bookings = [] }) => `
  <!doctype html>
  <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8" />
      <title>&#8203;</title>
      <style>
        @page {
          size: A4;
          margin: 0;
        }

        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
        }

        body {
          font-family: Arial, Tahoma, sans-serif;
          color: #22152f;
          padding: 16px;
          line-height: 1.65;
        }

        .print-page {
          width: 100%;
          min-height: calc(100vh - 32px);
          border: 1px solid #ead7f5;
          border-radius: 8px;
          overflow: hidden;
          background: #ffffff;
        }

        .clinic-header {
          padding: 20px 28px 12px;
          background: #ffffff;
        }

        .header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .clinic-logo {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
          min-width: 180px;
        }

        .clinic-logo img {
          max-width: 150px;
          max-height: 72px;
          object-fit: contain;
          display: block;
        }

        .clinic-subtitle {
          color: #7d2db2;
          font-size: 10.5px;
          font-weight: 700;
          margin: 0;
        }

        .clinic-lines {
          flex: 1;
          max-width: 360px;
          color: #2a2350;
          font-size: 13px;
          font-weight: 800;
          padding-top: 8px;
          direction: rtl;
        }

        .clinic-line {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .clinic-line span {
          white-space: nowrap;
        }

        .clinic-line::before {
          content: "";
          flex: 1;
          height: 1px;
          border-bottom: 1px dotted #7b7b91;
          opacity: 0.9;
        }

        .purple-rule {
          height: 5px;
          margin-top: 10px;
          border-radius: 999px;
          background: linear-gradient(90deg, #7b1fc1 0%, #9a35d7 55%, #7b1fc1 100%);
        }

        .report-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 28px 0;
        }

        .report-title {
          margin: 0;
          color: #7b1fc1;
          font-size: 18px;
          font-weight: 900;
        }

        .print-date-pill {
          border: 1px solid #e2caef;
          border-radius: 999px;
          padding: 6px 12px;
          color: #4b3b5f;
          background: #fbf7fe;
          font-size: 11px;
          font-weight: 700;
        }

        .content {
          padding: 18px 28px 16px;
        }

        .section {
          margin-bottom: 14px;
          border: 1.5px solid #d7c3e8;
          border-radius: 12px;
          padding: 14px;
          background: #ffffff;
        }

        .section.patient-section {
          border-color: #8d35c9;
        }

        .section.details-section {
          border-color: #f0b655;
        }

        .section.bookings-section {
          border-color: #3f9bff;
        }

        .section-title {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 8px;
          margin: 0 0 12px;
          color: #7b1fc1;
          font-size: 14px;
          font-weight: 900;
        }

        .section-title::before {
          content: "";
          width: 10px;
          height: 10px;
          border: 2px solid currentColor;
          border-radius: 3px;
          background: #ffffff;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 14px;
        }

        .info-item {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 8px;
          align-items: end;
          min-height: 34px;
        }

        .info-label {
          color: #261f45;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .info-label::after {
          content: " :";
        }

        .info-value {
          display: block;
          min-height: 24px;
          color: #15192f;
          font-size: 13px;
          font-weight: 800;
          border-bottom: 1px dotted #7b7b91;
          padding-bottom: 2px;
          word-break: break-word;
        }

        .table-wrap {
          border: 1px solid #eadff1;
          border-radius: 10px;
          overflow: hidden;
          background: #ffffff;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 9px 10px;
          text-align: right;
          font-size: 12px;
          border-bottom: 1px solid #eee4f4;
          vertical-align: middle;
        }

        tr:last-child td {
          border-bottom: 0;
        }

        th {
          background: #fbf6fe;
          color: #5d287d;
          font-size: 11.5px;
          font-weight: 900;
          white-space: nowrap;
        }

        .label-cell {
          width: 30%;
          color: #261f45;
          background: #fffaf3;
          font-weight: 900;
        }

        .index-cell {
          width: 46px;
          text-align: center;
          color: #7b1fc1;
          font-weight: 900;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 66px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #f5ebff;
          color: #7b1fc1;
          font-weight: 900;
          font-size: 11px;
        }

        .empty {
          padding: 22px 12px;
          text-align: center;
          color: #6f6480;
          background: #fbf7fe;
        }

        .clinic-footer {
          padding: 0 28px 18px;
        }

        .footer-rule {
          height: 3px;
          border-radius: 999px;
          background: linear-gradient(90deg, #7b1fc1 0%, #9a35d7 55%, #7b1fc1 100%);
          margin-bottom: 8px;
        }

        .footer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          color: #7b1fc1;
          font-size: 11px;
          font-weight: 800;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-logo img {
          width: 54px;
          height: 26px;
          object-fit: contain;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          body {
            padding: 8px !important;
          }

          .print-page {
            min-height: calc(100vh - 16px);
            border-radius: 6px;
          }

          .clinic-header {
            padding: 16px 22px 10px;
          }

          .report-title-row,
          .content,
          .clinic-footer {
            padding-left: 22px;
            padding-right: 22px;
          }

          .section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .table-wrap {
            break-inside: auto;
          }

          tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
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
          <div class="purple-rule"></div>
        </header>

        <div class="report-title-row">
          <h1 class="report-title">${escapeHtml(title)}</h1>
          <div class="print-date-pill">تاريخ الطباعة: ${escapeHtml(new Date().toLocaleString("ar"))}</div>
        </div>

        <section class="content">
          <div class="section patient-section">
            <h2 class="section-title">معلومات المريض</h2>
            <div class="info-grid">
              ${buildRows([
                { label: "الاسم", value: patient?.full_name || patient?.name || patient?.patient },
                { label: "رقم الهاتف", value: patient?.first_phone_number || patient?.phoneNumber || patient?.phone },
                { label: "رقم هاتف إضافي", value: patient?.second_phone_number },
                { label: "الجنس", value: patient?.gender },
                { label: "العنوان", value: patient?.address },
              ])}
            </div>
          </div>

          ${
            details?.length
              ? `<div class="section details-section">
                  <h2 class="section-title">تفاصيل الحجز / العملية</h2>
                  <div class="table-wrap">
                    <table>
                      <tbody>${buildDetailsTableRows(details)}</tbody>
                    </table>
                  </div>
                </div>`
              : ""
          }

          ${
            bookings?.length
              ? `<div class="section bookings-section">
                  <h2 class="section-title">الحجوزات</h2>
                  <div class="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>العنوان</th>
                          <th>التاريخ</th>
                          <th>الوقت</th>
                          <th>الحالة</th>
                          <th>الموظف / الطبيب</th>
                        </tr>
                      </thead>
                      <tbody>${buildBookingsRows(bookings)}</tbody>
                    </table>
                  </div>
                </div>`
              : ""
          }
        </section>

        <footer class="clinic-footer">
          <div class="footer-rule"></div>
          <div class="footer-content">
            <span>تم إنشاء هذا التقرير من نظام Paydar</span>
            <div class="footer-logo">
              <span>Paydar Clinic</span>
              <img src="${logo}" alt="Paydar" />
            </div>
          </div>
        </footer>
      </main>
    </body>
  </html>`;

export const printPatientData = ({ title = "معلومات المريض", patient, details, bookings }) => {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;

  printWindow.document.write(buildPrintHtml({ title, patient, details, bookings }));
  printWindow.document.close();
  printWindow.document.title = "\u200B";
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.document.title = "\u200B";
    printWindow.print();
  };
};

export const printBookingRow = row => {
  printPatientData({
    title: "معلومات المريض وتفاصيل الحجز",
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
  printPatientData({
    title: "معلومات المريض وجميع الحجوزات",
    patient,
    bookings,
  });
};

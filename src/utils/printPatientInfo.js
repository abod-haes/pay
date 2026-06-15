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
          size: auto;
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
          color: #172033;
          padding: 24px;
          line-height: 1.7;
        }

        .print-page {
          width: 100%;
          min-height: calc(100vh - 48px);
          border: 1px solid #dbe7ea;
          border-radius: 18px;
          overflow: hidden;
          background: #ffffff;
        }

        .print-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          padding: 28px 30px;
          background: linear-gradient(135deg, #ecfbfd 0%, #ffffff 72%);
          border-bottom: 1px solid #dbe7ea;
        }

        .brand-block {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-mark {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #29b4c3;
          color: #ffffff;
          font-weight: 800;
          font-size: 20px;
          box-shadow: 0 10px 24px rgba(41, 180, 195, 0.22);
        }

        .eyebrow {
          margin: 0 0 4px;
          color: #29b4c3;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.4px;
        }

        h1 {
          font-size: 22px;
          line-height: 1.35;
          margin: 0;
          color: #101827;
        }

        .print-date-card {
          min-width: 190px;
          padding: 12px 14px;
          border: 1px solid #dbe7ea;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.88);
          text-align: right;
        }

        .print-date-label {
          display: block;
          color: #667085;
          font-size: 11px;
          margin-bottom: 2px;
        }

        .print-date-value {
          display: block;
          color: #172033;
          font-weight: 700;
          font-size: 12px;
        }

        .content {
          padding: 26px 30px 30px;
        }

        .section {
          margin-bottom: 24px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 14px;
          color: #101827;
          font-size: 16px;
          font-weight: 800;
        }

        .section-title::before {
          content: "";
          width: 5px;
          height: 22px;
          border-radius: 999px;
          background: #29b4c3;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .info-item {
          padding: 12px 14px;
          border: 1px solid #e4ecef;
          border-radius: 14px;
          background: #fbfdfe;
          min-height: 70px;
        }

        .info-label {
          display: block;
          color: #667085;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .info-value {
          display: block;
          color: #101827;
          font-size: 14px;
          font-weight: 800;
          word-break: break-word;
        }

        .table-wrap {
          border: 1px solid #dbe7ea;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 11px 12px;
          text-align: right;
          font-size: 12.5px;
          border-bottom: 1px solid #e7eef0;
          vertical-align: middle;
        }

        tr:last-child td {
          border-bottom: 0;
        }

        th {
          background: #f2fbfc;
          color: #344054;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .label-cell {
          width: 30%;
          color: #667085;
          background: #fbfdfe;
          font-weight: 800;
        }

        .index-cell {
          width: 46px;
          text-align: center;
          color: #667085;
          font-weight: 800;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 66px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #eefafd;
          color: #188a96;
          font-weight: 800;
          font-size: 11.5px;
        }

        .empty {
          padding: 24px 12px;
          text-align: center;
          color: #667085;
          background: #fbfdfe;
        }

        .print-footer {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding-top: 16px;
          margin-top: 8px;
          border-top: 1px solid #e7eef0;
          color: #98a2b3;
          font-size: 11px;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          body {
            padding: 10px !important;
          }

          .print-page {
            min-height: auto;
            border-radius: 14px;
          }

          .print-header {
            padding: 22px 24px;
          }

          .content {
            padding: 22px 24px 24px;
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
        <header class="print-header">
          <div class="brand-block">
            <div class="brand-mark">P</div>
            <div>
              <p class="eyebrow">تقرير طبي</p>
              <h1>${escapeHtml(title)}</h1>
            </div>
          </div>

          <div class="print-date-card">
            <span class="print-date-label">تاريخ الطباعة</span>
            <span class="print-date-value">${escapeHtml(new Date().toLocaleString("ar"))}</span>
          </div>
        </header>

        <section class="content">
          <div class="section">
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
              ? `<div class="section">
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
              ? `<div class="section">
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

          <footer class="print-footer">
            <span>تم إنشاء هذا التقرير من النظام</span>
            <span>Patient Report</span>
          </footer>
        </section>
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

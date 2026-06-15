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
};

const translatePrintValue = value => {
  if (value === null || value === undefined || value === "") return "-";
  const stringValue = String(value).trim();
  return PRINT_VALUE_TRANSLATIONS[stringValue] || stringValue;
};

const getValue = value => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") {
    return translatePrintValue(value?.name || value?.full_name || value?.title || value?.label || value?.type || "-");
  }
  return translatePrintValue(value);
};

const formatStatus = status => getValue(status?.name || status?.title || status?.type || status);

const buildRows = rows =>
  rows
    .filter(row => row?.value !== undefined)
    .map(
      row => `
        <tr>
          <td>${row.label}</td>
          <td>${getValue(row.value)}</td>
        </tr>`
    )
    .join("");

const buildBookingsRows = bookings => {
  if (!bookings?.length) {
    return `<tr><td colspan="6" class="empty">لا توجد حجوزات</td></tr>`;
  }

  return bookings
    .map((booking, index) => {
      const dateValue = booking?.date || booking?.created_at || "";
      const [date, time] = String(dateValue).split(" ");
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${getValue(booking?.title || booking?.service?.name || booking?.service || booking?.section || booking?.type)}</td>
          <td>${getValue(date || booking?.booking_date)}</td>
          <td>${getValue(time || booking?.time)}</td>
          <td>${formatStatus(booking?.booking_status || booking?.status)}</td>
          <td>${getValue(booking?.employee?.full_name || booking?.employee || booking?.doctor?.full_name)}</td>
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
        * { box-sizing: border-box; }
        html,
        body {
          margin: 0;
          padding: 0;
          background: #ffffff;
        }
        body {
          font-family: Arial, Tahoma, sans-serif;
          color: #111827;
          padding: 32px;
          line-height: 1.7;
        }
        h1 { font-size: 22px; margin: 0 0 20px; color: #111827; }
        h2 { font-size: 16px; margin: 24px 0 12px; color: #29b4c3; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #e5e7eb; padding: 10px 12px; text-align: right; font-size: 13px; }
        th { background: #f3f4f6; font-weight: 700; }
        .info td:first-child { width: 30%; background: #f9fafb; font-weight: 700; }
        .empty { text-align: center; color: #6b7280; }
        .print-date { color: #6b7280; font-size: 12px; margin-bottom: 20px; }
        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          body {
            padding: 16px !important;
          }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleString("ar")}</div>

      <h2>معلومات المريض</h2>
      <table class="info">
        <tbody>
          ${buildRows([
            { label: "الاسم", value: patient?.full_name || patient?.name || patient?.patient },
            { label: "رقم الهاتف", value: patient?.first_phone_number || patient?.phoneNumber || patient?.phone },
            { label: "رقم هاتف إضافي", value: patient?.second_phone_number },
            { label: "الجنس", value: patient?.gender },
            { label: "العنوان", value: patient?.address },
          ])}
        </tbody>
      </table>

      ${
        details?.length
          ? `<h2>تفاصيل الحجز / العملية</h2><table class="info"><tbody>${buildRows(details)}</tbody></table>`
          : ""
      }

      ${
        bookings?.length
          ? `<h2>الحجوزات</h2>
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
             </table>`
          : ""
      }
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
      { label: "الخدمة", value: row?.service },
      { label: "القسم", value: row?.department || row?.type },
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

import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import LoadingElement from "@/components/shared/loading";
import { useDashboardQueries } from "@/apis/dashboard/query";

const pad = value => String(value).padStart(2, "0");

const agendaTexts = {
  ar: {
    title: "جدول الأعمال",
    previous: "السابق",
    next: "التالي",
    noMonthAppointments: "لا توجد مواعيد لهذا الشهر",
    dayBookingsTitle: "حجوزات يوم {{date}}",
    close: "إغلاق",
    noDayBookings: "لا توجد حجوزات في هذا اليوم",
    booking: "حجز",
    examination: "فحص",
    appointment: "موعد",
    examinationCard: "معاينة",
    otherAppointments: "مواعيد أخرى",
    patient: "المريض",
    time: "الوقت",
    service: "الخدمة",
    employee: "الموظف",
    forPatient: "للمريض",
    atTime: "في",
  },
  en: {
    title: "Agenda",
    previous: "Previous",
    next: "Next",
    noMonthAppointments: "No appointments this month",
    dayBookingsTitle: "Bookings for {{date}}",
    close: "Close",
    noDayBookings: "No bookings on this day",
    booking: "Booking",
    examination: "Examination",
    appointment: "Appointment",
    examinationCard: "Examination",
    otherAppointments: "other appointments",
    patient: "Patient",
    time: "Time",
    service: "Service",
    employee: "Employee",
    forPatient: "for patient",
    atTime: "at",
  },
  fa: {
    title: "برنامه کاری",
    previous: "قبلی",
    next: "بعدی",
    noMonthAppointments: "در این ماه هیچ نوبتی وجود ندارد",
    dayBookingsTitle: "رزروهای روز {{date}}",
    close: "بستن",
    noDayBookings: "در این روز رزروی وجود ندارد",
    booking: "رزرو",
    examination: "معاینه",
    appointment: "نوبت",
    examinationCard: "معاینه",
    otherAppointments: "نوبت دیگر",
    patient: "بیمار",
    time: "زمان",
    service: "خدمت",
    employee: "کارمند",
    forPatient: "برای بیمار",
    atTime: "در ساعت",
  },
};

const getAgendaTexts = language => agendaTexts[language] || agendaTexts.ar;
const formatMessage = (template, values = {}) =>
  Object.entries(values).reduce((text, [key, value]) => text.replace(`{{${key}}}`, value), template);

const toArray = value => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
};

const mergeArrays = (...arrays) => arrays.flatMap(item => (Array.isArray(item) ? item : []));

const getPayloadArray = payload => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.days)) return payload.days;
  if (Array.isArray(payload?.data?.days)) return payload.data.days;
  if (Array.isArray(payload?.bookings)) return payload.bookings;
  if (Array.isArray(payload?.booking)) return payload.booking;
  if (Array.isArray(payload?.examination)) return payload.examination;
  if (Array.isArray(payload?.data?.bookings)) return payload.data.bookings;
  if (Array.isArray(payload?.data?.booking) || Array.isArray(payload?.data?.examination)) {
    return mergeArrays(payload?.data?.booking, payload?.data?.examination);
  }

  const candidate = payload?.data || payload?.result || payload;
  if (candidate && typeof candidate === "object") {
    return Object.entries(candidate)
      .filter(([, value]) => value && typeof value === "object")
      .map(([key, value]) => ({ day: key, ...value }));
  }

  return [];
};

const parseBookingDate = value => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return null;

  const [datePart = "", timePart = ""] = rawValue.split(" ");

  // API returns dates like: 15/06/2026 08:30 or 06/12/2026 08:30
  if (datePart.includes("/")) {
    const [first, second, year] = datePart.split("/").map(Number);
    if (!first || !second || !year) return null;

    // Backend sometimes sends MM/DD/YYYY and sometimes DD/MM/YYYY.
    // If first number is greater than 12, it is definitely the day.
    const day = first > 12 ? first : second > 12 ? second : first;
    const month = first > 12 ? second : second > 12 ? first : second;

    return {
      day,
      month,
      year,
      apiDate: `${pad(day)}/${pad(month)}/${year}`,
      isoDate: `${year}-${pad(month)}-${pad(day)}`,
      displayDate: `${pad(day)}/${pad(month)}/${year}`,
      time: timePart || "",
    };
  }

  // Support ISO/backend formats like: 2026-06-15 or 2026-06-15T08:30:00
  const normalized = rawValue.replace("T", " ");
  const [isoDatePart = "", isoTimePart = ""] = normalized.split(" ");
  if (isoDatePart.includes("-")) {
    const [year, month, day] = isoDatePart.split("-").map(Number);
    if (!day || !month || !year) return null;

    const cleanTime = isoTimePart.replace("Z", "").split(".")[0];

    return {
      day,
      month,
      year,
      apiDate: `${pad(day)}/${pad(month)}/${year}`,
      isoDate: `${year}-${pad(month)}-${pad(day)}`,
      displayDate: `${pad(day)}/${pad(month)}/${year}`,
      time: cleanTime || "",
    };
  }

  return null;
};

const getDayNumber = value => {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") return value;

  const rawValue = String(value).trim();
  if (!rawValue) return null;

  const parsedDate = parseBookingDate(rawValue);
  if (parsedDate?.day) return parsedDate.day;

  const numericValue = Number(rawValue);
  if (Number.isFinite(numericValue)) return numericValue;

  return null;
};

const getBookingDateMeta = booking => parseBookingDate(booking?.date || booking?.day || booking?.full_date);

const getBookingTime = booking => {
  const dateMeta = getBookingDateMeta(booking);
  return booking?.time || dateMeta?.time || "-";
};

const getBookingStatus = booking => {
  return booking?.booking_status?.name || booking?.status?.name || booking?.status || "-";
};

const getStaffName = booking =>
  booking?.employee?.full_name ||
  booking?.doctor?.full_name ||
  booking?.technician?.full_name ||
  booking?.assistant?.full_name ||
  "-";

const isGenericBookingTitle = title => {
  const value = String(title || "").trim();
  return !value || value === "حجز" || value === "موعد" || value.startsWith("messages.");
};

const getAgendaItemType = item => {
  if (item?.agendaType) return item.agendaType;
  if (item?.type === "examination" || item?.examination_id) return "examination";
  return "booking";
};

const getAgendaItemLabel = (item, texts) =>
  getAgendaItemType(item) === "examination" ? texts.examination : texts.booking;
const getAgendaCardLabel = (item, texts) =>
  getAgendaItemType(item) === "examination" ? texts.examinationCard : texts.appointment;

const getBookingTitle = (booking, texts) => {
  const title = String(booking?.title || "").trim();
  if (title && !title.startsWith("messages.")) return title;

  const serviceName = booking?.service?.name;
  const patientName = booking?.patient?.full_name || booking?.patient_name;
  const time = getBookingTime(booking);
  const fallbackLabel = getAgendaItemLabel(booking, texts);

  return [
    serviceName || fallbackLabel,
    patientName ? `${texts.forPatient} ${patientName}` : "",
    time && time !== "-" ? `${texts.atTime} ${time}` : "",
  ]
    .filter(Boolean)
    .join(" ");
};

const getDayCardTitle = (booking, texts) => {
  if (!booking) return "";

  const title = getBookingTitle(booking, texts);
  if (!isGenericBookingTitle(title)) return title;

  const serviceName = booking?.service?.name;
  const patientName = booking?.patient?.full_name || booking?.patient_name;
  const time = getBookingTime(booking);

  return [serviceName, patientName, time && time !== "-" ? time : ""].filter(Boolean).join(" • ") || getAgendaCardLabel(booking, texts);
};

const getCompactBookingDetails = (booking, texts) => {
  const service = booking?.service?.name || getAgendaCardLabel(booking, texts);
  const patient = booking?.patient?.full_name || booking?.patient_name || "";
  const time = getBookingTime(booking);

  return {
    service,
    patient,
    time: time && time !== "-" ? time : "",
  };
};

const normalizeMonthBookings = payload => {
  const items = getPayloadArray(payload);

  return items.reduce((acc, item) => {
    const parsedDate = parseBookingDate(item?.date || item?.full_date || item?.day_date);
    const dayNumber = Number(item?.day_number || parsedDate?.day || getDayNumber(item?.day));
    if (!dayNumber) return acc;

    // earliest-booking returns this shape:
    // { date: "2026-06-01", booking: { id, title }, examination: null }
    const earliestBookings = toArray(item?.booking).map(booking => ({
      ...booking,
      date: booking?.date || item?.date,
      agendaType: "booking",
    }));
    const earliestExaminations = toArray(item?.examination).map(examination => ({
      ...examination,
      date: examination?.date || item?.date,
      agendaType: "examination",
    }));
    const earliestItems = [...earliestBookings, ...earliestExaminations];

    if (earliestItems.length) {
      acc[dayNumber] = [...(acc[dayNumber] || []), ...earliestItems];
      return acc;
    }

    const nestedBookings = mergeArrays(item?.bookings, item?.items, item?.data);
    if (nestedBookings.length) {
      acc[dayNumber] = [...(acc[dayNumber] || []), ...nestedBookings];
      return acc;
    }

    acc[dayNumber] = [...(acc[dayNumber] || []), item];
    return acc;
  }, {});
};

const normalizeDayBookings = payload => getPayloadArray(payload);

const BookingsAgenda = () => {
  const { i18n } = useTranslation();
  const texts = getAgendaTexts(i18n.language);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(null);

  const { data, isLoading } = useDashboardQueries.GetEarliestBooking({ year, month });
  const { data: selectedDayData, isLoading: isDayLoading } = useDashboardQueries.GetBookingsByDate({
    date: selectedDay?.apiDate,
    enabled: Boolean(selectedDay?.apiDate),
  });

  const monthBookings = useMemo(() => normalizeMonthBookings(data), [data]);
  const selectedDayBookings = useMemo(() => normalizeDayBookings(selectedDayData), [selectedDayData]);

  const monthDays = useMemo(
    () =>
      Object.entries(monthBookings)
        .map(([dayKey, bookings]) => {
          const day = Number(dayKey);
          const parsedDate = parseBookingDate(bookings?.[0]?.date);

          return {
            day,
            date: parsedDate?.isoDate || `${year}-${pad(month)}-${pad(day)}`,
            apiDate: parsedDate?.apiDate || `${pad(day)}/${pad(month)}/${year}`,
            displayDate: parsedDate?.displayDate || `${pad(day)}/${pad(month)}/${year}`,
            bookings,
          };
        })
        .filter(item => item.day && item.bookings?.length)
        .sort((first, second) => first.day - second.day),
    [monthBookings, month, year]
  );

  const handlePreviousMonth = () => {
    setSelectedDay(null);
    if (month === 1) {
      setMonth(12);
      setYear(prev => prev - 1);
      return;
    }
    setMonth(prev => prev - 1);
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
    if (month === 12) {
      setMonth(1);
      setYear(prev => prev + 1);
      return;
    }
    setMonth(prev => prev + 1);
  };

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-main text-[0.95rem] text-[#1F2937]">{texts.title}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full border border-primary px-5 py-1.5 text-[0.75rem] text-primary transition hover:bg-primary hover:text-white"
              onClick={handlePreviousMonth}
            >
              {texts.previous}
            </button>
            <p className="min-w-[92px] text-center font-main text-[0.9rem] text-[#384250]">
              {pad(month)} / {year}
            </p>
            <button
              type="button"
              className="rounded-full border border-primary px-5 py-1.5 text-[0.75rem] text-primary transition hover:bg-primary hover:text-white"
              onClick={handleNextMonth}
            >
              {texts.next}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-[260px] items-center justify-center">
            <LoadingElement color="#29b4c3" />
          </div>
        ) : monthDays.length ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {monthDays.map(item => {
              const bookingCount = item.bookings.length;
              const firstBooking = item.bookings[0];
              const bookingDetails = getCompactBookingDetails(firstBooking, texts);

              return (
                <button
                  type="button"
                  key={item.date}
                  onClick={() => setSelectedDay(item)}
                  className="group flex min-h-[90px] flex-col rounded-[18px] border border-primary/25 bg-[#FBFEFF] p-2.5 text-start transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2FBFC] text-[1rem] font-bold text-primary">
                      {item.day}
                    </span>
                    {bookingCount > 1 && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.62rem] font-bold text-primary">
                        +{bookingCount - 1}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 h-px w-full bg-[#EDF5F7]" />

                  <div className="mt-2 flex flex-1 flex-col justify-center rounded-xl bg-[#F8FAFC] px-2.5 py-2">
                    <span
                      title={getDayCardTitle(firstBooking, texts)}
                      className="line-clamp-1 text-[0.74rem] font-bold leading-5 text-[#273142]"
                    >
                      {bookingDetails.service}
                    </span>
                    {(bookingDetails.patient || bookingDetails.time) && (
                      <span className="line-clamp-1 text-[0.65rem] leading-5 text-[#7A8699]">
                        {[bookingDetails.patient, bookingDetails.time].filter(Boolean).join(" • ")}
                      </span>
                    )}
                    {bookingCount > 1 && (
                      <span className="mt-1 text-[0.62rem] font-medium text-primary">{texts.otherAppointments}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#DDE7EA] py-10 text-center text-[0.8rem] text-[#7A8699]">
            {texts.noMonthAppointments}
          </div>
        )}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-main text-[1rem] text-primary">
                {formatMessage(texts.dayBookingsTitle, { date: selectedDay.displayDate })}
              </p>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="rounded-full border border-[#E5E7EB] px-4 py-1 text-[0.75rem]"
              >
                {texts.close}
              </button>
            </div>

            {isDayLoading ? (
              <div className="flex h-[180px] items-center justify-center">
                <LoadingElement color="#29b4c3" />
              </div>
            ) : selectedDayBookings.length ? (
              <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto">
                {selectedDayBookings.map((booking, index) => (
                  <div
                    key={booking?.id || index}
                    className="rounded-xl border border-[#EFEFEF] p-4 text-[0.8rem]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-bold text-[#333]">{getBookingTitle(booking, texts)}</p>
                      <span className="rounded-full bg-[#FFF8E1] px-3 py-1 text-[0.7rem] text-[#8A6D00]">
                        {getBookingStatus(booking)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-[#6B7280] md:grid-cols-2">
                      <span>{texts.patient}: {booking?.patient?.full_name || booking?.patient_name || "-"}</span>
                      <span>{texts.time}: {getBookingTime(booking)}</span>
                      <span>{texts.service}: {booking?.service?.name || "-"}</span>
                      <span>{texts.employee}: {getStaffName(booking)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-[#6B7280]">{texts.noDayBookings}</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default BookingsAgenda;

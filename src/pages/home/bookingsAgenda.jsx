import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import LoadingElement from "@/components/shared/loading";
import { useDashboardQueries } from "@/apis/dashboard/query";

const pad = value => String(value).padStart(2, "0");

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
      .filter(([, value]) => Array.isArray(value) || typeof value === "object")
      .map(([key, value]) => ({ day: key, ...(Array.isArray(value) ? { bookings: value } : value) }));
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

const getBookingTitle = booking => {
  const title = String(booking?.title || "").trim();
  if (title && !title.startsWith("messages.")) return title;

  const serviceName = booking?.service?.name;
  const patientName = booking?.patient?.full_name || booking?.patient_name;
  const time = getBookingTime(booking);

  return [serviceName || "موعد", patientName ? `للمريض ${patientName}` : "", time && time !== "-" ? `في ${time}` : ""]
    .filter(Boolean)
    .join(" ");
};

const getDayCardTitle = booking => {
  if (!booking) return "";

  const title = getBookingTitle(booking);
  if (!isGenericBookingTitle(title)) return title;

  const serviceName = booking?.service?.name;
  const patientName = booking?.patient?.full_name || booking?.patient_name;
  const time = getBookingTime(booking);

  return [serviceName, patientName, time && time !== "-" ? time : ""].filter(Boolean).join(" • ") || "موعد";
};

const normalizeMonthBookings = payload => {
  const items = getPayloadArray(payload);

  return items.reduce((acc, item) => {
    // earliest-booking usually returns days, and every day contains one or more bookings.
    const nestedBookings = mergeArrays(item?.bookings, item?.booking, item?.items, item?.data, item?.examination);
    if (nestedBookings.length) {
      const dateValue = item?.date || item?.full_date || item?.day_date || item?.day;
      const dayNumber = getDayNumber(item?.day_number || item?.day || item?.date || item?.full_date);
      const parsedDate = parseBookingDate(dateValue);
      const finalDayNumber = Number(dayNumber || parsedDate?.day);
      if (!finalDayNumber) return acc;

      acc[finalDayNumber] = [...(acc[finalDayNumber] || []), ...nestedBookings];
      return acc;
    }

    // Fallback if backend returns flat bookings array with date: "15/06/2026 08:30".
    const parsedDate = getBookingDateMeta(item);
    const dayNumber = Number(item?.day_number || parsedDate?.day || getDayNumber(item?.day));
    if (!dayNumber) return acc;

    acc[dayNumber] = [...(acc[dayNumber] || []), item];
    return acc;
  }, {});
};

const normalizeDayBookings = payload => getPayloadArray(payload);

const BookingsAgenda = () => {
  const { t } = useTranslation();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(null);

  const { data, isLoading } = useDashboardQueries.GetEarliestBooking({ year, month });
  const { data: selectedDayData, isLoading: isDayLoading } = useDashboardQueries.GetBookingsByDate({
    date: selectedDay?.apiDate,
    enabled: Boolean(selectedDay?.apiDate),
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const monthBookings = useMemo(() => normalizeMonthBookings(data), [data]);
  const selectedDayBookings = useMemo(() => normalizeDayBookings(selectedDayData), [selectedDayData]);

  const monthDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const bookings = monthBookings[day] || [];

    return {
      day,
      date: `${year}-${pad(month)}-${pad(day)}`,
      apiDate: `${pad(day)}/${pad(month)}/${year}`,
      displayDate: `${pad(day)}/${pad(month)}/${year}`,
      bookings,
    };
  });

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
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-main text-[0.95rem] text-[#1F2937]">جدول الأعمال</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-full border border-primary px-5 py-1.5 text-[0.75rem] text-primary transition hover:bg-primary hover:text-white"
              onClick={handlePreviousMonth}
            >
              السابق
            </button>
            <p className="min-w-[92px] text-center font-main text-[0.9rem] text-[#384250]">
              {pad(month)} / {year}
            </p>
            <button
              type="button"
              className="rounded-full border border-primary px-5 py-1.5 text-[0.75rem] text-primary transition hover:bg-primary hover:text-white"
              onClick={handleNextMonth}
            >
              التالي
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-[260px] items-center justify-center">
            <LoadingElement color="#29b4c3" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {monthDays.map(item => {
              const bookingCount = item.bookings.length;
              const hasBookings = bookingCount > 0;
              const visibleBookings = item.bookings.slice(0, 2);

              return (
                <button
                  type="button"
                  key={item.date}
                  onClick={() => setSelectedDay(item)}
                  className={`group min-h-[118px] rounded-2xl border p-3.5 text-start transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md ${
                    hasBookings ? "border-primary/25 bg-[#FBFEFF]" : "border-[#EFEFEF] bg-white"
                  }`}
                >
                  <div className="flex h-full flex-col gap-3">
                    <div className="flex items-center justify-between gap-2 border-b border-[#EDF5F7] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2FBFC] text-[1rem] font-bold text-primary">
                          {item.day}
                        </span>
                        <span className="text-[0.72rem] text-[#8A94A6]">{item.displayDate}</span>
                      </div>

                      {hasBookings && (
                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-primary px-2 text-[0.78rem] font-bold text-white shadow-sm">
                          {bookingCount}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-center gap-2">
                      {hasBookings ? (
                        <>
                          {visibleBookings.map((booking, index) => (
                            <span
                              key={booking?.id || index}
                              title={getDayCardTitle(booking)}
                              className="line-clamp-1 rounded-xl bg-[#F5F8FA] px-3 py-2 text-[0.72rem] leading-5 text-[#384250]"
                            >
                              {getDayCardTitle(booking)}
                            </span>
                          ))}

                          {bookingCount > visibleBookings.length && (
                            <span className="text-[0.68rem] font-medium text-primary">
                              +{bookingCount - visibleBookings.length} مواعيد أخرى
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="rounded-xl bg-[#F8FAFC] px-3 py-2 text-center text-[0.72rem] text-[#9AA3AF]">
                          لا توجد مواعيد
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-main text-[1rem] text-primary">حجوزات يوم {selectedDay.displayDate}</p>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="rounded-full border border-[#E5E7EB] px-4 py-1 text-[0.75rem]"
              >
                {t("common.cancel2") || "إغلاق"}
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
                      <p className="font-bold text-[#333]">{getBookingTitle(booking)}</p>
                      <span className="rounded-full bg-[#FFF8E1] px-3 py-1 text-[0.7rem] text-[#8A6D00]">
                        {getBookingStatus(booking)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-[#6B7280] md:grid-cols-2">
                      <span>المريض: {booking?.patient?.full_name || booking?.patient_name || "-"}</span>
                      <span>الوقت: {getBookingTime(booking)}</span>
                      <span>الخدمة: {booking?.service?.name || "-"}</span>
                      <span>الموظف: {getStaffName(booking)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-[#6B7280]">لا توجد حجوزات في هذا اليوم</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default BookingsAgenda;

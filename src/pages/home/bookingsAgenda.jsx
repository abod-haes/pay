import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/card";
import LoadingElement from "@/components/shared/loading";
import { useDashboardQueries } from "@/apis/dashboard/query";

const pad = value => String(value).padStart(2, "0");

const getPayloadArray = payload => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.days)) return payload.days;
  if (Array.isArray(payload?.data?.days)) return payload.data.days;
  if (Array.isArray(payload?.bookings)) return payload.bookings;
  if (Array.isArray(payload?.data?.bookings)) return payload.data.bookings;
  return [];
};

const parseBookingDate = value => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return null;

  const [datePart = "", timePart = ""] = rawValue.split(" ");

  // API returns dates like: 15/06/2026 08:30
  if (datePart.includes("/")) {
    const [day, month, year] = datePart.split("/").map(Number);
    if (!day || !month || !year) return null;

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

const getBookingDateMeta = booking => parseBookingDate(booking?.date || booking?.day || booking?.full_date);

const getBookingTime = booking => {
  const dateMeta = getBookingDateMeta(booking);
  return booking?.time || dateMeta?.time || "-";
};

const getBookingStatus = booking => {
  return booking?.booking_status?.name || booking?.status?.name || booking?.status || "-";
};

const getBookingTitle = booking => {
  return booking?.title || booking?.service?.name || booking?.patient?.full_name || "حجز";
};

const normalizeMonthBookings = payload => {
  const items = getPayloadArray(payload);

  return items.reduce((acc, item) => {
    // Some API shapes may already return days with inner bookings.
    if (Array.isArray(item?.bookings) || Array.isArray(item?.items) || Array.isArray(item?.data)) {
      const dateValue = item?.date || item?.day || item?.full_date;
      const parsedDate = parseBookingDate(dateValue);
      const dayNumber = Number(item?.day_number || parsedDate?.day || item?.day);
      if (!dayNumber) return acc;

      const bookings = item?.bookings || item?.items || item?.data || [];
      acc[dayNumber] = Array.isArray(bookings) ? bookings : [];
      return acc;
    }

    // Current API returns a flat bookings array with date: "15/06/2026 08:30".
    const parsedDate = getBookingDateMeta(item);
    const dayNumber = Number(item?.day_number || parsedDate?.day || item?.day);
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

  const { data, isLoading } = useDashboardQueries.GetBookingsByDate({ year, month });
  const { data: selectedDayData, isLoading: isDayLoading } = useDashboardQueries.GetBookingsByDate({
    date: selectedDay?.apiDate,
    enabled: Boolean(selectedDay?.apiDate),
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const monthBookings = useMemo(() => normalizeMonthBookings(data), [data]);
  const fetchedSelectedDayBookings = useMemo(
    () => normalizeDayBookings(selectedDayData),
    [selectedDayData]
  );
  const selectedDayBookings = fetchedSelectedDayBookings.length
    ? fetchedSelectedDayBookings
    : selectedDay?.bookings || [];

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
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.875rem] font-main">جدول الأعمال</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-primary px-4 py-1 text-primary text-[0.75rem]"
              onClick={handlePreviousMonth}
            >
              السابق
            </button>
            <p className="font-main text-[0.85rem] text-[#384250]">
              {year} / {pad(month)}
            </p>
            <button
              type="button"
              className="rounded-full border border-primary px-4 py-1 text-primary text-[0.75rem]"
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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {monthDays.map(item => (
              <button
                type="button"
                key={item.date}
                onClick={() => setSelectedDay(item)}
                className="min-h-[118px] rounded-xl border border-[#EFEFEF] bg-white p-3 text-start transition hover:border-primary hover:shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-primary font-bold text-[0.9rem]">{item.day}</span>
                  <span className="rounded-full bg-[#F2FBFC] px-2 py-0.5 text-[0.65rem] text-primary">
                    {item.bookings.length} حجز
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {item.bookings.slice(0, 3).map((booking, index) => (
                    <span
                      key={`${item.date}-${booking?.id || index}`}
                      title={getBookingTitle(booking)}
                      className="truncate rounded-md bg-[#F8FAFC] px-2 py-1 text-[0.7rem] text-[#384250]"
                    >
                      {getBookingTitle(booking)}
                    </span>
                  ))}
                  {item.bookings.length > 3 && (
                    <span className="text-[0.65rem] text-primary">+{item.bookings.length - 3}</span>
                  )}
                </div>
              </button>
            ))}
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

            {isDayLoading && !selectedDayBookings.length ? (
              <div className="flex h-[180px] items-center justify-center">
                <LoadingElement color="#29b4c3" />
              </div>
            ) : selectedDayBookings.length ? (
              <div className="max-h-[420px] overflow-y-auto flex flex-col gap-3">
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
                      <span>الموظف: {booking?.employee?.full_name || booking?.doctor?.full_name || "-"}</span>
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

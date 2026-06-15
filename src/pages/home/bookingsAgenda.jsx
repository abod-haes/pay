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
  return [];
};

const normalizeMonthBookings = payload => {
  const items = getPayloadArray(payload);

  return items.reduce((acc, item) => {
    const dateValue = item?.date || item?.day || item?.full_date;
    const dayNumber = Number(item?.day_number || item?.day || String(dateValue || "").split("-").pop());
    if (!dayNumber) return acc;

    const bookings = item?.bookings || item?.items || item?.data || (item?.title ? [item] : []);
    acc[dayNumber] = Array.isArray(bookings) ? bookings : [];
    return acc;
  }, {});
};

const normalizeDayBookings = payload => {
  const items = getPayloadArray(payload);
  if (items.length) return items;

  if (Array.isArray(payload?.bookings)) return payload.bookings;
  if (Array.isArray(payload?.data?.bookings)) return payload.data.bookings;

  return [];
};

const BookingsAgenda = () => {
  const { t } = useTranslation();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(null);

  const { data, isLoading } = useDashboardQueries.GetBookingsByDate({ year, month });
  const { data: selectedDayData, isLoading: isDayLoading } = useDashboardQueries.GetBookingsByDate({
    date: selectedDate,
    enabled: Boolean(selectedDate),
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const monthBookings = useMemo(() => normalizeMonthBookings(data), [data]);
  const selectedDayBookings = useMemo(
    () => normalizeDayBookings(selectedDayData),
    [selectedDayData]
  );

  const monthDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return {
      day,
      date: `${year}-${pad(month)}-${pad(day)}`,
      bookings: monthBookings[day] || [],
    };
  });

  const handlePreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(prev => prev - 1);
      return;
    }
    setMonth(prev => prev - 1);
  };

  const handleNextMonth = () => {
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
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            {monthDays.map(item => (
              <button
                type="button"
                key={item.date}
                onClick={() => setSelectedDate(item.date)}
                className="min-h-[110px] rounded-xl border border-[#EFEFEF] bg-white p-3 text-start hover:border-primary hover:shadow-sm transition"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-primary font-bold text-[0.9rem]">{item.day}</span>
                  <span className="text-[0.65rem] text-accent">{item.bookings.length}</span>
                </div>
                <div className="flex flex-col gap-1">
                  {item.bookings.slice(0, 3).map((booking, index) => (
                    <span
                      key={`${item.date}-${booking?.id || index}`}
                      className="truncate rounded-md bg-[#F2FBFC] px-2 py-1 text-[0.7rem] text-[#384250]"
                    >
                      {booking?.title || booking?.service?.name || booking?.patient?.full_name || "حجز"}
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

      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-main text-[1rem] text-primary">حجوزات يوم {selectedDate}</p>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
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
              <div className="max-h-[420px] overflow-y-auto flex flex-col gap-3">
                {selectedDayBookings.map((booking, index) => (
                  <div
                    key={booking?.id || index}
                    className="rounded-xl border border-[#EFEFEF] p-4 text-[0.8rem]"
                  >
                    <p className="font-bold text-[#333]">
                      {booking?.title || booking?.service?.name || booking?.patient?.full_name || "حجز"}
                    </p>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[#6B7280]">
                      <span>المريض: {booking?.patient?.full_name || booking?.patient_name || "-"}</span>
                      <span>الوقت: {booking?.time || booking?.date?.split(" ")?.[1] || "-"}</span>
                      <span>الحالة: {booking?.booking_status?.name || booking?.status?.name || "-"}</span>
                      <span>الخدمة: {booking?.service?.name || "-"}</span>
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

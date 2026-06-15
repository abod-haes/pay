/* eslint-disable indent */
/* eslint-disable complexity */
import React, { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import moment from "moment";
import ChevronLeft from "@assets/svgs/common/chevron-left.svg";
import ChevronRight from "@assets/svgs/common/chevron-right.svg";
import Arrow from "@assets/svgs/common/arrow-down.svg";

const CustomCalendar = ({ value, onChange, minDate, maxDate, disabled = false }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const today = moment();

  // robust parser: يقبل Date | moment | number | "YYYY-MM-DD" | "DD-MM-YYYY" وغيرها
  const parseToMoment = val => {
    if (!val && val !== 0) {
      return moment();
    }
    if (moment.isMoment(val)) {
      return val.clone();
    }
    if (val instanceof Date) {
      return moment(val);
    }
    if (typeof val === "number") {
      return moment(val);
    }
    if (typeof val === "string") {
      const s = val.trim();
      const formats = [
        "YYYY-MM-DD",
        "DD-MM-YYYY",
        "D-M-YYYY",
        "YYYY/MM/DD",
        "DD/MM/YYYY",
        moment.ISO_8601,
      ];
      // حاول بصيغة صارمة أولاً
      let m = moment(s, formats, true);
      if (m.isValid()) {
        return m;
      }
      // ثم بدون strict
      m = moment(s, formats, false);
      if (m.isValid()) {
        return m;
      }
      // أخيراً اعتمد parsing الافتراضي
      m = moment(s);
      return m.isValid() ? m : moment();
    }
    return moment();
  };

  const initial = parseToMoment(value);
  const [selectedDate, setSelectedDate] = useState(initial);
  const [currentMonth, setCurrentMonth] = useState(initial.clone());
  const [viewMode, setViewMode] = useState("days"); // days, months, years

  // مزامنة عندما تتغير القيمة من الخارج
  useEffect(() => {
    const m = parseToMoment(value);
    setSelectedDate(m);
    setCurrentMonth(m.clone());
  }, [value]);

  const startOfMonth = currentMonth.clone().startOf("month");
  const endOfMonth = currentMonth.clone().endOf("month");

  const prevMonth = () => !disabled && setCurrentMonth(currentMonth.clone().subtract(1, "month"));
  const nextMonth = () => !disabled && setCurrentMonth(currentMonth.clone().add(1, "month"));

  // الآن نستقبل moment كامل بدل رقم اليوم
  const selectDay = dayMoment => {
    if (disabled) {
      return;
    }
    const date = dayMoment.clone();
    setSelectedDate(date);
    setCurrentMonth(date.clone());
    if (onChange) {
      onChange(date.format("YYYY-MM-DD"));
    }
  };

  const selectMonth = monthIndex => {
    if (disabled) {
      return;
    }
    setCurrentMonth(currentMonth.clone().month(monthIndex));
    setViewMode("days");
  };

  const selectYear = year => {
    if (disabled) {
      return;
    }
    setCurrentMonth(currentMonth.clone().year(year));
    setViewMode("days");
  };

  const generateDays = () => {
    const days = [];
    const startDay = startOfMonth.clone().startOf("week");
    const endDay = endOfMonth.clone().endOf("week");
    const date = startDay.clone();
    while (date.isSameOrBefore(endDay, "day")) {
      days.push(date.clone());
      date.add(1, "day");
    }
    return days;
  };

  // Localized months and days (كما عندك)
  const months =
    lang === "ar"
      ? [
          "يناير",
          "فبراير",
          "مارس",
          "أبريل",
          "مايو",
          "يونيو",
          "يوليو",
          "أغسطس",
          "سبتمبر",
          "أكتوبر",
          "نوفمبر",
          "ديسمبر",
        ]
      : moment.months();

  const daysShort =
    lang === "ar"
      ? ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const years = Array.from({ length: 2100 - 1900 + 1 }, (_, i) => 1900 + i);

  const min = minDate ? moment(minDate) : null;
  const max = maxDate ? moment(maxDate) : null;

  return (
    <div
      className={`max-w-md bg-white p-4 rounded-lg border w-full text-[0.75rem] max-h-[350px] border-gray h-fit flex flex-col 
        ${disabled ? "opacity-50 pointer-events-none select-none" : ""}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3 h-[40px]">
        <div className="flex gap-2 font-semibold text-gray-700">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setViewMode(viewMode === "years" ? "days" : "years")}
            className="flex items-center gap-1 disabled:cursor-not-allowed"
          >
            {currentMonth.year()}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setViewMode(viewMode === "months" ? "days" : "months")}
            className="flex items-center gap-1 disabled:cursor-not-allowed"
          >
            {months[currentMonth.month()]}
            <img
              src={Arrow}
              alt="toggle months"
              className={`w-3 h-3 transition-transform duration-200 ${
                viewMode === "months" ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </div>
        <div className="flex gap-2">
          <div onClick={prevMonth} className={disabled ? "cursor-not-allowed" : "cursor-pointer"}>
            <img src={ChevronRight} alt="prev" className="w-5 h-5" />
          </div>
          <div onClick={nextMonth} className={disabled ? "cursor-not-allowed" : "cursor-pointer"}>
            <img src={ChevronLeft} alt="next" className="w-5 h-5" />
          </div>
        </div>
      </div>

      {viewMode === "days" && (
        <div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2 text-accent font-normal">
            {daysShort.map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center flex-1">
            {generateDays().map(day => {
              const isSelected = day.isSame(selectedDate, "day");
              const isOtherMonth = day.month() !== currentMonth.month();
              const isDisabled =
                (min && day.isBefore(min, "day")) || (max && day.isAfter(max, "day"));
              const isToday = day.isSame(today, "day");

              return (
                <div
                  key={day.format("DD-MM-YYYY")}
                  onClick={() => !isDisabled && !disabled && selectDay(day)}
                  className={`
                    flex items-center justify-center w-full h-full aspect-square rounded-full 
                    transition-colors duration-200
                    ${isToday && !isSelected ? "border border-primary" : ""}
                    ${isSelected ? "border border-primary text-white bg-primary" : ""}
                    ${isDisabled ? "text-gray-300 opacity-50 cursor-not-allowed" : ""}
                    ${
                      !isSelected && !isDisabled && !disabled
                        ? "hover:bg-primary hover:text-white cursor-pointer"
                        : ""
                    }
                    ${isOtherMonth ? "text-gray-300" : ""}`}
                >
                  {day.date()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "months" && (
        <div className="grid grid-cols-3 gap-2 flex-1">
          {months.map((m, i) => {
            const isSelected = i === currentMonth.month();

            return (
              <button
                type="button"
                key={m}
                onClick={() => selectMonth(i)}
                disabled={disabled}
                className={`rounded-lg py-2 w-full transition-colors duration-200 ${
                  isSelected ? "border border-primary text-white bg-primary" : "bg-gray-100"
                } ${!isSelected && !disabled ? "hover:bg-primary hover:text-white" : ""} ${
                  disabled ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      )}

      {viewMode === "years" && (
        <div className="grid grid-cols-4 gap-2 flex-1 overflow-y-auto max-h-full">
          {years.map(y => {
            const isSelected = y === currentMonth.year();
            const isDisabled = (min && y < min.year()) || (max && y > max.year());

            return (
              <button
                type="button"
                key={y}
                onClick={() => !isDisabled && !disabled && selectYear(y)}
                disabled={isDisabled || disabled}
                className={`rounded-lg py-2 w-full transition-colors duration-200 ${
                  isSelected ? "border border-primary text-white bg-primary" : "bg-gray-100"
                } ${isDisabled || disabled ? "text-gray-300 opacity-50 cursor-not-allowed" : ""} ${
                  !isSelected && !isDisabled && !disabled ? "hover:bg-primary hover:text-white" : ""
                }`}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;

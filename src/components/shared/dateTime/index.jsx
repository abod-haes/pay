/* eslint-disable indent */
/* eslint-disable complexity */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-key */
import React, { useState, useEffect } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import moment from "moment";
import "react-multi-date-picker/styles/layouts/mobile.css";
import "react-multi-date-picker/styles/colors/green.css";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { useClickAway } from "@uidotdev/usehooks";
import { useTranslation } from "react-i18next";
import Calender from "@assets/svgs/common/calendar.svg";
import gregorian_ar from "react-date-object/locales/arabic_en";

const DateTimeField = ({
  otherInputStyle,
  disable,
  error,
  width,
  value,
  onChange,
  icon,
  type = "datetime",
  autoComplete,
  disablePastDates,
  max,
  min,
  label,
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const { i18n, t } = useTranslation();
  const getCalendar = () => {
    return {
      name: "gregorian",
      months: [
        [t("calendar.january"), t("calendar.jan")],
        [t("calendar.february"), t("calendar.feb")],
        [t("calendar.march"), t("calendar.mar")],
        [t("calendar.april"), t("calendar.apr")],
        [t("calendar.may"), t("calendar.may")],
        [t("calendar.june"), t("calendar.jun")],
        [t("calendar.july"), t("calendar.jul")],
        [t("calendar.august"), t("calendar.aug")],
        [t("calendar.september"), t("calendar.sep")],
        [t("calendar.october"), t("calendar.oct")],
        [t("calendar.november"), t("calendar.nov")],
        [t("calendar.december"), t("calendar.dec")],
      ],
      weekDays: [
        [t("calendar.sunday"), t("calendar.sun")],
        [t("calendar.monday"), t("calendar.mon")],
        [t("calendar.tuesday"), t("calendar.tue")],
        [t("calendar.wednesday"), t("calendar.wed")],
        [t("calendar.thursday"), t("calendar.thu")],
        [t("calendar.friday"), t("calendar.fri")],
        [t("calendar.saturday"), t("calendar.sat")],
      ],
      digits:
        i18n.language === "ar"
          ? ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]
          : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      meridiems:
        i18n.language === "ar"
          ? [
              ["ص", "ص"],
              ["م", "م"],
            ]
          : [
              ["AM", "am"],
              ["PM", "pm"],
            ],
    };
  };
  const getInitialValue = val => {
    if (!val) {
      return null;
    }
    if (type === "time") {
      const today = moment().format("YYYY-MM-DD");
      return new DateObject({ date: `${today} ${val}` });
    }
    return new DateObject({ date: val });
  };

  const [internalValue, setInternalValue] = useState(getInitialValue(value));
  const [currentCalendar, setCurrentCalendar] = useState(getCalendar());
  useEffect(() => {
    setInternalValue(getInitialValue(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    setCurrentCalendar(getCalendar());
  }, [i18n.language, t]);

  const ref = useClickAway(() => setOpen(false));

  const handleChange = dateObj => {
    setInternalValue(dateObj);

    if (!onChange) {
      return;
    }

    if (!dateObj) {
      onChange(null);
      return;
    }

    if (type === "time") {
      onChange(dateObj.format("HH:mm"));
    } else if (type === "date") {
      // always return ISO string
      onChange(dateObj.format("YYYY-MM-DD"));
    } else {
      onChange(dateObj.format("YYYY-MM-DD HH:mm"));
    }
    setOpen(false);
  };

  const disabledDates = disablePastDates ? { to: new DateObject().subtract(1, "days") } : undefined;

  return (
    <div className={`flex flex-col ${width ? `w-[${width}]` : "w-full"}`}>
      {label && <label className={`text-sm gray-color mb-1 font-main `}>{label}</label>}

      <div className="relative w-full">
        <DatePicker
          value={internalValue}
          onChange={handleChange}
          maxDate={max}
          minDate={min}
          format={type === "time" ? "HH:mm" : type === "date" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm"}
          inputClass={`
            w-full
            px-4
            py-3
            rounded-[8px]
            focus:outline-none
            border border-accent
            placeholder:text-accent
            text-[0.87rem]
            focus:ring-primary
            focus:ring-1
            transition-all duration-300
            ${disable ? "bg-gray-100 cursor-not-allowed" : ""}
            ${error ? "border-red-500!" : ""}
            ${icon ? "pe-10" : ""}
            ${otherInputStyle}}
          `}
          rtl={i18n.language === "ar"}
          locale={i18n.language === "ar" ? gregorian_ar : undefined}
          weekStartDayIndex={6}
          editable={!disable}
          disabled={disable}
          months={currentCalendar.months}
          weekDays={currentCalendar.weekDays}
          open={disable ? false : open}
          onOpen={() => !disable && setOpen(true)}
          calendarClassName="my-custom-datetime"
          containerClassName="my-custom-datetime"
          disabledDays={disabledDates}
          disableDayPicker={type === "time"}
          onClose={() => setOpen(false)}
          ref={ref}
          plugins={
            type === "time"
              ? [<TimePicker position="bottom" hideSeconds />]
              : type === "datetime"
              ? [<TimePicker position="bottom" hideSeconds />]
              : []
          }
          showOtherDays
          autoComplete={autoComplete}
          {...rest}
        />

        {icon && (
          <div
            className={`absolute ${
              i18n.language === "en" ? "right-3" : "left-3"
            } top-1/2 transform -translate-y-1/2 pointer-events-none`}
          >
            <img src={icon} alt="icon" className="w-5 h-5" />
          </div>
        )}

        <div
          className={`absolute ${
            i18n.language === "en" ? "right-3" : "left-3"
          } top-1/2 transform -translate-y-1/2 ${
            rest.leftIconClickable ? "cursor-pointer" : "pointer-events-none"
          }`}
          onClick={rest.leftIconClickable ? rest.onLeftIconClick : undefined}
        >
          <img src={Calender} alt="leftIcon" className="w-5 h-5" />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default DateTimeField;

import React from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

function formatNumberWithCommas(value) {
  if (value === null || value === undefined) return "";
  const number = value.toString().replace(/,/g, "");
  if (isNaN(number)) return value;

  const parts = number.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

const Input = ({
  placeholder,
  otherInputStyle,
  labelStyle,
  label,
  disable,
  error,
  width,
  value,
  onChange,
  icon,
  type,
  control,
  leftIcon,
  variant,
  autoComplete,
  name,
  onKeyDown,
  isNumberWithCommas,
  ...rest
}) => {
  const handleChange = e => {
    let val = e.target.value;
    if (isNumberWithCommas) {
      val = val.replace(/,/g, "");
      if (!/^\d*\.?\d*$/.test(val)) return;
      onChange &&
        onChange({
          ...e,
          target: { ...e.target, value: val },
        });
      e.target.value = formatNumberWithCommas(val);
    } else {
      onChange && onChange(e);
    }
  };
  const { i18n } = useTranslation();
  const isRTL = ["ar", "fa"].includes(i18n.language);
  return (
    <div className={`flex flex-col ${width ? `w-[${width}]` : "w-full"}`}>
      {label && (
        <label className={`text-sm gray-color mb-1 font-main ${labelStyle}`}>{label}</label>
      )}

      <div className="relative w-full">
        {control && name ? (
          <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value, onBlur, ref } }) => {
              const formattedValue = isNumberWithCommas ? formatNumberWithCommas(value) : value;

              const handleFormattedChange = e => {
                let rawValue = e.target.value.replace(/,/g, "");
                if (isNumberWithCommas && !/^\d*\.?\d*$/.test(rawValue)) return;
                onChange(rawValue);
              };

              return (
                <input
                  {...rest}
                  ref={ref}
                  type={type}
                  name={name}
                  value={formattedValue}
                  onChange={handleFormattedChange}
                  onBlur={onBlur}
                  disabled={disable}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  onKeyDown={onKeyDown}
                  className={`
            text-[0.87rem]
                focus:ring-primary
          focus:ring-1
            rounded-[8px]
            focus:outline-none
            border border-accent
            placeholder:text-accent
            text-[0.87rem]
          focus:ring-primary
          focus:ring-1
          transition-all duration-300
          transition-all duration-300
            w-full p-3 rounded-[8px] focus:outline-none border border-accent
            ${disable ? "bg-gray-100 cursor-not-allowed" : ""}
            ${error ? "border-red-500!" : ""}
            ${icon ? "ps-10" : ""}
            ${otherInputStyle}}
          `}
                />
              );
            }}
          />
        ) : (
          <input
            value={isNumberWithCommas ? formatNumberWithCommas(value) : value}
            name={name}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disable}
            autoComplete={autoComplete}
            onKeyDown={onKeyDown}
            type={type}
            className={`
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
            ${icon ? "ps-10" : ""}
            ${otherInputStyle}}
          `}
            {...rest}
          />
        )}
        {icon && (
          <div
            className={`absolute ${
              isRTL ? "right-3" : "left-3"
            } top-1/2 transform -translate-y-1/2 pointer-events-none`}
          >
            <img src={icon} alt="icon" className="w-5 h-5" />
          </div>
        )}
        {leftIcon && (
          <div
            className={`absolute ${
              isRTL ? "left-3" : "right-3"
            } top-1/2 transform -translate-y-1/2 ${
              rest.leftIconClickable ? "cursor-pointer" : "pointer-events-none"
            }`}
            onClick={rest.leftIconClickable ? rest.onLeftIconClick : undefined}
          >
            <img src={leftIcon} alt="leftIcon" className="w-5 h-5" />
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1 text-start">{error}</p>}
    </div>
  );
};

export default Input;

import React, { useRef } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

const ColorPickerInput = ({
  name,
  control,
  label,
  labelStyle,
  placeholder,
  disable,
  error,
  otherInputStyle,
}) => {
  const colorInputRef = useRef(null);
  const { i18n } = useTranslation();
  const isRTL = ["ar", "fa"].includes(i18n.language);

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className={`text-sm gray-color mb-1 font-main ${labelStyle}`}>{label}</label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange, ref, onBlur } }) => (
          <div className="relative w-full">
            {/* Hidden color input positioned over the circle */}
            <input
              ref={colorInputRef}
              type="color"
              value={value || "#000000"}
              onChange={e => onChange(e.target.value)}
              className="absolute opacity-0 cursor-pointer"
              style={{
                [isRTL ? "right" : "left"]: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "20px",
                height: "20px",
                zIndex: 10,
              }}
              disabled={disable}
            />

            {/* Visual circle indicator */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-accent ${
                disable ? "cursor-not-allowed" : "cursor-pointer"
              } ${isRTL ? "right-3" : "left-3"}`}
              style={{ backgroundColor: value || "#000000" }}
              onClick={() => !disable && colorInputRef.current?.click()}
            />

            {/* Text input */}
            <input
              ref={ref}
              type="text"
              placeholder={placeholder}
              value={value || ""}
              onChange={e => onChange(e.target.value)}
              onBlur={onBlur}
              disabled={disable}
              className={`
                text-[0.87rem]
                w-full p-3 ps-12 
                rounded-[8px]
                border border-accent
                placeholder:text-accent
                focus:outline-none
                focus:ring-primary focus:ring-1
                transition-all duration-300
                ${disable ? "bg-gray-100 cursor-not-allowed" : ""}
                ${error ? "border-red-500!" : ""}
                ${otherInputStyle}
              `}
            />
          </div>
        )}
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default ColorPickerInput;

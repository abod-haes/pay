import React from "react";
import { Controller } from "react-hook-form";

const CheckboxField = ({ control, name, label, className = "", disabled }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={`flex items-center gap-2 cursor-pointer select-none ${className}`}>
          <div className="relative">
            <input
              type="checkbox"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              checked={field.value || false}
              onChange={e => field.onChange(e.target.checked)}
              disabled={disabled}
            />
            <div
              className={`w-[17px] h-[17px] rounded-[4px] transition-all duration-200 select-none ease-in-out p-0.5 ${
                field.value
                  ? "border border-primary bg-white"
                  : "border border-accent bg-white hover:border-primary"
              }`}
            >
              {field.value && <div className="w-full h-full bg-primary rounded-[4px]" />}
            </div>
          </div>
          {label && <span className="text-[0.87rem]">{label}</span>}
        </div>
      )}
    />
  );
};

export default CheckboxField;

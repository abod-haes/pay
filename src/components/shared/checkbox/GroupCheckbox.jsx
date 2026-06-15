import React from "react";

const GroupCheckbox = ({ checked, indeterminate, onChange, label, className = "", disabled }) => {
  return (
    <div className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <div
          className={`w-[17px] h-[17px] rounded-[4px] transition-all duration-200 ease-in-out relative p-0.5 ${
            checked || indeterminate
              ? "bg-white border border-primary"
              : "border border-accent bg-white hover:border-primary"
          }`}
        >
          {checked && <div className="w-full h-full bg-primary rounded-[4px]" />}
          {indeterminate && !checked && (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* <div className="w-3 h-0.5 bg-primary rounded-full" /> */}
            </div>
          )}
        </div>
      </div>
      {label && <span className="text-[0.78rem] select-none">{label}</span>}
    </div>
  );
};

export default GroupCheckbox;

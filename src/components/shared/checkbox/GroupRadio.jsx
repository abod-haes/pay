import React from "react";

const GroupRadio = ({ checked, onChange, label, className = "", name, value }) => {
  return (
    <div className={`flex items-center gap-3 cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="radio"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          checked={checked}
          onChange={onChange}
          name={name}
          value={value}
        />
        <div
          className={`w-[16px] h-[17px] rounded-full transition-all duration-200 ease-in-out relative p-0.5 ${
            checked
              ? "bg-white border border-primary"
              : "border border-accent bg-white hover:border-primary"
          }`}
        >
          {checked && (
            <div className="w-[9px] h-[9px] bg-primary rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>
      {label && <span className="text-[0.78rem] select-none">{label}</span>}
    </div>
  );
};

export default GroupRadio;

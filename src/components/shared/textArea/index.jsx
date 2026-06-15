import React from "react";

const TextAreaField = ({
  placeholder,
  otherTextAreaStyle,
  labelStyle,
  label,
  disable,
  error,
  width,
  value,
  onChange,
  name,
  rows = 4,
  ...rest
}) => {
  return (
    <div className={`flex flex-col ${width ? `w-[${width}]` : "w-full"}`}>
      {label && (
        <p className={` text-sm gray-color mb-1 font-din-regular-base ${labelStyle}`}>{label}</p>
      )}

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disable}
        rows={rows}
        name={name}
        className={`
          w-full
          px-4
          py-3
          focus:ring-primary
          focus:ring-1
          transition-all duration-300
          border-accent border
          rounded-lg
          focus:outline-none
          placeholder:text-accent
          resize-none
          ${disable ? "bg-gray-100 cursor-not-allowed" : ""}
          ${error ? "border-red-500" : ""}
          ${otherTextAreaStyle}}
        `}
        {...rest}
      />

      {error && <p className=" text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default TextAreaField;

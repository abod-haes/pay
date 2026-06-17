import React from "react";

export default function BorderedButton({
  text,
  onClick,
  type,
  otherStyle,
  border,
  textColor,
  disabled,
}) {
  const displayText = text === "طباعة المريض" ? "طباعة إضبارة مريض" : text;

  return (
    <button
      className={`bg-white  cursor-pointer  text-[0.75rem] ${otherStyle} ${border} ${textColor} px-[30px] py-[8px] rounded-full h-full`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {displayText}
    </button>
  );
}

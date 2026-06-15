import React from "react";

export default function DeleteButton({ text, onClick, type, otherStyle }) {
  return (
    <div
      className={`bg-error font-main  ${otherStyle} text-[0.75rem] cursor-pointer text-white px-[29px] py-[10px]  rounded-full`}
      onClick={onClick}
      type={type}
    >
      {text}
    </div>
  );
}

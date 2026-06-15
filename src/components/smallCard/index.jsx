import React from "react";

export default function SmallCard({ icon, title, text }) {
  return (
    <div className="py-[8px] px-[14px] flex items-center rounded-xl shadow-lg bg-white gap-4">
      <div className="px-2 py-2 rounded bg-primary">
        <img src={icon} alt="icon" className="w-[20px] h-[20px]" />
      </div>
      <div className="flex flex-col gap-2 pe-10">
        <p className="text-accent font-main text-[0.75rem]">{title}</p>
        <p className="text-primary font-main text-[1rem] font-bold">{text}</p>
      </div>
    </div>
  );
}

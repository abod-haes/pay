import React from "react";
import { useTranslation } from "react-i18next";
import Search from "@assets/svgs/common/search.svg";

export default function TableSearch({ value, onChange, placeholder }) {
  const { t } = useTranslation();

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center gap-4 border rounded-[8px] !px-2 border-gray h-[40px]">
        {!value && (
          <div className="inset-y-0 left-3 flex items-center pointer-events-none">
            <img src={Search} alt="search" />
          </div>
        )}
        {value && (
          <button
            onClick={() => onChange && onChange("")}
            className="cursor-pointer inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        <input
          type="text"
          value={value || ""}
          onChange={e => onChange && onChange(e.target.value)}
          placeholder={placeholder || t("common.search")}
          className="w-[90%] outline-none text-[0.9rem] placeholder:text-gray"
        />
      </div>
    </div>
  );
}

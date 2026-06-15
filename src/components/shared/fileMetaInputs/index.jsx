import DatePicker from "react-multi-date-picker";

const inputClassName =
  "h-[38px] rounded-full border border-[#E5E7EB] bg-white px-4 text-[0.75rem] outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-gray-50";

const normalizeDateValue = value => {
  if (!value) {
    return "";
  }

  if (typeof value?.format === "function") {
    return value.format("YYYY-MM-DD");
  }

  return String(value);
};

const FileMetaInputs = ({
  fileName,
  setFileName,
  fileDate,
  setFileDate,
  disabled = false,
  className = "",
  namePlaceholder = "اسم الملف",
  datePlaceholder = "تاريخ الملف",
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <input
        type="text"
        className={inputClassName}
        placeholder={namePlaceholder}
        value={fileName}
        onChange={event => setFileName(event.target.value)}
        disabled={disabled}
      />
      <DatePicker
        value={fileDate || ""}
        onChange={value => setFileDate(normalizeDateValue(value))}
        format="YYYY-MM-DD"
        calendarPosition="bottom-right"
        disabled={disabled}
        render={(value, openCalendar) => (
          <button
            type="button"
            className={`${inputClassName} min-w-[150px] text-start ${
              !value ? "text-gray-400" : "text-[#333]"
            }`}
            onClick={openCalendar}
            disabled={disabled}
          >
            {value || datePlaceholder}
          </button>
        )}
      />
    </div>
  );
};

export default FileMetaInputs;

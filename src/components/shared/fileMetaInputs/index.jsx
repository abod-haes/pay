const inputClassName =
  "h-[38px] rounded-full border border-[#E5E7EB] px-4 text-[0.75rem] outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-gray-50";

const FileMetaInputs = ({
  fileName,
  setFileName,
  fileDate,
  setFileDate,
  disabled = false,
  className = "",
  namePlaceholder = "اسم الملف",
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
      <input
        type="date"
        className={inputClassName}
        value={fileDate}
        onChange={event => setFileDate(event.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

export default FileMetaInputs;

/* eslint-disable complexity */
/* eslint-disable no-undef */
import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// أيقونات
import uploadIcon from "@/assets/svgs/file-uploader/document-upload.svg";
import trash from "@assets/svgs/table/trash.svg";
import pdf from "@assets/svgs/file-uploader/pdf.svg";
import word from "@assets/svgs/file-uploader/pdf.svg";
import excel from "@assets/svgs/file-uploader/pdf.svg";
import download from "@assets/svgs/file-uploader/document-download.svg";
import view from "@assets/svgs/table/e-eye.svg";
import Image from "@assets/svgs/file-uploader/image.svg";
import ApiInstance from "@/constants/api-instance";
import { handleBackendErrors } from "@/utils/helpers";
import { API_BASE_URL } from "@/constants/domain";
import FileMetaInputs from "@/components/shared/fileMetaInputs";
import BorderedButton from "@/components/shared/borderedButton";

const acceptedTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const getToday = () => new Date().toISOString().split("T")[0];

// helper: return file icon
const getFileIcon = type => {
  if (type?.includes("pdf")) {
    return <img src={pdf} alt="pdf" className="w-6 h-6" />;
  }
  if (type?.includes("word")) {
    return <img src={word} alt="word" className="w-6 h-6" />;
  }
  if (type?.includes("excel")) {
    return <img src={excel} alt="excel" className="w-6 h-6" />;
  }
  if (type?.startsWith("image")) {
    return <img src={Image} alt="img" className="w-6 h-6" />;
  }
  return <img src={Image} alt="file" className="w-6 h-6" />;
};

const FileUploader = ({
  maxFiles = 5,
  files = [],
  setFiles,
  disable,
  placeholder,
  removeFile,
  onExistingFileDelete,
  tableView = false,
}) => {
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [progresses, setProgresses] = useState({});
  const [deleting, setDeleting] = useState({}); // 🔹 نخزن حالة الحذف لكل ملف
  const [fileName, setFileName] = useState("");
  const [fileDate, setFileDate] = useState(getToday());
  const inputRef = useRef();
  const { i18n } = useTranslation();
  const isRTL = ["ar", "fa"].includes(i18n.language);
  const safeFiles = Array.isArray(files) ? files : [];

  const uploadFile = async (file, tempId, meta = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", meta.name || file.name);
    formData.append("date", meta.date || getToday());

    try {
      const res = await ApiInstance.post(`${API_BASE_URL}upload-temp-media`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: progressEvent => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgresses(prev => ({ ...prev, [tempId]: percent }));
        },
      });

      const { media_id, url } = res.data; // السيرفر رجع media_id

      setFiles(prevFiles =>
        prevFiles.map(f =>
          f.id === tempId
            ? {
                ...f,
                media_id: media_id, // فقط نخزن media_id
                url: url,
                uploading: false,
              }
            : f
        )
      );
    } catch (err) {
      setFiles(prevFiles => prevFiles.filter(f => f.id !== tempId));
    }
  };

  const deleteFile = async file => {
    if (onExistingFileDelete && file.media_id && !String(file.id).startsWith("temp-")) {
      onExistingFileDelete(file);
      setFiles(prev => prev.filter(f => f.media_id !== file.media_id));
      return;
    }

    if (!file.media_id) {
      // لو كان ملف لسا ما انرفع
      setFiles(prev => prev.filter(f => f.id !== file.id));
      removeFile?.(file);
      return;
    }

    setDeleting(prev => ({ ...prev, [file.media_id]: true }));

    try {
      await ApiInstance.delete(`${API_BASE_URL}media/${file.media_id}`);

      // إزالة الملف من القائمة
      setFiles(prev => prev.filter(f => f.media_id !== file.media_id));
    } catch (err) {
      handleBackendErrors({ error: err });
      setError("فشل حذف الملف");
    } finally {
      setDeleting(prev => {
        const copy = { ...prev };
        delete copy[file.media_id];
        return copy;
      });
    }
  };

  const handleOpenFileDialog = () => {
    if (disable) return;

    if (!fileName.trim()) {
      setError("يرجى إدخال اسم الملف");
      return;
    }

    if (!fileDate) {
      setError("يرجى إدخال تاريخ الملف");
      return;
    }

    setError("");
    inputRef.current.click();
  };

  const handleFiles = fileList => {
    const newFiles = Array.from(fileList);
    const validFiles = newFiles.filter(file => acceptedTypes.includes(file.type));
    if (!validFiles.length) {
      setError("نوع الملف غير مدعوم");
      return;
    }
    setError("");
    const metaName = fileName.trim();
    const metaDate = fileDate;
    const tempFiles = validFiles.map((file, i) => ({
      id: `temp-${Date.now()}-${i}`,
      name: metaName,
      date: metaDate,
      type: file.type,
      localFile: file,
      uploading: true,
    }));
    setFiles(prev => [...prev, ...tempFiles]);
    validFiles.forEach((file, i) => uploadFile(file, tempFiles[i].id, tempFiles[i]));
    setFileName("");
    setFileDate(getToday());
  };

  const onFileChange = e => {
    const selectedFiles = Array.from(e.target.files);

    if (safeFiles.length + selectedFiles.length > maxFiles) {
      setError(`لا يمكنك رفع أكثر من ${maxFiles} ملفات`);
      return;
    }
    handleFiles(e.target.files);
    e.target.value = null;
  };

  const downloadFile = async file => {
    try {
      const response = await fetch(file.url, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = file.name || "file";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download file", err);
    }
  };

  const renderFileActions = file => {
    const isUploading = file.uploading;

    return (
      <div className="flex items-center justify-center gap-1">
        <button type="button" onClick={() => downloadFile(file)} disabled={isUploading}>
          <img src={download} alt="download" className="w-4 h-4 cursor-pointer" />
        </button>

        <button
          type="button"
          disabled={isUploading || !file.url}
          onClick={() => window.open(file.url, "_blank")}
          className={`p-1 cursor-pointer rounded ${isUploading ? "opacity-40" : "hover:bg-gray-200"}`}
        >
          <img src={view} alt="view" className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={isUploading || deleting[file.media_id]}
          onClick={() => deleteFile(file)}
          className={`p-1 cursor-pointer rounded ${
            isUploading || deleting[file.media_id] ? "opacity-40 cursor-not-allowed" : "hover:bg-red-100"
          }`}
        >
          {deleting[file.media_id] ? (
            <svg
              className="animate-spin h-4 w-4 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            <img src={trash} alt="delete" className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  };

  const hiddenFileInput = (
    <input
      type="file"
      ref={inputRef}
      className="hidden"
      multiple={maxFiles > 1}
      accept={acceptedTypes.join(",")}
      onChange={onFileChange}
      disabled={disable}
    />
  );

  if (tableView) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="flex flex-col gap-3">
        {hiddenFileInput}

        <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
          <table className="min-w-full text-right text-[0.75rem]">
            <thead className="bg-[#F9FAFB] text-accent">
              <tr>
                <th className="px-3 py-3 font-main">#</th>
                <th className="px-3 py-3 font-main">اسم الملف</th>
                <th className="px-3 py-3 font-main">التاريخ</th>
                <th className="px-3 py-3 text-center font-main">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {safeFiles.length ? (
                safeFiles.map((file, idx) => {
                  const progress = progresses[file.id] || 0;
                  const isUploading = file.uploading;

                  return (
                    <tr key={(file.id || file.name) + idx} className="border-t border-[#E5E7EB]">
                      <td className="px-3 py-3 text-[#333]">{idx + 1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-[#333]">{file.name || "-"}</span>
                            {isUploading && (
                              <span className="text-[0.65rem] text-primary">جاري الرفع {progress}%</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[#333]">{file.date || "-"}</td>
                      <td className="px-3 py-3">{renderFileActions(file)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-accent">
                    لا توجد ملفات مرفقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-dashed border-[#C9D3DD] bg-[#F9FAFB] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FileMetaInputs
              fileName={fileName}
              setFileName={setFileName}
              fileDate={fileDate}
              setFileDate={setFileDate}
              disabled={disable}
            />
            <BorderedButton
              text="إضافة ملف"
              border="border border-primary"
              textColor="text-primary"
              onClick={handleOpenFileDialog}
              disabled={disable}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      {hiddenFileInput}

      <FileMetaInputs
        fileName={fileName}
        setFileName={setFileName}
        fileDate={fileDate}
        setFileDate={setFileDate}
        disabled={disable}
        className="mb-3"
      />

      <div
        onClick={handleOpenFileDialog}
        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer ${
          disable ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"
        }`}
      >
        <img src={uploadIcon} alt="upload" className="w-8 h-8 mx-auto mb-2 opacity-60" />
        <p className="text-gray-400 text-sm">{placeholder || "اضغط لإرفاق ملف"}</p>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <AnimatePresence>
          {safeFiles.map((file, idx) => {
            const progress = progresses[file.id] || 0;
            const isUploading = file.uploading;
            return (
              <motion.div
                key={(file.id || file.name) + idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative bg-gray-100 rounded-lg border border-gray-200 overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-1 h-4 w-4">{getFileIcon(file.type)}</div>

                  {/* اسم الملف */}
                  <div className="flex flex-1 flex-col truncate mx-2">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    {file.date && <span className="text-[0.65rem] text-gray-500">{file.date}</span>}
                  </div>

                  {/* أزرار */}
                  <div className="flex items-center gap-1">{renderFileActions(file)}</div>
                </div>

                {/* progress bar كخط تحت الكارت */}
                {isUploading && (
                  <div className="h-1 bg-gray-300 w-full">
                    <div
                      className="h-1 bg-red-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* معاينة الصورة */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setPreviewImage(null)}
          >
            <img src={previewImage} alt="preview" className="max-h-[80vh] max-w-[90vw]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader;

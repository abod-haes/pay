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
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const getToday = () => new Date().toISOString().split("T")[0];

const normalizeUploadLabel = value => {
  const text = String(value || "").trim();
  const englishUploadLabels = ["upload file", "upload files", "add file", "add files"];

  if (!text || englishUploadLabels.includes(text.toLowerCase())) {
    return "إضافة ملف";
  }

  return text;
};

const isAllowedFileType = file => {
  if (!file?.type) return true;
  return acceptedTypes.includes(file.type) || file.type.startsWith("image/");
};

// helper: return file icon
const getFileIcon = type => {
  if (type?.includes("pdf")) {
    return <img src={pdf} alt="pdf" className="h-5 w-5" />;
  }
  if (type?.includes("word")) {
    return <img src={word} alt="word" className="h-5 w-5" />;
  }
  if (type?.includes("excel")) {
    return <img src={excel} alt="excel" className="h-5 w-5" />;
  }
  if (type?.startsWith("image")) {
    return <img src={Image} alt="image" className="h-5 w-5" />;
  }
  return <img src={Image} alt="file" className="h-5 w-5" />;
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
  readOnly = false,
}) => {
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [progresses, setProgresses] = useState({});
  const [deleting, setDeleting] = useState({}); // 🔹 نخزن حالة الحذف لكل ملف
  const [fileName, setFileName] = useState("");
  const [fileDate, setFileDate] = useState(getToday());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const inputIdRef = useRef(`file-upload-${Math.random().toString(36).slice(2)}`);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { i18n } = useTranslation();
  const isRTL = ["ar", "fa"].includes(i18n.language);
  const safeFiles = Array.isArray(files) ? files : [];
  const uploadButtonText = normalizeUploadLabel(placeholder);

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
      setError("فشل رفع الملف");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStream(null);
    setIsCameraOpen(false);
  };

  const openCamera = async event => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    if (disable || readOnly) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("الكاميرا غير مدعومة على هذا المتصفح");
      return;
    }

    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play?.();
        }
      }, 0);
    } catch (err) {
      console.error("Failed to open camera", err);
      setError("تعذر فتح الكاميرا، تأكد من السماح للمتصفح باستخدام الكاميرا");
    }
  };

  const captureCameraPhoto = event => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setError("تعذر التقاط الصورة");
      return;
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      blob => {
        if (!blob) {
          setError("تعذر حفظ الصورة الملتقطة");
          return;
        }

        const imageFile = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
        setSelectedFiles([imageFile]);
        stopCamera();
      },
      "image/jpeg",
      0.92
    );
  };

  const deleteFile = async file => {
    if (readOnly) return;

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

  const resetDialog = () => {
    setFileName("");
    setFileDate(getToday());
    setSelectedFiles([]);
    stopCamera();
  };

  const openAddDialog = event => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    if (disable || readOnly) return;

    setError("");
    resetDialog();
    setIsAddDialogOpen(true);
  };

  const closeAddDialog = event => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    setIsAddDialogOpen(false);
    setError("");
    resetDialog();
  };

  const handleFiles = fileList => {
    const newFiles = Array.from(fileList || []);

    if (!newFiles.length) {
      setError("يرجى اختيار ملف أو التقاط صورة");
      return false;
    }

    if (safeFiles.length + newFiles.length > maxFiles) {
      setError(`لا يمكنك رفع أكثر من ${maxFiles} ملفات`);
      return false;
    }

    const hasUnsupportedFile = newFiles.some(file => !isAllowedFileType(file));

    if (hasUnsupportedFile) {
      setError("نوع الملف غير مدعوم");
      return false;
    }

    setError("");
    const metaName = fileName.trim();
    const metaDate = fileDate;
    const tempFiles = newFiles.map((file, i) => ({
      id: `temp-${Date.now()}-${i}`,
      name: metaName,
      date: metaDate,
      type: file.type,
      localFile: file,
      uploading: true,
    }));

    setFiles(prev => [...prev, ...tempFiles]);
    newFiles.forEach((file, i) => uploadFile(file, tempFiles[i].id, tempFiles[i]));
    resetDialog();
    return true;
  };

  const handleConfirmAddFile = event => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    if (!fileName.trim()) {
      setError("يرجى إدخال اسم الملف");
      return;
    }

    if (!fileDate) {
      setError("يرجى إدخال تاريخ الملف");
      return;
    }

    const uploaded = handleFiles(selectedFiles);

    if (uploaded) {
      setIsAddDialogOpen(false);
    }
  };

  const handleDialogFileChange = event => {
    stopCamera();
    setSelectedFiles(Array.from(event.target.files || []));
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
    const actionButtonClass =
      "flex h-8 w-8 items-center justify-center rounded-full border border-[#E4EAF0] bg-white transition hover:bg-[#F5F7FA] disabled:cursor-not-allowed disabled:opacity-40";

    return (
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          title="تحميل الملف"
          aria-label="تحميل الملف"
          onClick={() => downloadFile(file)}
          disabled={isUploading || !file.url}
          className={actionButtonClass}
        >
          <img src={download} alt="تحميل" className="h-4 w-4" />
        </button>

        <button
          type="button"
          title="عرض الملف"
          aria-label="عرض الملف"
          disabled={isUploading || !file.url}
          onClick={() => window.open(file.url, "_blank")}
          className={actionButtonClass}
        >
          <img src={view} alt="عرض" className="h-4 w-4" />
        </button>

        {!readOnly && (
          <button
            type="button"
            title="حذف الملف"
            aria-label="حذف الملف"
            disabled={isUploading || deleting[file.media_id]}
            onClick={() => deleteFile(file)}
            className={`${actionButtonClass} hover:border-red-100 hover:bg-red-50`}
          >
            {deleting[file.media_id] ? (
              <svg
                className="h-4 w-4 animate-spin text-red-500"
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
              <img src={trash} alt="حذف" className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    );
  };

  const renderFilesTable = () => (
    <div className="overflow-hidden rounded-[18px] border border-[#E4EAF0] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-right text-[0.78rem]">
          <thead className="bg-[#F6F8FB] text-[#9AA3AF]">
            <tr>
              <th className="w-[70px] px-4 py-3 font-main">#</th>
              <th className="px-4 py-3 font-main">اسم الملف</th>
              <th className="w-[170px] px-4 py-3 font-main">التاريخ</th>
              <th className="w-[170px] px-4 py-3 text-center font-main">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {safeFiles.length ? (
              safeFiles.map((file, idx) => {
                const progress = progresses[file.id] || 0;
                const isUploading = file.uploading;

                return (
                  <tr
                    key={(file.id || file.name) + idx}
                    className="border-t border-[#EEF2F6] transition hover:bg-[#FAFBFC]"
                  >
                    <td className="px-4 py-3 text-[#6B7280]">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F7FAFC]">
                          {getFileIcon(file.type)}
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-main text-[0.82rem] text-[#2F3747]">
                            {file.name || "غير محدد"}
                          </span>
                          {isUploading && (
                            <span className="mt-1 text-[0.65rem] text-primary">جاري الرفع {progress}%</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{file.date || "غير محدد"}</td>
                    <td className="px-4 py-3">{renderFileActions(file)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#A0A8B2]">
                  لا توجد ملفات مرفقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAddFileDialog = () => (
    <AnimatePresence>
      {isAddDialogOpen && !readOnly && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeAddDialog}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-[540px] rounded-[24px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
            onClick={event => event.stopPropagation()}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className="mb-5 flex items-start justify-between gap-3 border-b border-[#EEF2F6] pb-4">
              <div>
                <h3 className="font-main text-[1.05rem] text-[#2F3747]">إضافة ملف جديد</h3>
                <p className="mt-1 text-[0.72rem] text-[#9AA3AF]">
                  اختر ملفًا من الجهاز أو افتح الكاميرا والتقط صورة
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-accent transition hover:bg-[#F7FAFC]"
                onClick={closeAddDialog}
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <FileMetaInputs
                fileName={fileName}
                setFileName={setFileName}
                fileDate={fileDate}
                setFileDate={setFileDate}
                disabled={disable}
                className="w-full"
              />

              <div className="rounded-[18px] border border-dashed border-[#C9D3DD] bg-[#F8FAFC] p-5 text-center transition hover:border-primary/60">
                <input
                  id={inputIdRef.current}
                  type="file"
                  className="hidden"
                  multiple={maxFiles > 1}
                  accept={acceptedTypes.join(",")}
                  onChange={handleDialogFileChange}
                  disabled={disable}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <label
                    htmlFor={inputIdRef.current}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border border-white bg-white p-4 shadow-sm transition hover:border-primary/40 ${
                      disable ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC] shadow-sm">
                      <img src={uploadIcon} alt="رفع ملف" className="h-6 w-6 opacity-70" />
                    </span>
                    <span className="font-main text-[0.82rem] text-[#2F3747]">اختيار ملف</span>
                    <span className="text-[0.68rem] text-[#9AA3AF]">PDF, Word, Excel, Images</span>
                  </label>

                  <button
                    type="button"
                    onClick={openCamera}
                    disabled={disable}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border border-white bg-white p-4 shadow-sm transition hover:border-primary/40 ${
                      disable ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC] text-[1.35rem] shadow-sm">
                      📷
                    </span>
                    <span className="font-main text-[0.82rem] text-[#2F3747]">فتح الكاميرا</span>
                    <span className="text-[0.68rem] text-[#9AA3AF]">التقاط صورة مباشرة</span>
                  </button>
                </div>

                {isCameraOpen && (
                  <div className="mt-4 rounded-[16px] border border-[#E4EAF0] bg-white p-3">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="max-h-[280px] w-full rounded-[14px] bg-black object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={captureCameraPhoto}
                        className="rounded-full bg-primary px-6 py-2 text-[0.75rem] font-bold text-white"
                      >
                        التقاط الصورة
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="rounded-full border border-[#D5DCE5] px-6 py-2 text-[0.75rem] text-accent"
                      >
                        إغلاق الكاميرا
                      </button>
                    </div>
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <span className="mt-4 inline-block max-w-full truncate rounded-full bg-white px-3 py-1 text-[0.72rem] text-primary">
                    {selectedFiles.map(file => file.name || "صورة ملتقطة").join("، ")}
                  </span>
                )}
              </div>

              {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-full border border-[#D5DCE5] px-7 py-2.5 text-[0.78rem] text-accent transition hover:bg-[#F7FAFC]"
                  onClick={closeAddDialog}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="rounded-full bg-primary px-8 py-2.5 text-[0.78rem] font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:bg-gray-300"
                  onClick={handleConfirmAddFile}
                  disabled={disable}
                >
                  إضافة الملف
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (tableView) {
    return (
      <div dir={isRTL ? "rtl" : "ltr"} className="flex flex-col gap-3">
        {renderAddFileDialog()}
        {renderFilesTable()}

        {!readOnly && (
          <div className="flex justify-start">
            <BorderedButton
              type="button"
              text={uploadButtonText}
              border="border border-primary"
              textColor="text-primary"
              otherStyle="min-w-[150px] !px-7 !py-2.5 transition hover:bg-primary hover:!text-white"
              onClick={openAddDialog}
              disabled={disable}
            />
          </div>
        )}

        {error && !isAddDialogOpen && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="w-full">
      {renderAddFileDialog()}

      {!readOnly && (
        <div className="mb-4 flex justify-start">
          <BorderedButton
            type="button"
            text={uploadButtonText}
            border="border border-primary"
            textColor="text-primary"
            otherStyle="min-w-[150px] !px-7 !py-2.5 transition hover:bg-primary hover:!text-white"
            onClick={openAddDialog}
            disabled={disable}
          />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
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
                className="relative overflow-hidden rounded-[16px] border border-[#E4EAF0] bg-white shadow-sm transition hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7FAFC]">
                    {getFileIcon(file.type)}
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col text-right">
                    <span className="truncate font-main text-[0.88rem] text-[#2F3747]">
                      {file.name || "غير محدد"}
                    </span>
                    <span className="mt-1 text-[0.68rem] text-[#9AA3AF]">
                      {file.date ? `تاريخ الملف: ${file.date}` : "لا يوجد تاريخ"}
                    </span>
                  </div>

                  <div className="shrink-0">{renderFileActions(file)}</div>
                </div>

                {/* progress bar كخط تحت الكارت */}
                {isUploading && (
                  <div className="h-1 w-full bg-gray-200">
                    <div
                      className="h-1 bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {error && !isAddDialogOpen && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {/* معاينة الصورة */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
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

import React, { useRef, useState } from "react";
import { showError, showSuccess } from "@/libs/react.toastify";
import BorderedButton from "../shared/borderedButton";
import ApiInstance from "@/constants/api-instance";
import { useTranslation } from "react-i18next";
import LoadingElement from "../shared/loading";
import FileMetaInputs from "@/components/shared/fileMetaInputs";
import uploadIcon from "@/assets/svgs/file-uploader/document-upload.svg";

const getToday = () => new Date().toISOString().split("T")[0];

const FileUploaderDetail = ({ id, refetch, readOnly = true }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileDate, setFileDate] = useState(getToday());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const allowedTypes = [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/plain", // .txt
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/gif",
    "image/webp",
    "image/heic",
    "image/heif",
  ];

  const isAllowedFileType = file => {
    if (!file?.type) return true;
    return allowedTypes.includes(file.type) || file.type.startsWith("image/");
  };

  if (readOnly) {
    return null;
  }

  const resetDialog = () => {
    setFileName("");
    setFileDate(getToday());
    setSelectedFile(null);
  };

  const openDialog = event => {
    event?.preventDefault?.();
    setIsDialogOpen(true);
  };

  const closeDialog = event => {
    event?.preventDefault?.();
    setIsDialogOpen(false);
    resetDialog();
  };

  const handleFileChange = event => {
    setSelectedFile(event.target.files?.[0] || null);
  };

  const handleUpload = async event => {
    event?.preventDefault?.();

    if (!fileName.trim()) {
      showError("يرجى إدخال اسم الملف");
      return;
    }

    if (!fileDate) {
      showError("يرجى إدخال تاريخ الملف");
      return;
    }

    if (!selectedFile) {
      showError("يرجى اختيار ملف أو التقاط صورة");
      return;
    }

    if (!isAllowedFileType(selectedFile)) {
      showError(
        `${t("error.invalid-file-type")}\n${t(
          "error.allowed-types"
        )}: pdf, word, excel, text, images`
      );
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", fileName.trim());
      formData.append("date", fileDate);

      const response = await ApiInstance.post(`/upload-temp-media/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccess(response?.data?.message);
      refetch?.();
      setIsDialogOpen(false);
      resetDialog();

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }
    } catch (error) {
      showError(t("error.upload-failed"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-start">
        <BorderedButton
          type="button"
          text={loading ? <LoadingElement size={15} color="#000" /> : "إضافة ملف"}
          border="border border-primary"
          textColor="text-primary"
          otherStyle="min-w-[150px] !px-7 !py-2.5 transition hover:bg-primary hover:!text-white"
          onClick={openDialog}
          disabled={loading}
        />
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            className="w-full max-w-[540px] rounded-[24px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
            dir="rtl"
          >
            <div className="mb-5 flex items-start justify-between gap-3 border-b border-[#EEF2F6] pb-4">
              <div>
                <h3 className="font-main text-[1.05rem] text-[#2F3747]">إضافة ملف جديد</h3>
                <p className="mt-1 text-[0.72rem] text-[#9AA3AF]">
                  اختر ملفًا من الجهاز أو التقط صورة بالكاميرا
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-accent transition hover:bg-[#F7FAFC]"
                onClick={closeDialog}
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
                disabled={loading}
              />

              <div className="rounded-[18px] border border-dashed border-[#C9D3DD] bg-[#F8FAFC] p-5 text-center transition hover:border-primary/60">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  disabled={loading}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-white bg-white p-4 shadow-sm transition hover:border-primary/40"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC] shadow-sm">
                      <img src={uploadIcon} alt="رفع ملف" className="h-6 w-6 opacity-70" />
                    </span>
                    <span className="font-main text-[0.82rem] text-[#2F3747]">اختيار ملف</span>
                    <span className="text-[0.68rem] text-[#9AA3AF]">PDF, Word, Excel, Images</span>
                  </button>

                  <button
                    type="button"
                    className="flex flex-col items-center justify-center gap-2 rounded-[16px] border border-white bg-white p-4 shadow-sm transition hover:border-primary/40"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={loading}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC] text-[1.35rem] shadow-sm">
                      📷
                    </span>
                    <span className="font-main text-[0.82rem] text-[#2F3747]">فتح الكاميرا</span>
                    <span className="text-[0.68rem] text-[#9AA3AF]">التقاط صورة مباشرة</span>
                  </button>
                </div>

                <p className="mt-4 text-[0.75rem] text-accent">
                  {selectedFile?.name || "لم يتم اختيار ملف أو صورة"}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-full border border-[#D5DCE5] px-7 py-2.5 text-[0.78rem] text-accent transition hover:bg-[#F7FAFC]"
                  onClick={closeDialog}
                  disabled={loading}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="rounded-full bg-primary px-8 py-2.5 text-[0.78rem] font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:bg-gray-300"
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? <LoadingElement size={15} color="#fff" /> : "إضافة الملف"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileUploaderDetail;

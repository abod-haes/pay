import React, { useRef, useState } from "react";
import { showError, showSuccess } from "@/libs/react.toastify";
import BorderedButton from "../shared/borderedButton";
import ApiInstance from "@/constants/api-instance";
import { useTranslation } from "react-i18next";
import LoadingElement from "../shared/loading";
import FileMetaInputs from "@/components/shared/fileMetaInputs";

const getToday = () => new Date().toISOString().split("T")[0];

const FileUploaderDetail = ({ id, refetch, readOnly = true }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
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
  ];

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
      showError("يرجى اختيار ملف");
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
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
    } catch (error) {
      showError(t("error.upload-failed"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BorderedButton
        type="button"
        text={loading ? <LoadingElement size={15} color="#000" /> : t("patient.add-file")}
        border={"border border-primary"}
        textColor={"text-primary"}
        onClick={openDialog}
        disabled={loading}
      />

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[520px] rounded-2xl bg-white p-5 shadow-xl" dir="rtl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-main text-[1rem] text-[#333]">إضافة ملف</h3>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] text-accent"
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

              <div className="rounded-xl border border-dashed border-[#C9D3DD] bg-[#F9FAFB] p-4 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="rounded-full border border-primary px-6 py-2 text-[0.75rem] text-primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  اختيار ملف
                </button>
                <p className="mt-2 text-[0.75rem] text-accent">
                  {selectedFile?.name || "لم يتم اختيار ملف"}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-full border border-[#E5E7EB] px-6 py-2 text-[0.75rem] text-accent"
                  onClick={closeDialog}
                  disabled={loading}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="rounded-full bg-primary px-6 py-2 text-[0.75rem] font-bold text-white disabled:bg-gray-300"
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? <LoadingElement size={15} color="#fff" /> : "إضافة"}
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

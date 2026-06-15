import React, { useRef, useState } from "react";
import { showError, showSuccess } from "@/libs/react.toastify";
import BorderedButton from "../shared/borderedButton";
import ApiInstance from "@/constants/api-instance";
import { useTranslation } from "react-i18next";
import LoadingElement from "../shared/loading";

const getToday = () => new Date().toISOString().split("T")[0];

const FileUploaderDetail = ({ id, refetch }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileDate, setFileDate] = useState(getToday());

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

  const handleClick = () => {
    if (!fileName.trim()) {
      showError("يرجى إدخال اسم الملف");
      return;
    }

    if (!fileDate) {
      showError("يرجى إدخال تاريخ الملف");
      return;
    }

    fileInputRef.current.click();
  };

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      showError(
        `${t("error.invalid-file-type")}\n${t(
          "error.allowed-types"
        )}: pdf, word, excel, text, images`
      );
      e.target.value = ""; // reset input
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", fileName.trim());
      formData.append("date", fileDate);

      const response = await ApiInstance.post(`/upload-temp-media/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccess(response?.data?.message);
      setFileName("");
      setFileDate(getToday());
      refetch();
    } catch (error) {
      showError(t("error.upload-failed"));
      console.error(error);
    } finally {
      setLoading(false);
      e.target.value = ""; // reset input بعد الرفع
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        className="h-[38px] rounded-full border border-[#E5E7EB] px-4 text-[0.75rem] outline-none focus:border-primary"
        placeholder="اسم الملف"
        value={fileName}
        onChange={event => setFileName(event.target.value)}
        disabled={loading}
      />
      <input
        type="date"
        className="h-[38px] rounded-full border border-[#E5E7EB] px-4 text-[0.75rem] outline-none focus:border-primary"
        value={fileDate}
        onChange={event => setFileDate(event.target.value)}
        disabled={loading}
      />
      <BorderedButton
        text={loading ? <LoadingElement size={15} color="#000" /> : t("patient.add-file")}
        border={"border border-primary"}
        textColor={"text-primary"}
        onClick={handleClick}
        disabled={loading}
      />

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
    </div>
  );
};

export default FileUploaderDetail;

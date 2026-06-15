import React, { useRef, useState } from "react";
import { showError, showSuccess } from "@/libs/react.toastify";
import BorderedButton from "../shared/borderedButton";
import ApiInstance from "@/constants/api-instance";
import { useTranslation } from "react-i18next";
import LoadingElement from "../shared/loading";

const FileUploaderDetail = ({ id, refetch }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

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

      const response = await ApiInstance.post(`/upload-temp-media/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccess(response?.data?.message);
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
    <div>
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

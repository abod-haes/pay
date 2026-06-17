import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import FileUploader from "@/components/shared/fileUploader";
import Card from "@/components/card";
import TitleOfSections from "../../titleOfSections";

const getFileDate = file => {
  if (file?.date) return file.date;
  if (file?.created_at) return String(file.created_at).split(" ")[0];
  if (file?.updated_at) return String(file.updated_at).split(" ")[0];
  return "";
};

const normalizeFile = file => ({
  id: file?.id || file?.media_id || file?.url,
  name: file?.name || file?.file_name || "-",
  date: getFileDate(file),
  type: file?.type || file?.mime_type,
  url: file?.url,
  uploading: Boolean(file?.uploading),
  media_id: file?.media_id || file?.id,
});

const uniqFiles = files => {
  const seen = new Set();

  return files.filter(file => {
    const key = file?.media_id || file?.id || file?.url || file?.name;

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const SurgeriesArchaive = ({
  beforeEyebrowFiles = [],
  afterThreadOpenFiles = [],
  afterSecondSessionFiles = [],
  afterFirstSessionFiles = [],
  afterEyebrowFiles = [],
}) => {
  const { t } = useTranslation();

  const operationFiles = useMemo(
    () =>
      uniqFiles([
        ...beforeEyebrowFiles,
        ...afterEyebrowFiles,
        ...afterThreadOpenFiles,
        ...afterFirstSessionFiles,
        ...afterSecondSessionFiles,
      ]).map(normalizeFile),
    [
      beforeEyebrowFiles,
      afterEyebrowFiles,
      afterThreadOpenFiles,
      afterFirstSessionFiles,
      afterSecondSessionFiles,
    ]
  );

  const [files, setFiles] = useState([]);

  useEffect(() => {
    setFiles(operationFiles);
  }, [operationFiles]);

  return (
    <div className="flex w-full flex-col gap-[16px] mt-[24px]">
      <TitleOfSections title={t("surgeries.surgeries-archaive")} />
      <Card otherStyle={"grid gap-[16px] !py-6 !px-6"}>
        <div className="grid gap-4">
          <p className="font-normal text-[0.9rem] leading-[125%]">ملفات العملية</p>
          <FileUploader
            files={files}
            setFiles={setFiles}
            removeFile={file => setFiles(prev => prev.filter(f => f.id !== file.id))}
            name="attachments_ids"
            placeholder="رفع ملف مع الاسم والتاريخ"
            maxFiles={20}
            tableView
            readOnly
          />
        </div>
      </Card>
    </div>
  );
};

export default SurgeriesArchaive;

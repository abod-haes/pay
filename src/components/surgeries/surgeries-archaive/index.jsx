import { useTranslation } from "react-i18next";
import TitleOfSections from "../titleOfSections";
import FileUploader from "@/components/shared/fileUploader";
import Card from "@/components/card";

const SurgeriesArchaive = ({
  control,
  files,
  setFiles,
  setDeleteAttachments,
  setBeforeEyebrowFiles,
  beforeEyebrowFiles,
}) => {
  const { t } = useTranslation();
  const attachments = files || beforeEyebrowFiles || [];
  const setAttachments = setFiles || setBeforeEyebrowFiles;

  return (
    <div className="flex flex-col gap-[16px] w-[40%]">
      <TitleOfSections title={t("surgeries.surgeries-archaive")} />
      <Card otherStyle={"grid gap-[16px] !py-6 !px-6"}>
        <div className="grid gap-4">
          <p className="font-normal text-[0.9rem] leading-[125%]">ملفات العملية</p>
          <FileUploader
            files={attachments}
            setFiles={setAttachments}
            removeFile={file => setAttachments(prev => prev.filter(f => f.id !== file.id))}
            onExistingFileDelete={file =>
              setDeleteAttachments?.(prev =>
                prev.includes(file.media_id) ? prev : [...prev, file.media_id]
              )
            }
            name="attachments_ids"
            control={control}
            placeholder="رفع ملف مع الاسم والتاريخ"
            maxFiles={20}
            tableView
          />
        </div>
      </Card>
    </div>
  );
};

export default SurgeriesArchaive;

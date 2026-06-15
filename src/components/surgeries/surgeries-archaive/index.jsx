import { useTranslation } from "react-i18next";
import TitleOfSections from "../titleOfSections";
import FileUploader from "@/components/shared/fileUploader";
import Card from "@/components/card";

const SurgeriesArchaive = ({
  control,
  setBeforeEyebrowFiles,
  beforeEyebrowFiles,
  afterThreadOpenFiles,
  setAfterThreadOpenFiles,
  afterSecondSessionFiles,
  setAfterSecondSessionFiles,
  afterFirstSessionFiles,
  setAfterFirstSessionFiles,
  setAfterEyebrowFiles,
  afterEyebrowFiles,
  title1,
  title2,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-[16px] w-[40%]">
      <TitleOfSections title={t("surgeries.surgeries-archaive")} />
      <Card otherStyle={"grid gap-[16px] !py-6 !px-6"}>
        <div className="grid gap-4">
          <p className="font-normal text-[0.9rem] leading-[125%]">{title1}</p>
          <FileUploader
            files={beforeEyebrowFiles}
            setFiles={setBeforeEyebrowFiles}
            removeFile={file => setBeforeEyebrowFiles(prev => prev.filter(f => f.id !== file.id))}
            name="before_eyebrow_transplant_id"
            control={control}
            placeholder={t("common.upload-image")}
            maxFiles={1}
          />
        </div>
        <div className="grid gap-4">
          <p className="font-normal text-[0.9rem] leading-[125%]">{title2}</p>
          <FileUploader
            files={afterEyebrowFiles}
            setFiles={setAfterEyebrowFiles}
            removeFile={file => setAfterEyebrowFiles(prev => prev.filter(f => f.id !== file.id))}
            name="after_eyebrow_transplant_id"
            control={control}
            placeholder={t("common.upload-image")}
            maxFiles={1}
          />
        </div>
        <div className="grid gap-4">
          <p className="font-normal text-[0.9rem] leading-[125%]">{t("surgeries.after-opening")}</p>
          <FileUploader
            files={afterThreadOpenFiles}
            setFiles={setAfterThreadOpenFiles}
            removeFile={file => setAfterThreadOpenFiles(prev => prev.filter(f => f.id !== file.id))}
            name="after_first_session_id"
            control={control}
            placeholder={t("common.upload-image")}
            maxFiles={1}
          />
        </div>
        <div className="grid gap-4">
          <p className="font-normal text-[0.9rem] leading-[125%]">{t("surgeries.after-meso")}</p>
          <FileUploader
            files={afterSecondSessionFiles}
            setFiles={setAfterSecondSessionFiles}
            removeFile={file =>
              setAfterSecondSessionFiles(prev => prev.filter(f => f.id !== file.id))
            }
            name="after_thread_open_id"
            control={control}
            placeholder={t("common.upload-image")}
            maxFiles={1}
          />
        </div>
        <div className="grid gap-4">
          <p className="font-normal text-[0.9rem] leading-[125%]">
            {t("surgeries.after-second-meso")}
          </p>
          <FileUploader
            files={afterFirstSessionFiles}
            setFiles={setAfterFirstSessionFiles}
            removeFile={file =>
              setAfterFirstSessionFiles(prev => prev.filter(f => f.id !== file.id))
            }
            name="after_second_session_id"
            control={control}
            placeholder={t("common.upload-image")}
            maxFiles={1}
          />
        </div>
      </Card>
    </div>
  );
};

export default SurgeriesArchaive;

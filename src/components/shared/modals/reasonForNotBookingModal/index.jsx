import React, { useEffect, useState, useMemo } from "react";
import Modal from "../modal";
import PrimaryButton from "../../primaryButton";
import SecondaryButton from "../../secondaryButton";
import SelectField from "../../select";
import TextArea from "../../textArea";
import FileUploader from "../../fileUploader";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import LoadingElement from "../../loading";
import { useReasonQueries } from "@/apis/reason/query";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
export default function ReasonForNotBookingModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const { t } = useTranslation();
  const validationSchema = yup.object().shape({
    reason_id: yup
      .object()
      .shape({
        label: yup.string().required(),
        value: yup.number().required(),
      })
      .nullable()
      .required(t("validation.required")),
  });
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      reason_id: null,
      notes: "",
      image_id: [],
    },
  });
  const [files, setFiles] = useState([]);
  const { data: reasonData, isLoading: isLoadingReasons } = useReasonQueries.GetAll({});
  useEffect(() => {
    if (isOpen) {
      reset({
        reason_id: null,
        notes: "",
        image_id: [],
      });
      setFiles([]);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    setValue("files", files);
  }, [files, setValue]);

  // const reasonOptions = [
  //   { value: "price", label: t("reasons.price") || "Price" },
  //   { value: "distance", label: t("reasons.distance") || "Distance" },
  //   { value: "availability", label: t("reasons.availability") || "Availability" },
  //   { value: "other", label: t("reasons.other") || "Other" },
  // ];
  const reasonOptions = useMemo(
    () =>
      reasonData?.data?.map(item => ({
        label: item.title,
        value: item.id,
      })) || [],
    [reasonData?.data]
  );
  const handleFormSubmit = data => {
    const payload = {
      reason_id: data.reason_id?.value,
      notes: data.notes,
      image_id: data.files?.[0]?.media_id,
    };
    onSubmit(payload);
  };

  return (
    <Modal open={isOpen}>
      <div className="bg-white w-full md:min-w-[500px] rounded-2xl shadow-lg relative flex flex-col gap-6 p-8">
        <h2 className="font-main text-xl font-bold text-center">
          {t("booking.add_reasons_for_not_booking")}
        </h2>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          <SelectField
            name="reason_id"
            control={control}
            options={reasonOptions}
            placeholder={t("common.choose")}
            label={t("common.reason")}
            loading={isLoadingReasons}
            error={errors?.reason_id?.message}
          />

          <TextArea
            name="notes"
            control={control}
            placeholder={t("common.notes")}
            label={t("common.notes")}
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("common.upload-image")}
            </label>
            <FileUploader
              files={files}
              setFiles={setFiles}
              maxFiles={1}
              placeholder={t("common.upload-image")}
            />
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <PrimaryButton
              type="submit"
              text={isSubmitting ? <LoadingElement size={18} /> : t("common.save")}
              disabled={isSubmitting}
            />
            <SecondaryButton
              onClick={onClose}
              text={t("common.cancel")}
              type="button"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
}

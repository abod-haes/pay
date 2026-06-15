import React from "react";
import Modal from "../modal";
import DeleteButton from "../../deleteButton";
import SecondaryButton from "../../secondaryButton";
import LoadingElement from "../../loading";
import TextAreaField from "../../textArea";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export default function CancelModal({
  isOpen,
  onClose,
  onDelete,
  title,
  warning,
  deleteText,
  cancelText,
  isSubmitting,
}) {
  const { t } = useTranslation();
  const { register, watch } = useForm({ defaultValues: { notes: "" } });

  return (
    <Modal open={isOpen}>
      <form className="bg-white w-full md:min-w-md rounded-2xl shadow-lg relative flex flex-col gap-6 justify-between h-full py-8 px-8">
        <p className="font-main text-error text-[1rem]">{title}</p>
        <p className="font-main text-[#333333] text-[0.875rem] w-[686px]">{warning}</p>

        <TextAreaField
          {...register("notes")}
          placeholder={t("booking.cancel-reason")}
          rows={3}
          label={t("booking.reason-for-cancellation")}
        />

        <div className="flex items-center  gap-4">
          <DeleteButton
            text={isSubmitting ? <LoadingElement size={18} /> : deleteText}
            type="button"
            onClick={() => onDelete(watch("notes"))}
          />
          <SecondaryButton onClick={onClose} text={cancelText} type="button" />
        </div>
      </form>
    </Modal>
  );
}

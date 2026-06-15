import React from "react";
import Modal from "../modal";
import PrimaryButton from "../../primaryButton";
import SecondaryButton from "../../secondaryButton";
import LoadingElement from "../../loading";
import ControlledTimeField from "../../controlledDatePicker";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export default function QiCardModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  return (
    <Modal open={isOpen}>
      <div className="bg-white w-[400px] rounded-2xl shadow-lg p-6 flex flex-col gap-6 relative">
        <p className="text-md font-bold text-center mb-4">{t("voucher.qiCardPayment")}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <ControlledTimeField
            name="date"
            control={control}
            placeholder={t("delayed.date")}
            label={t("delayed.date")}
          />
          <div className="flex items-center justify-center gap-4 mt-4">
            <PrimaryButton
              type="submit"
              text={isSubmitting ? <LoadingElement size={18} /> : t("common.add")}
            />
            <SecondaryButton onClick={onClose} text={t("common.cancel")} type="button" />
          </div>
        </form>
      </div>
    </Modal>
  );
}
